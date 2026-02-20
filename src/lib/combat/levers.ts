/**
 * @module lib/combat/levers
 * Tiered fix library for Combat pillar. Diagnostic only.
 */
import type { CombatSubsystemId } from './types';

export type LeverDifficulty = 'easy' | 'med' | 'hard';
export type LeverImpact = 'low' | 'med' | 'high';

export interface CombatLever {
  id: string;
  tier: 1 | 2 | 3;
  title_key: string;
  why_key: string;
  difficulty: LeverDifficulty;
  impact: LeverImpact;
  subsystems: CombatSubsystemId[];
}

export const COMBAT_LEVERS: CombatLever[] = [
  // Tier 1
  { id: 'live_sparring_exposure', tier: 1, title_key: 'combat.lever_sparring', why_key: 'combat.lever_sparring_why', difficulty: 'hard', impact: 'high', subsystems: ['striking_skill', 'grappling_skill', 'reaction_speed'] },
  { id: 'breath_retention_fatigue', tier: 1, title_key: 'combat.lever_breath_fatigue', why_key: 'combat.lever_breath_fatigue_why', difficulty: 'med', impact: 'high', subsystems: ['conditioning'] },
  { id: 'ground_escape_reset', tier: 1, title_key: 'combat.lever_ground_escape', why_key: 'combat.lever_ground_escape_why', difficulty: 'med', impact: 'high', subsystems: ['grappling_skill'] },
  { id: 'reaction_drill_micro', tier: 1, title_key: 'combat.lever_reaction_micro', why_key: 'combat.lever_reaction_micro_why', difficulty: 'easy', impact: 'high', subsystems: ['reaction_speed', 'tactical_awareness'] },
  { id: 'sprint_power_intervals', tier: 1, title_key: 'combat.lever_sprint_intervals', why_key: 'combat.lever_sprint_intervals_why', difficulty: 'med', impact: 'high', subsystems: ['conditioning'] },

  // Tier 2
  { id: 'resistance_band_combos', tier: 2, title_key: 'combat.lever_band_combos', why_key: 'combat.lever_band_combos_why', difficulty: 'easy', impact: 'med', subsystems: ['striking_skill'] },
  { id: 'defensive_shadow_protocol', tier: 2, title_key: 'combat.lever_def_shadow', why_key: 'combat.lever_def_shadow_why', difficulty: 'med', impact: 'med', subsystems: ['striking_skill', 'reaction_speed'] },
  { id: 'grip_pull_strength', tier: 2, title_key: 'combat.lever_grip_pull', why_key: 'combat.lever_grip_pull_why', difficulty: 'med', impact: 'med', subsystems: ['grappling_skill', 'conditioning'] },
  { id: 'shin_conditioning_safe', tier: 2, title_key: 'combat.lever_shin_cond', why_key: 'combat.lever_shin_cond_why', difficulty: 'med', impact: 'med', subsystems: ['durability'] },

  // Tier 3
  { id: 'scenario_visualization', tier: 3, title_key: 'combat.lever_scenario_viz', why_key: 'combat.lever_scenario_viz_why', difficulty: 'easy', impact: 'med', subsystems: ['tactical_awareness'] },
  { id: 'footwork_grid_drills', tier: 3, title_key: 'combat.lever_footwork', why_key: 'combat.lever_footwork_why', difficulty: 'med', impact: 'med', subsystems: ['striking_skill', 'reaction_speed'] },
  { id: 'breath_under_strike', tier: 3, title_key: 'combat.lever_breath_strike', why_key: 'combat.lever_breath_strike_why', difficulty: 'hard', impact: 'high', subsystems: ['conditioning', 'durability'] },
];

/** Auto-pick top 3 levers based on lowest subscores */
export function autoPickCombatLevers(subscores: Record<CombatSubsystemId, number>): string[] {
  const sorted = (Object.entries(subscores) as [CombatSubsystemId, number][])
    .sort((a, b) => a[1] - b[1]);

  const picked: string[] = [];
  for (const [sub] of sorted) {
    if (picked.length >= 3) break;
    const candidates = COMBAT_LEVERS
      .filter(l => l.subsystems.includes(sub) && !picked.includes(l.id))
      .sort((a, b) => a.tier - b.tier);
    if (candidates.length > 0) picked.push(candidates[0].id);
  }

  if (picked.length < 3) {
    for (const l of COMBAT_LEVERS.filter(l => l.tier === 1 && !picked.includes(l.id))) {
      if (picked.length >= 3) break;
      picked.push(l.id);
    }
  }

  return picked;
}
