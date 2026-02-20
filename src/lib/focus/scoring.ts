/**
 * @module lib/focus/scoring
 * Deterministic scoring engine for Focus (מיקוד) Conscious Regulation.
 * No AI guessing. Rule-based only.
 */
import type {
  FocusIntakeAnswers, FocusSubscores, FocusFinding, FocusAssessmentResult,
  Confidence, SubsystemId, BreathAnswers, MeditationAnswers,
  GuidedMeditationAnswers, HypnosisAnswers, SomaticAnswers, YogaAnswers,
} from './types';

/* ─── Frequency score helper ─── */
const freqScore = (f?: string): number => {
  switch (f) {
    case 'daily': return 100;
    case '3_5_week': return 75;
    case '1_2_week': return 45;
    case 'rarely': return 15;
    default: return 0;
  }
};

const durationScore = (d?: string): number => {
  switch (d) {
    case '40_plus': return 100;
    case '20_40': return 85;
    case '20_plus': return 85;
    case '10_20': return 60;
    case '5_10': return 35;
    case 'under_5': return 15;
    default: return 0;
  }
};

/* ─── Subsystem scoring ─── */

function scoreBreath(a?: BreathAnswers): number {
  if (!a) return 0;
  const hasNone = a.practice_types.includes('none') || a.practice_types.length === 0;
  if (hasNone && a.frequency === 'never') return 0;

  let s = 0;
  s += freqScore(a.frequency) * 0.25;
  s += durationScore(a.duration) * 0.2;
  s += Math.min(a.practice_types.filter(t => t !== 'none').length * 12, 30) * (30 / 100) * (100 / 30);
  // control claim
  if (a.control_claim === 'can_downshift_fast') s += 20;
  else if (a.control_claim === 'sometimes') s += 10;
  // breath hold bonus
  if (a.breath_hold_seconds != null) {
    if (a.breath_hold_seconds >= 60) s += 10;
    else if (a.breath_hold_seconds >= 40) s += 7;
    else if (a.breath_hold_seconds >= 25) s += 4;
  }

  // Recalculate properly
  const variety = Math.min(a.practice_types.filter(t => t !== 'none').length * 6, 25);
  const freq = freqScore(a.frequency) * 0.25;
  const dur = durationScore(a.duration) * 0.2;
  const ctrl = a.control_claim === 'can_downshift_fast' ? 20 : a.control_claim === 'sometimes' ? 10 : 0;
  const hold = a.breath_hold_seconds != null
    ? (a.breath_hold_seconds >= 60 ? 10 : a.breath_hold_seconds >= 40 ? 7 : a.breath_hold_seconds >= 25 ? 4 : 0)
    : 0;

  return Math.min(Math.round(variety + freq + dur + ctrl + hold), 100);
}

function scoreMeditation(a?: MeditationAnswers): number {
  if (!a) return 0;

  const freq = freqScore(a.frequency) * 0.25;
  const dur = durationScore(a.session_length) * 0.2;

  let still = 0;
  switch (a.stillness_capacity) {
    case '20_plus': still = 25; break;
    case '10_min': still = 18; break;
    case '5_min': still = 10; break;
    case '2_min': still = 4; break;
  }

  let wander = 0;
  switch (a.mind_wandering) {
    case 'under_10s': wander = 20; break;
    case '10_30s': wander = 14; break;
    case '30_60s': wander = 7; break;
    case 'minutes': wander = 0; break;
  }

  let effect = 0;
  if (a.after_effect === 'clearer') effect = 10;
  else if (a.after_effect === 'neutral') effect = 5;

  return Math.min(Math.round(freq + dur + still + wander + effect), 100);
}

function scoreGuided(a?: GuidedMeditationAnswers): number {
  if (!a) return 0;

  const freq = freqScore(a.frequency) * 0.3;
  const sleep = a.falls_asleep === 'never' ? 25 : a.falls_asleep === 'sometimes' ? 12 : 0;
  const follow = a.follow_guidance === 'yes' ? 25 : a.follow_guidance === 'partial' ? 12 : 0;
  const shift = a.post_shift === 'strong' ? 20 : a.post_shift === 'mild' ? 10 : 0;

  return Math.min(Math.round(freq + sleep + follow + shift), 100);
}

function scoreHypnosis(a?: HypnosisAnswers): number {
  if (!a) return 0;
  if (a.experience === 'none' && (a.frequency === 'never' || !a.frequency)) return 0;

  let exp = 0;
  switch (a.experience) {
    case 'advanced': exp = 30; break;
    case 'intermediate': exp = 20; break;
    case 'beginner': exp = 8; break;
  }

  const freq = freqScore(a.frequency) * 0.2;
  const markers = Math.min((a.depth_markers?.filter(m => m !== 'none').length ?? 0) * 8, 25);
  const eff = a.suggestion_effectiveness === 'reliably' ? 20 : a.suggestion_effectiveness === 'sometimes' ? 10 : 0;

  return Math.min(Math.round(exp + freq + markers + eff), 100);
}

