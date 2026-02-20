/**
 * Precision Vitality Intelligence Engine — Deterministic Scoring
 * No guessing. Missing data → reduced confidence. Contradictions → flagged.
 */
import { SUBSYSTEM_FIELDS, VITALITY_DATA_MAP } from './dataMap';
import type { Confidence, SubsystemScore, VitalityAssessment, VitalityFinding } from './types';

// ─── Helpers ───
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function completeness(fields: string[], data: Record<string, any>): number {
  const available = fields.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== '');
  return fields.length === 0 ? 0 : available.length / fields.length;
}

function confidenceFromCompleteness(c: number): Confidence {
  if (c >= 0.75) return 'high';
  if (c >= 0.5) return 'med';
  return 'low';
}

function getMissing(fields: string[], data: Record<string, any>): string[] {
  return fields.filter(f => data[f] === undefined || data[f] === null || data[f] === '');
}

function getUsed(fields: string[], data: Record<string, any>): string[] {
  return fields.filter(f => data[f] !== undefined && data[f] !== null && data[f] !== '');
}

// ─── Sleep Quality Score ───
function scoreSleep(d: Record<string, any>): number {
  let score = 50;
  const dur = d.sleep_duration_avg;
  if (dur === '7_8') score += 25;
  else if (dur === '8_plus') score += 20;
  else if (dur === '6_7') score += 10;
  else if (dur === '5_6') score -= 10;
  else if (dur === 'under_5') score -= 25;

  const qual = Number(d.sleep_quality);
  if (!isNaN(qual)) score += (qual - 3) * 10; // 1→-20, 3→0, 5→+20

  const wake = d.wake_during_night;
  if (wake === 'never') score += 10;
  else if (wake === '1x') score += 0;
  else if (wake === '2x_plus') score -= 10;
  else if (wake === 'often') score -= 20;

  if (d.screen_before_bed === 'yes') score -= 10;
  else if (d.screen_before_bed === 'no') score += 10;

  return clamp(score, 0, 100);
}

// ─── Circadian Stability Score ───
function scoreCircadian(d: Record<string, any>): number {
  let score = 50;

  // Sunlight anchoring
  if (d.sunlight_after_waking === 'yes') score += 15;
  else if (d.sunlight_after_waking === 'sometimes') score += 5;
  else if (d.sunlight_after_waking === 'no') score -= 10;

  // Wake alignment (desired vs actual)
  if (d.wake_time && d.desired_wake_time) {
    const actual = parseTimeToMinutes(d.wake_time);
    const desired = parseTimeToMinutes(d.desired_wake_time);
    if (actual !== null && desired !== null) {
      const drift = Math.abs(actual - desired);
      if (drift <= 30) score += 15;
      else if (drift <= 60) score += 5;
      else score -= 10;
    }
  }

  // Energy crash pattern
  if (d.energy_crash_time === 'no_crash') score += 10;
  else if (d.energy_crash_time === 'after_lunch') score -= 5;
  else if (d.energy_crash_time === 'morning') score -= 15;

  // Failure window
  if (d.failure_moment === 'late_night_spiral') score -= 10;
  else if (d.failure_moment === 'morning_start') score -= 5;

  return clamp(score, 0, 100);
}

// ─── Dopamine Load Score (inverted: higher load = lower score) ───
function scoreDopamine(d: Record<string, any>): number {
  let load = 0; // 0 = minimal load

  const screenMap: Record<string, number> = { under_30m: 0, '30_60m': 5, '1_2h': 15, '2_4h': 25, '4h_plus': 40 };
  load += screenMap[d.daily_screen_time] ?? 10;

  const reelsMap: Record<string, number> = { never: 0, sometimes: 5, daily: 15, heavy_daily: 25 };
  load += reelsMap[d.shorts_reels] ?? 5;

  const gamingMap: Record<string, number> = { none: 0, weekends: 3, few_days: 10, daily: 20 };
  load += gamingMap[d.gaming] ?? 5;

  const pornMap: Record<string, number> = { never: 0, prefer_not: 5, monthly: 3, weekly: 8, '2_5x_week': 15, daily: 25 };
  load += pornMap[d.porn_frequency] ?? 5;

  const scrollMap: Record<string, number> = { never: 0, sometimes: 5, often: 15 };
  load += scrollMap[d.late_night_scrolling] ?? 5;

  // Caffeine timing as dopamine proxy
  if (d.first_caffeine_timing === 'within_60min') load += 5;

  // Convert load (0–130 theoretical max) to inverse score
  return clamp(100 - Math.round(load * (100 / 130)), 0, 100);
}

