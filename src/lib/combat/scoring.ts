/**
 * @module lib/combat/scoring
 * Deterministic scoring engine for Combat (לחימה) Warrior Capability Assessment.
 * Rule-based only — no AI.
 */
import type {
  CombatIntakeAnswers, CombatSubscores, CombatFinding, CombatAssessmentResult,
  Confidence, CombatSubsystemId, BackgroundAnswers, StrikingAnswers,
  GrapplingAnswers, ReactionAnswers, ConditioningAnswers, DurabilityAnswers, TacticalAnswers,
} from './types';

/* ─── Background context modifier ─── */
function yearsBonus(years?: string): number {
  switch (years) {
    case '5_plus': return 15;
    case '3_5': return 10;
    case '1_3': return 5;
    case 'under_1': return 2;
    default: return 0;
  }
}

/* ─── Subsystem scoring ─── */

function scoreStriking(s?: StrikingAnswers, bg?: BackgroundAnswers): number {
  if (!s) return 0;
  let score = 0;

  // Combo fluency
  switch (s.combo_fluency) {
    case 'fluent': score += 30; break;
    case 'moderate': score += 18; break;
    case 'basic': score += 8; break;
  }

  // Training tools
  switch (s.training_tools) {
    case 'heavy_bag': score += 15; break;
    case 'pads': score += 20; break;
    case 'shadow_only': score += 8; break;
  }

  // Defensive awareness
  switch (s.defensive_awareness) {
    case 'head_movement': score += 25; break;
    case 'guard_only': score += 12; break;
    case 'minimal': score += 3; break;
  }

  // Technique under fatigue
  switch (s.technique_under_fatigue) {
    case 'yes': score += 20; break;
    case 'partially': score += 10; break;
  }

  // Background bonus
  const strikingDisciplines = ['boxing', 'muay_thai', 'kickboxing', 'krav_maga'];
  const hasStriking = bg?.disciplines?.some(d => strikingDisciplines.includes(d)) ?? false;
  if (hasStriking) score += yearsBonus(bg?.years_training) * 0.5;

  return Math.min(Math.round(score), 100);
}

function scoreGrappling(g?: GrapplingAnswers, bg?: BackgroundAnswers): number {
  if (!g) return 0;
  let score = 0;

  switch (g.live_sparring) {
    case 'regularly': score += 30; break;
    case 'occasionally': score += 15; break;
  }

  switch (g.ground_comfort) {
    case 'very_comfortable': score += 25; break;
    case 'moderate': score += 12; break;
    case 'panic': score += 0; break;
  }

  switch (g.mount_escape) {
    case 'yes': score += 25; break;
    case 'sometimes': score += 12; break;
  }

  switch (g.takedown_exp) {
    case 'trained': score += 20; break;
    case 'limited': score += 8; break;
  }

  const grapplingDisciplines = ['bjj', 'wrestling', 'judo'];
  const hasGrappling = bg?.disciplines?.some(d => grapplingDisciplines.includes(d)) ?? false;
  if (hasGrappling) score += yearsBonus(bg?.years_training) * 0.5;

  return Math.min(Math.round(score), 100);
}

function scoreReaction(r?: ReactionAnswers): number {
  if (!r) return 0;
  let score = 0;

  switch (r.reaction_drills) {
    case 'weekly': score += 35; break;
    case 'sometimes': score += 18; break;
  }

  switch (r.reflex_catch) {
    case 'strong': score += 35; break;
    case 'average': score += 18; break;
    case 'slow': score += 5; break;
  }

  switch (r.surprise_response) {
    case 'composed': score += 30; break;
    case 'tense': score += 12; break;
    case 'freeze': score += 0; break;
  }

  return Math.min(Math.round(score), 100);
}

function scoreConditioning(c?: ConditioningAnswers): number {
  if (!c) return 0;
  let score = 0;

  // Push-ups
  if (c.max_pushups != null) {
    if (c.max_pushups >= 50) score += 25;
    else if (c.max_pushups >= 30) score += 18;
    else if (c.max_pushups >= 15) score += 10;
    else if (c.max_pushups > 0) score += 4;
  }

  // Pull-ups
  if (c.max_pullups != null) {
    if (c.max_pullups >= 15) score += 25;
    else if (c.max_pullups >= 8) score += 18;
    else if (c.max_pullups >= 3) score += 10;
    else if (c.max_pullups > 0) score += 4;
  }

  // Sprint
  switch (c.sprint_ability) {
    case 'explosive': score += 25; break;
    case 'moderate': score += 15; break;
    case 'slow': score += 5; break;
  }

  // Shadowbox rounds
  switch (c.shadowbox_rounds) {
    case 'yes': score += 25; break;
    case 'barely': score += 12; break;
  }

  return Math.min(Math.round(score), 100);
}