function scoreSomatic(a?: SomaticAnswers): number {
  if (!a) return 0;
  const hasNone = a.practice_types.includes('none') || a.practice_types.length === 0;
  if (hasNone && !a.frequency) return 0;

  const variety = Math.min(a.practice_types.filter(t => t !== 'none').length * 10, 25);
  const freq = freqScore(a.frequency) * 0.25;
  const dur = durationScore(a.session_length) * 0.15;
  const integration = a.breath_motion_integration === 'strong' ? 20 : a.breath_motion_integration === 'partial' ? 10 : 0;
  const sensations = Math.min((a.sensation_markers?.filter(m => m !== 'none').length ?? 0) * 6, 15);

  return Math.min(Math.round(variety + freq + dur + integration + sensations), 100);
}

function scoreYoga(a?: YogaAnswers): number {
  if (!a) return 0;
  const hasNone = a.styles.includes('none') || a.styles.length === 0;
  if (hasNone && !a.frequency) return 0;

  const variety = Math.min(a.styles.filter(s => s !== 'none').length * 8, 25);
  const freq = freqScore(a.frequency) * 0.25;
  const breath = a.breath_under_strain === 'controlled' ? 25 : a.breath_under_strain === 'partial' ? 12 : 0;
  const balance = a.balance_control === 'strong' ? 20 : a.balance_control === 'average' ? 10 : 0;

  return Math.min(Math.round(variety + freq + breath + balance), 100);
}

/* ─── Contradiction detection ─── */

function detectContradictions(answers: FocusIntakeAnswers): string[] {
  const flags: string[] = [];

  // Breath: never but claims downshift
  if (answers.breath?.frequency === 'never' && answers.breath.control_claim === 'can_downshift_fast') {
    flags.push('inconsistent_breath_claim');
  }
  // Meditation: never but says 20+ stillness
  if (answers.meditation?.frequency === 'never' &&
    (answers.meditation.stillness_capacity === '20_plus' || answers.meditation.stillness_capacity === '10_min')) {
    flags.push('inconsistent_meditation_claim');
  }
  // Hypnosis: none experience but depth markers
  if (answers.hypnosis?.experience === 'none' &&
    answers.hypnosis.depth_markers?.filter(m => m !== 'none').length > 0) {
    flags.push('inconsistent_hypnosis_claim');
  }

  return flags;
}

/* ─── Findings generation (max 6) ─── */

function generateFindings(
  answers: FocusIntakeAnswers,
  subscores: FocusSubscores,
  contradictions: string[]
): FocusFinding[] {
  const findings: FocusFinding[] = [];

  // Contradiction findings
  if (contradictions.includes('inconsistent_breath_claim')) {
    findings.push({ id: 'inconsistent_practice', text_key: 'focus.finding_inconsistent_breath', severity: 'med', subsystem: 'breath_control' });
  }
  if (contradictions.includes('inconsistent_hypnosis_claim')) {
    findings.push({ id: 'inconsistent_hypnosis', text_key: 'focus.finding_inconsistent_hypnosis', severity: 'med', subsystem: 'trance_depth' });
  }

  // Low breath control
  if (subscores.breath_control < 25) {
    findings.push({ id: 'low_breath_control', text_key: 'focus.finding_low_breath', severity: 'high', subsystem: 'breath_control' });
  }

  // Guided sleep issue
  if (answers.guided?.falls_asleep === 'often') {
    findings.push({ id: 'sleepiness_guided', text_key: 'focus.finding_sleepy_guided', severity: 'med', subsystem: 'guided_suggestibility' });
  }

  // Shallow trance
  if (subscores.trance_depth < 20 && answers.hypnosis?.experience !== 'none') {
    findings.push({ id: 'shallow_trance', text_key: 'focus.finding_shallow_trance', severity: 'med', subsystem: 'trance_depth' });
  }

  // Low somatic awareness
  if (subscores.somatic_awareness < 15 && subscores.structural_calm < 15) {
    findings.push({ id: 'low_somatic', text_key: 'focus.finding_low_somatic', severity: 'high', subsystem: 'somatic_awareness' });
  }

  // Low attention stability
  if (subscores.attention_stability < 20) {
    findings.push({ id: 'low_attention', text_key: 'focus.finding_low_attention', severity: 'high', subsystem: 'attention_stability' });
  }

  // Mind wandering
  if (answers.meditation?.mind_wandering === 'minutes') {
    findings.push({ id: 'high_mind_wander', text_key: 'focus.finding_high_wander', severity: 'med', subsystem: 'attention_stability' });
  }

  return findings.slice(0, 6);
}

