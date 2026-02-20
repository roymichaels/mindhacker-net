/**
 * @module lib/consciousness/scoring
 * Deterministic scoring for Consciousness (תודעה) Soul Frequency Engine.
 * Weighted: soul_intent 20, mask 15, frequency 15, alignment 20, signal 15, coherence 15.
 */
import type {
  ConsciousnessIntakeAnswers, ConsciousnessSubscores, ConsciousnessFinding,
  ConsciousnessAssessmentResult, Confidence, ConsciousnessSubsystemId,
  SoulIntentAnswers, MaskAnswers, FrequencyAnswers, AlignmentAnswers,
  InnerSignalAnswers, FieldCoherenceAnswers,
} from './types';

function clamp(v: number, min = 0, max = 100) { return Math.max(min, Math.min(max, v)); }

function bandScore(val: string | undefined, map: Record<string, number>): number {
  return map[val ?? ''] ?? 0;
}

const BAND_5: Record<string, number> = { '5': 100, '4': 75, '3': 50, '2': 25, '1': 0 };

/* ─── Soul Intent Clarity (weight: 20) ─── */
function scoreSoulIntent(a?: SoulIntentAnswers): number {
  if (!a) return 0;
  let s = 0;
  s += bandScore(a.mission_clarity, BAND_5) * 0.35;
  s += bandScore(a.ideal_life_image, { crystal: 100, partial: 50, fog: 10 }) * 0.35;
  const valCount = (a.core_values?.length ?? 0);
  s += (valCount >= 3 ? 100 : valCount === 2 ? 70 : valCount === 1 ? 40 : 0) * 0.30;
  return clamp(Math.round(s));
}

/* ─── Mask Awareness (weight: 15) ─── */
function scoreMaskAwareness(a?: MaskAnswers): number {
  if (!a) return 0;
  let s = 0;
  // Higher awareness = higher score. Performing persona inversely scored
  const perf = bandScore(a.performs_persona, BAND_5);
  s += (100 - perf) * 0.30; // low performing → high awareness
  const maskCount = a.main_masks?.length ?? 0;
  // Identifying masks = awareness (not bad)
  s += (maskCount >= 3 ? 90 : maskCount === 2 ? 70 : maskCount === 1 ? 50 : 20) * 0.40;
  const costCount = a.mask_costs?.length ?? 0;
  s += (costCount >= 2 ? 90 : costCount === 1 ? 60 : 20) * 0.30;
  return clamp(Math.round(s));
}

/* ─── Frequency Stability (weight: 15) ─── */
function scoreFrequencyStability(a?: FrequencyAnswers): number {
  if (!a) return 0;
  let s = 0;
  const baseMap: Record<string, number> = {
    grounded: 100, stable: 85, sharp: 55, restless: 40, heavy: 30, numb: 15, chaotic: 5,
  };
  s += bandScore(a.baseline_state, baseMap) * 0.35;
  // Low volatility = good
  s += (100 - bandScore(a.mood_volatility, BAND_5)) * 0.25;
  // Low social collapse = good
  s += (100 - bandScore(a.social_collapse, BAND_5)) * 0.20;
  // Low context split = good
  s += (100 - bandScore(a.context_split, BAND_5)) * 0.20;
  return clamp(Math.round(s));
}

/* ─── Alignment Integrity (weight: 20) ─── */
function scoreAlignmentIntegrity(a?: AlignmentAnswers): number {
  if (!a) return 0;
  let s = 0;
  s += bandScore(a.values_alignment, BAND_5) * 0.50;
  // Having identified area = awareness
  s += (a.misalignment_area ? 25 : 0);
  // Constructive response patterns
  const respMap: Record<string, number> = {
    rationalize: 15, escape: 10, numb: 10, overwork: 20, fight: 15,
    freeze: 5, self_attack: 5,
  };
  s += bandScore(a.misalignment_response, respMap);
  return clamp(Math.round(s));
}