// ─── Nutritional Stability ───
function scoreNutrition(d: Record<string, any>): number {
  let score = 50;

  // Diet quality
  const dietArr: string[] = Array.isArray(d.diet_type) ? d.diet_type : [];
  if (dietArr.includes('chaotic')) score -= 15;
  if (dietArr.includes('mediterranean') || dietArr.includes('paleo')) score += 10;
  if (dietArr.includes('intermittent_fasting')) score += 5;

  // Meals
  const mealsMap: Record<string, number> = { '1': -15, '2': -5, '3': 10, '4_plus': 5 };
  score += mealsMap[d.meals_per_day] ?? 0;

  // Protein
  if (d.protein_awareness === 'track_it') score += 15;
  else if (d.protein_awareness === 'some') score += 5;
  else if (d.protein_awareness === 'no_idea') score -= 10;

  // Weak point severity
  const weakMap: Record<string, number> = { sugar: -10, late_night_eating: -10, skipping_meals: -10, ultra_processed: -15, inconsistent_timing: -5 };
  score += weakMap[d.nutrition_weak_point] ?? 0;

  return clamp(score, 0, 100);
}

// ─── Hydration Balance ───
function scoreHydration(d: Record<string, any>): number {
  let score = 50;

  const volMap: Record<string, number> = { under_1L: -25, '1_2L': -5, '2_3L': 15, over_3L: 25 };
  score += volMap[d.daily_fluid_volume] ?? 0;

  // Penalize sugary/energy drink dominance
  const sources: string[] = Array.isArray(d.fluid_sources) ? d.fluid_sources : [];
  if (sources.includes('water')) score += 10;
  if (sources.includes('energy_drinks')) score -= 10;
  if (sources.includes('soft_drinks')) score -= 10;
  if (sources.includes('alcohol')) score -= 5;
  if (sources.includes('herbal_tea') || sources.includes('coconut_water')) score += 5;

  return clamp(score, 0, 100);
}

// ─── Recovery Capacity ───
function scoreRecovery(d: Record<string, any>): number {
  let score = 50;

  // Training frequency (positive signal)
  const actMap: Record<string, number> = { none: -10, '1_2_week': 0, '3_4_week': 15, '5_plus': 10, athlete: 5 };
  score += actMap[d.activity_level] ?? 0;

  // Training window consistency
  if (d.training_window_available === 'none') score -= 10;
  else if (d.training_window_available) score += 5;

  // Work load impact on recovery
  const workMap: Record<string, number> = { '0_2': 10, '2_4': 5, '4_6': 0, '6_8': -5, '8_10': -10, '10_plus': -20 };
  score += workMap[d.active_work_hours] ?? 0;

  const availMap: Record<string, number> = { '0': 10, '2_4': 0, '4_8': -5, '8_12': -10, '12_plus': -15 };
  score += availMap[d.availability_hours] ?? 0;

  // Dependents
  if (d.dependents === 'none') score += 5;
  else if (d.dependents && d.dependents !== 'none') score -= 5;

  if (d.household_responsibility === 'high') score -= 10;
  else if (d.household_responsibility === 'low') score += 5;

  // Substance impact
  const alcMap: Record<string, number> = { never: 5, '1x_week': 0, '2_3x_week': -10, '4x_plus': -20 };
  score += alcMap[d.alcohol_frequency] ?? 0;

  if (d.nicotine === 'daily') score -= 10;
  else if (d.nicotine === 'sometimes') score -= 5;

  const thcMap: Record<string, number> = { no: 5, sometimes: 0, weekly: -5, daily: -15 };
  score += thcMap[d.weed_thc] ?? 0;

  return clamp(score, 0, 100);
}