/* ─── Main build function ─── */

export function buildFocusAssessment(answers: FocusIntakeAnswers): FocusAssessmentResult {
  const skipped = answers.skipped_subsystems ?? [];

  const subscores: FocusSubscores = {
    breath_control: skipped.includes('breath_control') ? 0 : scoreBreath(answers.breath),
    attention_stability: skipped.includes('attention_stability') ? 0 : scoreMeditation(answers.meditation),
    guided_suggestibility: skipped.includes('guided_suggestibility') ? 0 : scoreGuided(answers.guided),
    trance_depth: skipped.includes('trance_depth') ? 0 : scoreHypnosis(answers.hypnosis),
    somatic_awareness: skipped.includes('somatic_awareness') ? 0 : scoreSomatic(answers.somatic),
    structural_calm: skipped.includes('structural_calm') ? 0 : scoreYoga(answers.yoga),
  };

  // Weighted average — reduce weight for skipped
  const weights: Record<SubsystemId, number> = {
    breath_control: skipped.includes('breath_control') ? 0 : 1,
    attention_stability: skipped.includes('attention_stability') ? 0 : 1,
    guided_suggestibility: skipped.includes('guided_suggestibility') ? 0 : 1,
    trance_depth: skipped.includes('trance_depth') ? 0 : 1,
    somatic_awareness: skipped.includes('somatic_awareness') ? 0 : 1,
    structural_calm: skipped.includes('structural_calm') ? 0 : 1,
  };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const overall_index = totalWeight > 0
    ? Math.round(
      Object.entries(subscores).reduce((sum, [k, v]) => sum + v * weights[k as SubsystemId], 0) / totalWeight
    )
    : 0;

  // Completeness
  const totalFields = 30; // 6 subsystems x 5 questions
  const answeredSections = 6 - skipped.length;
  const sectionFields = answeredSections * 5;
  // Count actual answered fields within non-skipped sections
  let answered = 0;
  if (answers.breath && !skipped.includes('breath_control')) {
    if (answers.breath.practice_types?.length) answered++;
    if (answers.breath.frequency) answered++;
    if (answers.breath.duration) answered++;
    if (answers.breath.control_claim) answered++;
    if (answers.breath.breath_hold_seconds != null) answered++;
  }
  if (answers.meditation && !skipped.includes('attention_stability')) {
    if (answers.meditation.frequency) answered++;
    if (answers.meditation.session_length) answered++;
    if (answers.meditation.stillness_capacity) answered++;
    if (answers.meditation.mind_wandering) answered++;
    if (answers.meditation.after_effect) answered++;
  }
  if (answers.guided && !skipped.includes('guided_suggestibility')) {
    if (answers.guided.frequency) answered++;
    if (answers.guided.falls_asleep) answered++;
    if (answers.guided.follow_guidance) answered++;
    if (answers.guided.post_shift) answered++;
    if (answers.guided.preferred_voice) answered++;
  }
  if (answers.hypnosis && !skipped.includes('trance_depth')) {
    if (answers.hypnosis.experience) answered++;
    if (answers.hypnosis.frequency) answered++;
    if (answers.hypnosis.depth_markers?.length) answered++;
    if (answers.hypnosis.suggestion_effectiveness) answered++;
    if (answers.hypnosis.preferred_length != null) answered++;
  }
  if (answers.somatic && !skipped.includes('somatic_awareness')) {
    if (answers.somatic.practice_types?.length) answered++;
    if (answers.somatic.frequency) answered++;
    if (answers.somatic.session_length) answered++;
    if (answers.somatic.breath_motion_integration) answered++;
    if (answers.somatic.sensation_markers?.length) answered++;
  }
  if (answers.yoga && !skipped.includes('structural_calm')) {
    if (answers.yoga.styles?.length) answered++;
    if (answers.yoga.frequency) answered++;
    if (answers.yoga.breath_under_strain) answered++;
    if (answers.yoga.balance_control) answered++;
    if (answers.yoga.injury_constraints != null) answered++;
  }

  const completeness_pct = Math.round((answered / totalFields) * 100);

  // Contradictions
  const contradictions = detectContradictions(answers);

  // Confidence
  let confidence: Confidence = 'high';
  if (completeness_pct < 55 || contradictions.length > 0) confidence = 'low';
  else if (completeness_pct < 85) confidence = 'med';

  const findings = generateFindings(answers, subscores, contradictions);

  return {
    assessed_at: new Date().toISOString(),
    overall_index,
    confidence,
    completeness_pct,
    subscores,
    findings,
    selected_focus_items: [],
  };
}