/* ─── Inner Signal Access (weight: 15) ─── */
function scoreInnerSignal(a?: InnerSignalAnswers): number {
  if (!a) return 0;
  let s = 0;
  s += bandScore(a.body_yes_no, BAND_5) * 0.30;
  s += bandScore(a.trusts_guidance, BAND_5) * 0.30;
  s += bandScore(a.silence_capacity, BAND_5) * 0.25;
  s += (a.signal_channel ? 15 : 0);
  return clamp(Math.round(s));
}

/* ─── Field Coherence (weight: 15) ─── */
function scoreFieldCoherence(a?: FieldCoherenceAnswers): number {
  if (!a) return 0;
  let s = 0;
  const breathMap: Record<string, number> = {
    deep_slow: 100, shallow_fast: 30, hold: 15, erratic: 5,
  };
  s += bandScore(a.breath_under_stress, breathMap) * 0.30;
  const sleepMap: Record<string, number> = { stable: 100, moderate: 60, poor: 20 };
  s += bandScore(a.sleep_stability, sleepMap) * 0.30;
  const caffMap: Record<string, number> = { none: 100, moderate: 60, dependent: 20 };
  s += bandScore(a.caffeine_dependence, caffMap) * 0.20;
  const sunMap: Record<string, number> = { daily: 100, sometimes: 50, rarely: 10 };
  s += bandScore(a.morning_sunlight, sunMap) * 0.20;
  return clamp(Math.round(s));
}

/* ─── Contradictions ─── */
function detectContradictions(a: ConsciousnessIntakeAnswers): string[] {
  const flags: string[] = [];
  // High mission clarity + low alignment
  if (a.soul_intent?.mission_clarity && parseInt(a.soul_intent.mission_clarity) >= 4 &&
      a.alignment?.values_alignment && parseInt(a.alignment.values_alignment) <= 2) {
    flags.push('clarity_without_alignment');
  }
  // Trusts inner guidance highly but can't sit in silence
  if (a.inner_signal?.trusts_guidance && parseInt(a.inner_signal.trusts_guidance) >= 4 &&
      a.inner_signal?.silence_capacity && parseInt(a.inner_signal.silence_capacity) <= 2) {
    flags.push('trust_without_stillness');
  }
  // Grounded baseline but high volatility
  if (a.frequency?.baseline_state === 'grounded' &&
      a.frequency?.mood_volatility && parseInt(a.frequency.mood_volatility) >= 4) {
    flags.push('grounded_but_volatile');
  }
  return flags;
}

/* ─── Findings (max 6) ─── */
function generateFindings(
  a: ConsciousnessIntakeAnswers,
  sub: ConsciousnessSubscores,
  contradictions: string[]
): ConsciousnessFinding[] {
  const f: ConsciousnessFinding[] = [];

  if (contradictions.includes('clarity_without_alignment'))
    f.push({ id: 'clarity_drift', text_key: 'consciousness.finding_clarity_drift', severity: 'high', subsystem: 'alignment_integrity', evidence_ids: ['mission_clarity', 'values_alignment'] });
  if (contradictions.includes('trust_without_stillness'))
    f.push({ id: 'trust_override', text_key: 'consciousness.finding_trust_override', severity: 'med', subsystem: 'inner_signal_access', evidence_ids: ['trusts_guidance', 'silence_capacity'] });
  if (contradictions.includes('grounded_but_volatile'))
    f.push({ id: 'false_ground', text_key: 'consciousness.finding_false_ground', severity: 'med', subsystem: 'frequency_stability', evidence_ids: ['baseline_state', 'mood_volatility'] });

  if (sub.mask_awareness < 30)
    f.push({ id: 'mask_suppression', text_key: 'consciousness.finding_mask_suppression', severity: 'high', subsystem: 'mask_awareness' });
  if (sub.soul_intent_clarity < 40)
    f.push({ id: 'intent_fog', text_key: 'consciousness.finding_intent_fog', severity: 'high', subsystem: 'soul_intent_clarity' });
  if (sub.frequency_stability < 30)
    f.push({ id: 'frequency_volatile', text_key: 'consciousness.finding_frequency_volatile', severity: 'high', subsystem: 'frequency_stability' });
  if (sub.alignment_integrity < 35)
    f.push({ id: 'alignment_drift', text_key: 'consciousness.finding_alignment_drift', severity: 'high', subsystem: 'alignment_integrity' });
  if (sub.inner_signal_access < 30)
    f.push({ id: 'signal_blocked', text_key: 'consciousness.finding_signal_blocked', severity: 'med', subsystem: 'inner_signal_access' });
  if (sub.field_coherence < 30)
    f.push({ id: 'coherence_low', text_key: 'consciousness.finding_coherence_low', severity: 'med', subsystem: 'field_coherence' });
  if (sub.inner_signal_access >= 60 && sub.frequency_stability < 40)
    f.push({ id: 'signal_override', text_key: 'consciousness.finding_signal_override', severity: 'med', subsystem: 'inner_signal_access' });

  return f.slice(0, 6);
}

