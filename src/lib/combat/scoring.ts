/**
 * @module lib/combat/scoring
 * Deterministic scoring for Combat — hybrid warrior model.
 */
import type {
  CombatIntakeAnswers, CombatSubscores, CombatFinding,
  CombatAssessmentResult, Confidence, CombatSubsystemId, WarriorMode,
} from './types';

/* ─── Subsystem scoring ─── */

function scoreStriking(a: CombatIntakeAnswers): number {
  let s = 0;
  const sh = a.shadow;
  const re = a.reality;

  // Shadow quality
  if (sh?.shadow_format === 'structured') {
    // Round volume
    const rounds = sh.rounds_per_session ?? 0;
    s += Math.min(rounds * 3, 15);
    // RPE
    const rpe = sh.rpe_last_2 ?? 0;
    if (rpe >= 8) s += 10; else if (rpe >= 6) s += 5;
    // Tech complexity
    switch (sh.tech_complexity_fatigue) {
      case 'fluid_freestyle': s += 20; break;
      case 'angles_defense': s += 15; break;
      case '3_4_combo': s += 10; break;
      case 'basic': s += 4; break;
    }
  } else if (sh?.shadow_format === 'continuous') {
    const mins = sh.minutes_before_degrade ?? 0;
    if (mins >= 15) s += 20; else if (mins >= 10) s += 14; else if (mins >= 5) s += 8;
    const rpe = sh.continuous_rpe ?? 0;
    if (rpe >= 8) s += 8; else if (rpe >= 6) s += 4;
    switch (sh.continuous_complexity) {
      case 'fluid_freestyle': s += 15; break;
      case 'angles_defense': s += 10; break;
      case '3_4_combo': s += 6; break;
    }
  }

  // Training modifiers
  if (sh?.uses_bands) s += 5;
  if (sh?.films_self) s += 5;
  if (sh?.trains_defense_shadow) s += 10;

  // Session volume
  const weekly = re?.sessions_per_week ?? 0;
  if (weekly >= 5) s += 10; else if (weekly >= 3) s += 6; else if (weekly >= 1) s += 3;

  // Live sparring bonus
  if (a.live?.sparring_sessions_30d && a.live.sparring_sessions_30d >= 4) s += 10;
  else if (a.live?.sparring_sessions_30d && a.live.sparring_sessions_30d >= 1) s += 5;

  return Math.min(Math.round(s), 100);
}

function scoreGrappling(a: CombatIntakeAnswers): number {
  const g = a.grappling;
  if (!g) return 0;
  let s = 0;

  switch (g.lifetime_rolling_hours) {
    case '200_plus': s += 30; break;
    case '50_200': s += 22; break;
    case '10_50': s += 14; break;
    case '1_10': s += 6; break;
  }

  switch (g.rolling_freq_12mo) {
    case '2x_weekly': s += 25; break;
    case 'weekly': s += 18; break;
    case 'monthly': s += 8; break;
  }

  if (g.escape_mount === 'yes') s += 20;
  else if (g.escape_mount === 'sometimes') s += 10;

  if (g.sprawl_instinct === 'yes') s += 25;
  else if (g.sprawl_instinct === 'sometimes') s += 12;

  return Math.min(Math.round(s), 100);
}

function scoreReaction(a: CombatIntakeAnswers): number {
  const r = a.reaction;
  if (!r) return 0;
  let s = 0;

  switch (r.surprise_response) {
    case 'composed': s += 35; break;
    case 'tense': s += 15; break;
  }

  switch (r.reaction_drill_freq) {
    case '5_plus': s += 30; break;
    case '3_4': s += 22; break;
    case '1_2': s += 12; break;
  }

  switch (r.scans_environment) {
    case 'yes_always': s += 35; break;
    case 'sometimes': s += 18; break;
    case 'rarely': s += 5; break;
  }

  return Math.min(Math.round(s), 100);
}