// ─── Hormonal Signal Estimate (NON-MEDICAL) ───
function scoreHormonal(d: Record<string, any>): number {
  let score = 50;

  // Body fat
  const fatMap: Record<string, number> = { lean: 15, average: 5, high: -10, very_high: -20 };
  score += fatMap[d.body_fat_estimate] ?? 0;

  // Activity (testosterone/HGH proxy)
  const actMap: Record<string, number> = { none: -10, '1_2_week': 0, '3_4_week': 10, '5_plus': 15, athlete: 10 };
  score += actMap[d.activity_level] ?? 0;

  // Sunlight (vitamin D proxy)
  if (d.sunlight_after_waking === 'yes') score += 10;
  else if (d.sunlight_after_waking === 'no') score -= 5;

  // Sleep quality (HGH proxy)
  const qual = Number(d.sleep_quality);
  if (!isNaN(qual)) score += (qual - 3) * 5;

  // Age bracket adjustment
  const ageMap: Record<string, number> = { '16_18': 10, '19_24': 10, '25_34': 5, '35_44': 0, '45_54': -5, '55_plus': -10 };
  score += ageMap[d.age_bracket] ?? 0;

  return clamp(score, 0, 100);
}

// ─── Time parsing ───
function parseTimeToMinutes(t: any): number | null {
  if (!t || typeof t !== 'string') return null;
  const parts = t.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// ─── Scoring functions by subsystem ───
const SUBSYSTEM_SCORERS: Record<string, (d: Record<string, any>) => number> = {
  sleep_quality: scoreSleep,
  circadian_stability: scoreCircadian,
  dopamine_load: scoreDopamine,
  nutritional_stability: scoreNutrition,
  hydration_balance: scoreHydration,
  recovery_capacity: scoreRecovery,
  hormonal_signal: scoreHormonal,
};

const SUBSYSTEM_WEIGHTS: Record<string, number> = {
  sleep_quality: 20,
  circadian_stability: 15,
  dopamine_load: 15,
  nutritional_stability: 15,
  hydration_balance: 10,
  recovery_capacity: 15,
  hormonal_signal: 10,
};

// ─── Findings Generator ───
function generateFindings(d: Record<string, any>, scores: Record<string, SubsystemScore>): VitalityFinding[] {
  const findings: VitalityFinding[] = [];
  const add = (id: string, textKey: string, severity: VitalityFinding['severity'], subsystem: string, triggers: string[]) => {
    findings.push({ id, textKey, severity, subsystem, triggerInputs: triggers });
  };

  // Sleep
  if (d.sleep_duration_avg === 'under_5' || d.sleep_duration_avg === '5_6') {
    add('low_sleep', 'vitality.finding.lowSleep', 'concern', 'sleep_quality', ['sleep_duration_avg']);
  }
  if (d.screen_before_bed === 'yes' && (d.late_night_scrolling === 'often')) {
    add('screen_sleep_conflict', 'vitality.finding.screenSleepConflict', 'concern', 'sleep_quality', ['screen_before_bed', 'late_night_scrolling']);
  }

  // Circadian
  if (d.sunlight_after_waking === 'yes' && d.wake_time && d.desired_wake_time) {
    const actual = parseTimeToMinutes(d.wake_time);
    const desired = parseTimeToMinutes(d.desired_wake_time);
    if (actual !== null && desired !== null && Math.abs(actual - desired) <= 30) {
      add('strong_circadian', 'vitality.finding.strongCircadian', 'positive', 'circadian_stability', ['sunlight_after_waking', 'wake_time', 'desired_wake_time']);
    }
  }

  // Dopamine
  const dopScore = scores.dopamine_load?.score ?? 100;
  if (dopScore < 40) {
    add('high_dopamine', 'vitality.finding.highDopamine', 'concern', 'dopamine_load', ['daily_screen_time', 'shorts_reels', 'late_night_scrolling']);
  }

  // Caffeine timing
  if (d.first_caffeine_timing === 'within_60min' && d.caffeine_intake !== '0') {
    add('early_caffeine', 'vitality.finding.earlyCaffeine', 'neutral', 'circadian_stability', ['first_caffeine_timing', 'caffeine_intake']);
  }

  // Hydration sources
  const fluidSources: string[] = Array.isArray(d.fluid_sources) ? d.fluid_sources : [];
  if (fluidSources.includes('energy_drinks') || fluidSources.includes('soft_drinks')) {
    add('sugary_fluids', 'vitality.finding.sugaryFluids', 'concern', 'hydration_balance', ['fluid_sources']);
  }

  // Recovery constraint
  if ((d.active_work_hours === '8_10' || d.active_work_hours === '10_plus') && d.dependents && d.dependents !== 'none') {
    add('recovery_constrained', 'vitality.finding.recoveryConstrained', 'concern', 'recovery_capacity', ['active_work_hours', 'dependents']);
  }

  // Substance load
  if (d.alcohol_frequency === '4x_plus' || d.weed_thc === 'daily') {
    add('substance_load', 'vitality.finding.substanceLoad', 'concern', 'recovery_capacity', ['alcohol_frequency', 'weed_thc']);
  }

  // Positive: good training
  if (d.activity_level === '3_4_week' || d.activity_level === '5_plus' || d.activity_level === 'athlete') {
    add('active_training', 'vitality.finding.activeTraining', 'positive', 'recovery_capacity', ['activity_level']);
  }

  return findings.slice(0, 6); // Max 6
}

// ─── Main Build Function ───
export function buildVitalitySnapshot(rawData: Record<string, any>): VitalityAssessment {
  const subsystemScores: Record<string, SubsystemScore> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalCompleteness = 0;
  let subsystemCount = 0;

  for (const [subsystemId, fields] of Object.entries(SUBSYSTEM_FIELDS)) {
    const comp = completeness(fields, rawData);
    const conf = confidenceFromCompleteness(comp);
    const scorer = SUBSYSTEM_SCORERS[subsystemId];
    const weight = SUBSYSTEM_WEIGHTS[subsystemId] ?? 10;

    let score = -1;
    if (comp >= 0.4 && scorer) {
      score = scorer(rawData);
    }

    subsystemScores[subsystemId] = {
      id: subsystemId,
      score,
      dataCompleteness: comp,
      confidence: conf,
      inputsUsed: getUsed(fields, rawData),
      inputsMissing: getMissing(fields, rawData),
    };

    if (score >= 0) {
      // Reduce weight for low-confidence subsystems
      const effectiveWeight = conf === 'low' ? weight * 0.5 : conf === 'med' ? weight * 0.75 : weight;
      totalWeightedScore += score * effectiveWeight;
      totalWeight += effectiveWeight;
    }

    totalCompleteness += comp;
    subsystemCount++;
  }

  const vitalityIndex = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const overallCompleteness = subsystemCount > 0 ? totalCompleteness / subsystemCount : 0;

  // Check for contradictions
  let contradictions = 0;
  if (rawData.sleep_time) {
    const sleepMin = parseTimeToMinutes(rawData.sleep_time);
    if (sleepMin !== null && sleepMin <= 21 * 60 + 30 && rawData.screen_before_bed === 'yes' && rawData.late_night_scrolling === 'often') {
      contradictions++;
    }
  }

  let overallConfidence: Confidence = confidenceFromCompleteness(overallCompleteness);
  if (contradictions > 0 && overallConfidence === 'high') overallConfidence = 'med';

  const findings = generateFindings(rawData, subsystemScores);

  return {
    assessedAt: new Date().toISOString(),
    vitalityIndex,
    confidence: overallConfidence,
    completeness: overallCompleteness,
    subsystemScores,
    findings,
    rawInputsUsed: rawData,
  };
}
