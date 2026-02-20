/**
 * @module lib/presence/scoring
 * @purpose Deterministic heuristic scoring engine for questionnaire-based Presence assessment.
 */

import type {
  PresencePreferences,
  SubScoreKey,
  SubScore,
  PresenceScores,
  PresenceAssessmentResult,
  AssessmentMode,
  LeverRecommendation,
  PresenceDiagnosisActions,
} from './types';
import { LEVERS } from './levers';

// ── Heuristic Helpers ──

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

function bodyFatScore(range?: string): number {
  const map: Record<string, number> = {
    'under_10': 90, '10_14': 85, '15_19': 70, '20_24': 55, '25_29': 40, '30_plus': 25,
  };
  return map[range ?? ''] ?? 50;
}

function activityScore(level?: string): number {
  const map: Record<string, number> = {
    'sedentary': 25, 'light': 40, 'moderate': 60, 'active': 75, 'very_active': 90,
  };
  return map[level ?? ''] ?? 50;
}

// ── Sub-Score Engines ──

function scoreFaceStructure(prefs: PresencePreferences): SubScore {
  let score = 55; // baseline
  if (prefs.posture_self_check.neck_forward) score -= 10;
  if (prefs.grooming_baseline.has_beard) score += 5;
  if (prefs.body_fat_range) {
    const bf = bodyFatScore(prefs.body_fat_range);
    score += (bf - 50) * 0.3; // lower bf → better jawline definition
  }

  const observations: string[] = [];
  const levers: LeverRecommendation[] = [];

  if (prefs.posture_self_check.neck_forward) {
    observations.push('Forward head posture may reduce jawline projection');
    levers.push({
      leverId: 'chin_tuck_drills', title: 'Chin Tuck Drills',
      impact: 4, effort: 1, why: 'Reduces forward head to enhance jaw appearance',
      steps: ['3 sets of 10 chin tucks daily'],
    });
  }

  // Mewing lever: only if user selected jawline goal or reports forward head / mouth breathing
  const wantsMewing = prefs.goals.includes('jawline') || prefs.posture_self_check.neck_forward;
  if (wantsMewing) {
    levers.push({
      leverId: 'tongue_posture', title: 'Tongue Posture (Mewing)',
      impact: 3, effort: 1, why: 'Posture/airway habit that may improve appearance over time',
      steps: ['Rest tongue on palate, lips sealed, nasal breathing'],
    });
  }

  if ((bodyFatScore(prefs.body_fat_range) < 60)) {
    observations.push('Higher body fat may mask jawline definition');
    levers.push({
      leverId: 'leaning_protocol', title: 'Leaning Protocol',
      impact: 5, effort: 4, why: 'Body fat reduction reveals facial structure',
      steps: ['Caloric deficit + high protein + resistance training'],
    });
  }

  observations.push('Face structure score based on self-reported data');

  return { score: clamp(Math.round(score)), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scorePostureFrame(prefs: PresencePreferences): SubScore {
  let score = 70;
  const observations: string[] = [];
  const levers: LeverRecommendation[] = [];

  if (prefs.posture_self_check.neck_forward) { score -= 15; observations.push('Forward head posture detected'); }
  if (prefs.posture_self_check.rounded_shoulders) { score -= 15; observations.push('Rounded shoulders reported'); }
  if (prefs.posture_self_check.low_back_pain) { score -= 10; observations.push('Low back discomfort — possible pelvic tilt'); }

  if (prefs.posture_self_check.neck_forward) {
    levers.push({ leverId: 'forward_head_correction', title: 'Forward Head Correction', impact: 5, effort: 2, why: 'High ROI: visible posture improvement', steps: ['Chin tucks + wall angels + thoracic extensions daily'] });
  }
  if (prefs.posture_self_check.rounded_shoulders) {
    levers.push({ leverId: 'rounded_shoulders_fix', title: 'Rounded Shoulders Fix', impact: 5, effort: 2, why: 'Opens chest, improves frame', steps: ['Band pull-aparts + doorway stretch daily'] });
  }
  if (prefs.posture_self_check.low_back_pain) {
    levers.push({ leverId: 'pelvic_alignment', title: 'Pelvic Alignment', impact: 4, effort: 3, why: 'Reduces pain, improves stance', steps: ['Glute bridges + hip flexor stretch daily'] });
  }

  score += activityScore(prefs.activity_level) * 0.1;
  return { score: clamp(Math.round(score)), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scoreBodyComposition(prefs: PresencePreferences): SubScore {
  const bf = bodyFatScore(prefs.body_fat_range);
  const act = activityScore(prefs.activity_level);
  const score = Math.round(bf * 0.6 + act * 0.4);
  const observations: string[] = [`Body fat range: ${prefs.body_fat_range?.replace(/_/g, '-') || 'not provided'}`];
  const levers: LeverRecommendation[] = [];

  if (bf < 60) {
    levers.push({ leverId: 'leaning_protocol', title: 'Leaning Protocol', impact: 5, effort: 4, why: 'Reveals muscle definition and facial structure', steps: ['Deficit + protein + resistance training'] });
  }
  if (act < 60) {
    levers.push({ leverId: 'muscle_building_basics', title: 'Resistance Training', impact: 4, effort: 3, why: 'Builds frame and raises metabolism', steps: ['3-4x/week compound lifts'] });
  }

  return { score: clamp(score), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scoreSkinRoutine(prefs: PresencePreferences): SubScore {
  let score = 50;
  const routine = prefs.grooming_baseline.skincare_routine ?? 'none';
  const observations: string[] = [];
  const levers: LeverRecommendation[] = [];

  if (routine === 'full') { score = 80; observations.push('Full skincare routine reported'); }
  else if (routine === 'basic') { score = 60; observations.push('Basic skincare in place'); }
  else { score = 35; observations.push('No consistent skincare routine'); }

  if (score < 70) {
    levers.push({ leverId: 'skincare_basics', title: 'Cleanser + Moisturizer + SPF', impact: 4, effort: 1, why: 'Foundation of skin health', steps: ['AM: cleanse → moisturize → SPF', 'PM: cleanse → moisturize'] });
  }

  return { score: clamp(score), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scoreHairGrooming(prefs: PresencePreferences): SubScore {
  let score = 55;
  const observations: string[] = [];
  const levers: LeverRecommendation[] = [];
  const hairLength = prefs.grooming_baseline.hair_length ?? 'medium';

  observations.push(`Hair length: ${hairLength}`);
  if (prefs.grooming_baseline.has_beard) { score += 5; observations.push('Beard maintained'); }

  levers.push({ leverId: 'haircut_selector', title: 'Optimize Haircut for Face Shape', impact: 4, effort: 1, why: 'Right cut dramatically changes appearance', steps: ['Identify face shape, find matching styles'] });
  levers.push({ leverId: 'eyebrow_grooming', title: 'Eyebrow Grooming', impact: 3, effort: 1, why: 'Quick symmetry improvement', steps: ['Remove strays, trim long hairs weekly'] });

  return { score: clamp(score), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scoreStyleFit(prefs: PresencePreferences): SubScore {
  let score = 50;
  const observations: string[] = [`Style preference: ${prefs.style_preference}`];
  const levers: LeverRecommendation[] = [];

  if (prefs.goals.includes('style')) { score -= 5; observations.push('Style upgrade is a stated goal'); }

  levers.push({ leverId: 'fit_checklist', title: 'Fit Checklist', impact: 4, effort: 1, why: 'Properly fitting clothes elevate any style', steps: ['Check shoulder, sleeve, and pant fit'] });
  levers.push({ leverId: 'capsule_wardrobe', title: 'Capsule Wardrobe', impact: 3, effort: 2, why: 'Simplifies daily decisions, ensures cohesion', steps: ['Select 15-20 mix-and-match pieces'] });

  return { score: clamp(score), confidence: 'low', keyObservations: observations, topLevers: levers };
}

function scoreDentalSmile(_prefs: PresencePreferences): SubScore {
  // Defaults to neutral since no data in quick mode
  return {
    score: 50,
    confidence: 'low',
    keyObservations: ['Dental score defaults to neutral without photo assessment'],
    topLevers: [
      { leverId: 'brushing_flossing', title: 'Brushing & Flossing Habit', impact: 3, effort: 1, why: 'Foundation of dental health', steps: ['Brush 2x/day, floss before evening brush'] },
      { leverId: 'breath_hygiene', title: 'Breath Hygiene', impact: 2, effort: 1, why: 'Subtle but impactful', steps: ['Tongue scraper + hydration + nasal breathing'] },
    ],
  };
}

// ── Main Scoring Function ──

export function computeQuickScores(prefs: PresencePreferences): PresenceScores {
  return {
    face_structure: scoreFaceStructure(prefs),
    posture_frame: scorePostureFrame(prefs),
    body_composition: scoreBodyComposition(prefs),
    skin_routine: scoreSkinRoutine(prefs),
    hair_grooming: scoreHairGrooming(prefs),
    style_fit: scoreStyleFit(prefs),
    dental_smile: scoreDentalSmile(prefs),
  };
}

export function computeTotalScore(scores: PresenceScores): number {
  const weights: Record<SubScoreKey, number> = {
    face_structure: 0.2,
    posture_frame: 0.2,
    body_composition: 0.2,
    skin_routine: 0.1,
    hair_grooming: 0.1,
    style_fit: 0.1,
    dental_smile: 0.1,
  };

  let total = 0;
  for (const [key, w] of Object.entries(weights)) {
    total += scores[key as SubScoreKey].score * w;
  }
  return Math.round(total);
}

export function getTopLevers(scores: PresenceScores, count = 3): LeverRecommendation[] {
  const all: LeverRecommendation[] = [];
  for (const sub of Object.values(scores)) {
    all.push(...sub.topLevers);
  }
  // Sort by impact desc, then effort asc
  all.sort((a, b) => b.impact - a.impact || a.effort - b.effort);
  // Deduplicate by leverId
  const seen = new Set<string>();
  const result: LeverRecommendation[] = [];
  for (const l of all) {
    if (!seen.has(l.leverId) && result.length < count) {
      seen.add(l.leverId);
      result.push(l);
    }
  }
  return result;
}

export function generateDiagnosis(scores: PresenceScores, topLevers: LeverRecommendation[]): PresenceDiagnosisActions {
  const todayActions = topLevers.slice(0, 3).map(l => l.steps[0] || l.title);
  const weekActions = topLevers.map(l => `${l.title}: ${l.steps.join(', ')}`);

  // Find weakest categories
  const sorted = Object.entries(scores).sort((a, b) => a[1].score - b[1].score);
  const weakest = sorted.slice(0, 2).map(([k]) => k);
  const mid = sorted.slice(2, 4).map(([k]) => k);

  return {
    today: todayActions,
    this_week: weekActions,
    ninety_day_phases: {
      phase1: {
        label: 'Foundations',
        weeks: 'Weeks 1-4',
        actions: [`Focus on: ${weakest.map(k => k.replace(/_/g, ' ')).join(', ')}`, 'Build daily habits', 'Establish routine consistency'],
      },
      phase2: {
        label: 'Definition',
        weeks: 'Weeks 5-8',
        actions: [`Expand to: ${mid.map(k => k.replace(/_/g, ' ')).join(', ')}`, 'Increase routine intensity', 'Track measurable progress'],
      },
      phase3: {
        label: 'Refinement',
        weeks: 'Weeks 9-12',
        actions: ['Fine-tune all areas', 'Reassess with full photo scan', 'Set next 90-day targets'],
      },
    },
  };
}

export function buildAssessmentResult(
  mode: AssessmentMode,
  prefs: PresencePreferences,
): PresenceAssessmentResult {
  const scores = computeQuickScores(prefs);
  const total = computeTotalScore(scores);
  const topLevers = getTopLevers(scores);
  const diagnosis = generateDiagnosis(scores, topLevers);

  return {
    mode,
    scores,
    total_score: total,
    confidence: mode === 'quick' ? 'low' : mode === 'full' ? 'med' : 'high',
    top_levers: topLevers,
    diagnosis,
    assessed_at: new Date().toISOString(),
  };
}