function scoreConditioning(a: CombatIntakeAnswers): number {
  const c = a.conditioning;
  if (!c) return 0;
  let s = 0;

  // Push-ups
  const pu = c.max_pushups ?? 0;
  if (pu >= 50) s += 15; else if (pu >= 30) s += 10; else if (pu >= 15) s += 6; else if (pu > 0) s += 2;

  // Pull-ups
  const pl = c.max_pullups ?? 0;
  if (pl >= 15) s += 15; else if (pl >= 8) s += 10; else if (pl >= 3) s += 6; else if (pl > 0) s += 2;

  // Air squats
  const sq = c.max_air_squats ?? 0;
  if (sq >= 60) s += 15; else if (sq >= 40) s += 10; else if (sq >= 20) s += 6; else if (sq > 0) s += 2;

  // 6x3:00 rounds
  switch (c.six_rounds_shadow) {
    case 'yes': s += 30; break;
    case 'barely': s += 15; break;
  }

  // Sprint
  switch (c.sprint_capacity) {
    case 'explosive': s += 25; break;
    case 'moderate': s += 15; break;
    case 'slow': s += 5; break;
  }

  return Math.min(Math.round(s), 100);
}

function scoreDurability(a: CombatIntakeAnswers): number {
  const d = a.durability;
  if (!d) return 0;
  let s = 0;

  switch (d.impact_conditioning) {
    case 'shin': s += 35; break;
    case 'knuckle': s += 35; break;
    case 'none': s += 5; break;
  }

  // Fewer injury flags = more durable
  const flags = d.injury_flags ?? [];
  if (flags.includes('none') || flags.length === 0) s += 65;
  else if (flags.length === 1) s += 40;
  else if (flags.length === 2) s += 25;
  else s += 10;

  return Math.min(Math.round(s), 100);
}

/* ─── Contradiction detection ─── */

function detectContradictions(a: CombatIntakeAnswers): string[] {
  const flags: string[] = [];
  const mode = a.profile?.warrior_mode;

  // Solo-only but claims high sparring
  if (mode === 'solo' && (a.live?.sparring_sessions_30d ?? 0) > 0) {
    flags.push('solo_but_sparring');
  }

  // Zero sessions but high RPE
  if ((a.reality?.sessions_per_week ?? 0) === 0 && (a.shadow?.rpe_last_2 ?? 0) >= 8) {
    flags.push('zero_sessions_high_rpe');
  }

  // High lifetime grappling but zero recent
  if (
    (a.grappling?.lifetime_rolling_hours === '200_plus' || a.grappling?.lifetime_rolling_hours === '50_200') &&
    a.grappling?.rolling_freq_12mo === 'none'
  ) {
    flags.push('grappling_skill_decay');
  }

  return flags;
}

/* ─── Findings ─── */

function generateFindings(
  a: CombatIntakeAnswers,
  subscores: CombatSubscores,
  contradictions: string[]
): CombatFinding[] {
  const findings: CombatFinding[] = [];
  const mode = a.profile?.warrior_mode;
  const monthly = a.reality?.sessions_last_30 ?? 0;

  // High solo, zero live
  if (mode === 'solo' && monthly >= 8) {
    findings.push({ id: 'high_solo_zero_live', text_key: 'combat.finding_high_solo_zero_live', severity: 'med', subsystem: 'striking_skill' });
  }

  // Strong solo engine
  if (subscores.striking_skill >= 60 && (mode === 'solo' || mode === 'hybrid')) {
    findings.push({ id: 'strong_solo_engine', text_key: 'combat.finding_strong_solo_engine', severity: 'low', subsystem: 'striking_skill' });
  }

  // Grappling skill decay
  if (contradictions.includes('grappling_skill_decay')) {
    findings.push({ id: 'grappling_decay', text_key: 'combat.finding_grappling_decay', severity: 'high', subsystem: 'grappling_skill' });
  }

  // Freeze response
  if (a.reaction?.surprise_response === 'freeze') {
    findings.push({ id: 'freeze_response', text_key: 'combat.finding_freeze_response', severity: 'high', subsystem: 'reaction_speed' });
  }

  // Panic under pressure
  if (a.live?.panic_under_pressure === 'often') {
    findings.push({ id: 'panic_pressure', text_key: 'combat.finding_panic_pressure', severity: 'high', subsystem: 'reaction_speed' });
  }

  // Low conditioning
  if (subscores.conditioning < 25) {
    findings.push({ id: 'low_conditioning', text_key: 'combat.finding_low_conditioning', severity: 'high', subsystem: 'conditioning' });
  }

  // Imbalance: striking vs grappling
  if (subscores.striking_skill >= 50 && subscores.grappling_skill < 20) {
    findings.push({ id: 'strike_grapple_gap', text_key: 'combat.finding_strike_grapple_gap', severity: 'med', subsystem: 'grappling_skill' });
  }

  // Breath loss in live
  if (a.live?.breath_through_rounds === 'lose_control') {
    findings.push({ id: 'breath_loss_live', text_key: 'combat.finding_breath_loss_live', severity: 'high', subsystem: 'conditioning' });
  }

  return findings.slice(0, 6);
}