/* ─── Main build function ─── */
export function buildConsciousnessAssessment(answers: ConsciousnessIntakeAnswers): ConsciousnessAssessmentResult {
  const subscores: ConsciousnessSubscores = {
    soul_intent_clarity: scoreSoulIntent(answers.soul_intent),
    mask_awareness: scoreMaskAwareness(answers.masks),
    frequency_stability: scoreFrequencyStability(answers.frequency),
    alignment_integrity: scoreAlignmentIntegrity(answers.alignment),
    inner_signal_access: scoreInnerSignal(answers.inner_signal),
    field_coherence: scoreFieldCoherence(answers.field_coherence),
  };

  // Weighted average
  const consciousness_index = Math.round(
    subscores.soul_intent_clarity * 0.20 +
    subscores.mask_awareness * 0.15 +
    subscores.frequency_stability * 0.15 +
    subscores.alignment_integrity * 0.20 +
    subscores.inner_signal_access * 0.15 +
    subscores.field_coherence * 0.15
  );

  // Completeness
  const depth = answers.depth ?? 'full';
  const totalFields = depth === 'quick' ? 12 : 24;
  let answered = 0;
  const inc = (v: any) => { if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) answered++; };

  if (answers.soul_intent) {
    inc(answers.soul_intent.mission_clarity);
    inc(answers.soul_intent.ideal_life_image);
    inc(answers.soul_intent.core_values);
    if (depth === 'full') inc(answers.soul_intent.core_values_freetext);
  }
  if (answers.masks) {
    inc(answers.masks.performs_persona);
    inc(answers.masks.main_masks);
    inc(answers.masks.mask_costs);
  }
  if (answers.frequency) {
    inc(answers.frequency.baseline_state);
    inc(answers.frequency.mood_volatility);
    inc(answers.frequency.social_collapse);
    inc(answers.frequency.context_split);
  }
  if (answers.alignment) {
    inc(answers.alignment.values_alignment);
    inc(answers.alignment.misalignment_area);
    inc(answers.alignment.misalignment_response);
  }
  if (answers.inner_signal) {
    inc(answers.inner_signal.body_yes_no);
    inc(answers.inner_signal.trusts_guidance);
    inc(answers.inner_signal.silence_capacity);
    if (depth === 'full') inc(answers.inner_signal.signal_channel);
  }
  if (answers.field_coherence) {
    inc(answers.field_coherence.breath_under_stress);
    inc(answers.field_coherence.sleep_stability);
    inc(answers.field_coherence.caffeine_dependence);
    inc(answers.field_coherence.morning_sunlight);
  }

  const completeness_pct = Math.round((answered / totalFields) * 100);
  const contradictions = detectContradictions(answers);

  let confidence: Confidence = 'high';
  if (completeness_pct < 65 || contradictions.length >= 2) confidence = 'low';
  else if (completeness_pct < 90 || contradictions.length >= 1) confidence = 'med';

  const findings = generateFindings(answers, subscores, contradictions);

  return {
    assessed_at: new Date().toISOString(),
    consciousness_index,
    confidence,
    completeness_pct,
    subscores,
    findings,
    selected_focus_items: [],
    depth,
  };
}