function scoreDurability(d?: DurabilityAnswers): number {
  if (!d) return 0;
  let score = 0;

  switch (d.conditioning_body) {
    case 'regularly': score += 40; break;
    case 'lightly': score += 20; break;
  }

  switch (d.pain_tolerance) {
    case 'high': score += 40; break;
    case 'moderate': score += 20; break;
    case 'low': score += 5; break;
  }

  // Injury awareness bonus (acknowledged history = not in denial)
  if (d.injury_history && d.injury_history.trim().length > 0) score += 20;
  else score += 10; // no injuries is neutral

  return Math.min(Math.round(score), 100);
}

function scoreTactical(t?: TacticalAnswers): number {
  if (!t) return 0;
  let score = 0;

  switch (t.situational_awareness) {
    case 'always_scanning': score += 35; break;
    case 'sometimes': score += 18; break;
    case 'unaware': score += 3; break;
  }

  switch (t.scenario_drills) {
    case 'yes': score += 35; break;
    case 'limited': score += 15; break;
  }

  switch (t.confrontation_response) {
    case 'de_escalate': score += 30; break;
    case 'escalate': score += 10; break;
    case 'freeze': score += 0; break;
  }

  return Math.min(Math.round(score), 100);
}

/* ─── Contradiction detection ─── */

function detectContradictions(answers: CombatIntakeAnswers): string[] {
  const flags: string[] = [];

  // No disciplines but high combo fluency
  if (
    (answers.background?.disciplines?.includes('none') || answers.background?.disciplines?.length === 0) &&
    answers.striking?.combo_fluency === 'fluent'
  ) {
    flags.push('no_discipline_high_striking');
  }

  // No training but claims regular sparring
  if (answers.background?.years_training === 'none' && answers.grappling?.live_sparring === 'regularly') {
    flags.push('no_years_but_regular_sparring');
  }

  // High background, low current mode (potential skill decay)
  if (
    (answers.background?.years_training === '5_plus' || answers.background?.years_training === '3_5') &&
    answers.background?.training_mode === 'solo_shadow'
  ) {
    flags.push('skill_decay_risk');
  }

  return flags;
}

/* ─── Findings generation (max 6) ─── */

function generateFindings(
  answers: CombatIntakeAnswers,
  subscores: CombatSubscores,
  contradictions: string[]
): CombatFinding[] {
  const findings: CombatFinding[] = [];

  // Structural imbalance: striking vs grappling
  if (subscores.striking_skill >= 50 && subscores.grappling_skill < 25) {
    findings.push({ id: 'striking_grappling_imbalance', text_key: 'combat.finding_strike_grapple_imbalance', severity: 'high', subsystem: 'grappling_skill' });
  }
  if (subscores.grappling_skill >= 50 && subscores.striking_skill < 25) {
    findings.push({ id: 'grappling_striking_imbalance', text_key: 'combat.finding_grapple_strike_imbalance', severity: 'high', subsystem: 'striking_skill' });
  }

  // Strong conditioning, low tactical
  if (subscores.conditioning >= 50 && subscores.tactical_awareness < 25) {
    findings.push({ id: 'fit_but_unaware', text_key: 'combat.finding_fit_unaware', severity: 'med', subsystem: 'tactical_awareness' });
  }

  // Skill decay
  if (contradictions.includes('skill_decay_risk')) {
    findings.push({ id: 'skill_decay', text_key: 'combat.finding_skill_decay', severity: 'med', subsystem: 'striking_skill' });
  }

  // Solo training only
  if (answers.background?.training_mode === 'solo_shadow' && answers.grappling?.live_sparring === 'never') {
    findings.push({ id: 'sparring_deficit', text_key: 'combat.finding_sparring_deficit', severity: 'high', subsystem: 'grappling_skill' });
  }

  // Low reaction
  if (subscores.reaction_speed < 20) {
    findings.push({ id: 'low_reaction', text_key: 'combat.finding_low_reaction', severity: 'high', subsystem: 'reaction_speed' });
  }

  // Low durability
  if (subscores.durability < 20) {
    findings.push({ id: 'low_durability', text_key: 'combat.finding_low_durability', severity: 'med', subsystem: 'durability' });
  }

  // Contradiction findings
  if (contradictions.includes('no_discipline_high_striking')) {
    findings.push({ id: 'inconsistent_striking', text_key: 'combat.finding_inconsistent_striking', severity: 'med', subsystem: 'striking_skill' });
  }

  return findings.slice(0, 6);
}