/* ─── Main build function ─── */

export function buildCombatAssessment(answers: CombatIntakeAnswers): CombatAssessmentResult {
  const skipped = answers.skipped_subsystems ?? [];
  const mode = answers.profile?.warrior_mode ?? 'solo';

  const subscores: CombatSubscores = {
    striking_skill: skipped.includes('striking_skill') ? 0 : scoreStriking(answers),
    grappling_skill: skipped.includes('grappling_skill') ? 0 : scoreGrappling(answers),
    reaction_speed: skipped.includes('reaction_speed') ? 0 : scoreReaction(answers),
    conditioning: skipped.includes('conditioning') ? 0 : scoreConditioning(answers),
    durability: skipped.includes('durability') ? 0 : scoreDurability(answers),
    tactical_awareness: 0, // Rolled into reaction for this version
  };

  // Tactical = reaction subscore echo (combined section)
  subscores.tactical_awareness = subscores.reaction_speed;

  // Weights — redistribute Live weight for solo-only
  const baseWeights: Record<CombatSubsystemId, number> = {
    striking_skill: 0.35,
    grappling_skill: 0.15,
    reaction_speed: 0.10,
    conditioning: 0.20,
    durability: 0.10,
    tactical_awareness: 0.10,
  };

  if (mode === 'solo') {
    // Redistribute live depth (20%) into skill + conditioning
    baseWeights.striking_skill += 0.10;
    baseWeights.conditioning += 0.10;
  }

  // No grappling history in tactical mode — don't punish
  if (mode === 'tactical' && subscores.grappling_skill === 0) {
    const gw = baseWeights.grappling_skill;
    baseWeights.grappling_skill = 0;
    baseWeights.tactical_awareness += gw;
  }

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

  // Completeness
  const totalFields = 28;
  let answered = 0;

  if (answers.profile?.warrior_mode) answered++;
  if (answers.reality) {
    if (answers.reality.sessions_per_week != null) answered++;
    if (answers.reality.sessions_last_30 != null) answered++;
    if (answers.reality.solo_vs_live_pct != null) answered++;
  }
  if (answers.shadow) {
    if (answers.shadow.shadow_format) answered++;
    if (answers.shadow.uses_bands != null) answered++;
    if (answers.shadow.films_self != null) answered++;
    if (answers.shadow.trains_defense_shadow != null) answered++;
    if (answers.shadow.shadow_format === 'structured') {
      if (answers.shadow.round_length) answered++;
      if (answers.shadow.rounds_per_session != null) answered++;
      if (answers.shadow.rpe_last_2 != null) answered++;
      if (answers.shadow.tech_complexity_fatigue) answered++;
    } else if (answers.shadow.shadow_format === 'continuous') {
      if (answers.shadow.minutes_before_degrade != null) answered++;
      if (answers.shadow.continuous_rpe != null) answered++;
      if (answers.shadow.continuous_complexity) answered++;
    }
  }
  if (answers.live && mode !== 'solo') {
    if (answers.live.sparring_sessions_30d != null) answered++;
    if (answers.live.intensity_level) answered++;
    if (answers.live.panic_under_pressure) answered++;
    if (answers.live.breath_through_rounds) answered++;
  }
  if (answers.grappling) {
    if (answers.grappling.lifetime_rolling_hours) answered++;
    if (answers.grappling.rolling_freq_12mo) answered++;
    if (answers.grappling.escape_mount) answered++;
    if (answers.grappling.sprawl_instinct) answered++;
  }
  if (answers.reaction) {
    if (answers.reaction.surprise_response) answered++;
    if (answers.reaction.reaction_drill_freq) answered++;
    if (answers.reaction.scans_environment) answered++;
  }
  if (answers.conditioning) {
    if (answers.conditioning.max_pushups != null) answered++;
    if (answers.conditioning.max_pullups != null) answered++;
    if (answers.conditioning.max_air_squats != null) answered++;
    if (answers.conditioning.six_rounds_shadow) answered++;
    if (answers.conditioning.sprint_capacity) answered++;
  }
  if (answers.durability) {
    if (answers.durability.impact_conditioning) answered++;
    if (answers.durability.injury_flags?.length) answered++;
  }

  const completeness_pct = Math.min(Math.round((answered / totalFields) * 100), 100);

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
    warrior_mode: mode,
  };
}