/* ─── Main build function ─── */

export function buildCombatAssessment(answers: CombatIntakeAnswers): CombatAssessmentResult {
  const skipped = answers.skipped_subsystems ?? [];

  const subscores: CombatSubscores = {
    striking_skill: skipped.includes('striking_skill') ? 0 : scoreStriking(answers.striking, answers.background),
    grappling_skill: skipped.includes('grappling_skill') ? 0 : scoreGrappling(answers.grappling, answers.background),
    reaction_speed: skipped.includes('reaction_speed') ? 0 : scoreReaction(answers.reaction),
    conditioning: skipped.includes('conditioning') ? 0 : scoreConditioning(answers.conditioning),
    durability: skipped.includes('durability') ? 0 : scoreDurability(answers.durability),
    tactical_awareness: skipped.includes('tactical_awareness') ? 0 : scoreTactical(answers.tactical),
  };

  // Weighted average — skill 40%, conditioning 20%, reaction 15%, durability 10%, tactical 15%
  const baseWeights: Record<CombatSubsystemId, number> = {
    striking_skill: 0.2,
    grappling_skill: 0.2,
    reaction_speed: 0.15,
    conditioning: 0.2,
    durability: 0.1,
    tactical_awareness: 0.15,
  };

  const weights: Record<CombatSubsystemId, number> = {} as any;
  for (const k of Object.keys(baseWeights) as CombatSubsystemId[]) {
    weights[k] = skipped.includes(k) ? 0 : baseWeights[k];
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const warrior_index = totalWeight > 0
    ? Math.round(
      Object.entries(subscores).reduce((sum, [k, v]) => sum + v * weights[k as CombatSubsystemId], 0) / totalWeight
    )
    : 0;

  // Completeness — background (3) + 6 sections × ~4 questions avg = ~27 fields, use 30 as total
  const totalFields = 30;
  let answered = 0;

  if (answers.background) {
    if (answers.background.disciplines?.length) answered++;
    if (answers.background.years_training) answered++;
    if (answers.background.training_mode) answered++;
  }
  if (answers.striking && !skipped.includes('striking_skill')) {
    if (answers.striking.combo_fluency) answered++;
    if (answers.striking.training_tools) answered++;
    if (answers.striking.defensive_awareness) answered++;
    if (answers.striking.technique_under_fatigue) answered++;
  }
  if (answers.grappling && !skipped.includes('grappling_skill')) {
    if (answers.grappling.live_sparring) answered++;
    if (answers.grappling.ground_comfort) answered++;
    if (answers.grappling.mount_escape) answered++;
    if (answers.grappling.takedown_exp) answered++;
  }
  if (answers.reaction && !skipped.includes('reaction_speed')) {
    if (answers.reaction.reaction_drills) answered++;
    if (answers.reaction.reflex_catch) answered++;
    if (answers.reaction.surprise_response) answered++;
  }
  if (answers.conditioning && !skipped.includes('conditioning')) {
    if (answers.conditioning.max_pushups != null) answered++;
    if (answers.conditioning.max_pullups != null) answered++;
    if (answers.conditioning.sprint_ability) answered++;
    if (answers.conditioning.shadowbox_rounds) answered++;
  }
  if (answers.durability && !skipped.includes('durability')) {
    if (answers.durability.conditioning_body) answered++;
    if (answers.durability.pain_tolerance) answered++;
    if (answers.durability.injury_history != null) answered++;
  }
  if (answers.tactical && !skipped.includes('tactical_awareness')) {
    if (answers.tactical.situational_awareness) answered++;
    if (answers.tactical.scenario_drills) answered++;
    if (answers.tactical.confrontation_response) answered++;
  }

  const completeness_pct = Math.round((answered / totalFields) * 100);

  const contradictions = detectContradictions(answers);

  let confidence: Confidence = 'high';
  if (completeness_pct < 60 || contradictions.length > 0) confidence = 'low';
  else if (completeness_pct < 85) confidence = 'med';

  const findings = generateFindings(answers, subscores, contradictions);

  return {
    assessed_at: new Date().toISOString(),
    warrior_index,
    confidence,
    completeness_pct,
    subscores,
    findings,
    selected_focus_items: [],
  };
}
