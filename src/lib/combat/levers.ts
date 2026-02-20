/**
 * @module lib/combat/levers
 * Fix library — lever cards for the Combat pillar.
 * Diagnostic suggestions only. No plan generation.
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
  { id: 'reaction_drill_protocol', tier: 1, title_key: 'combat.lever_reaction_drill', why_key: 'combat.lever_reaction_drill_why', difficulty: 'med', impact: 'high', subsystems: ['reaction_speed'] },
  { id: 'ground_escape_basics', tier: 1, title_key: 'combat.lever_ground_escape', why_key: 'combat.lever_ground_escape_why', difficulty: 'med', impact: 'high', subsystems: ['grappling_skill'] },
  { id: 'sprint_power_work', tier: 1, title_key: 'combat.lever_sprint_power', why_key: 'combat.lever_sprint_power_why', difficulty: 'med', impact: 'high', subsystems: ['conditioning'] },
  { id: '3_round_shadow_stamina', tier: 1, title_key: 'combat.lever_shadow_stamina', why_key: 'combat.lever_shadow_stamina_why', difficulty: 'easy', impact: 'high', subsystems: ['conditioning', 'striking_skill'] },

  // Tier 2
  { id: 'bag_combination_drills', tier: 2, title_key: 'combat.lever_bag_combos', why_key: 'combat.lever_bag_combos_why', difficulty: 'easy', impact: 'med', subsystems: ['striking_skill'] },
  { id: 'shin_conditioning', tier: 2, title_key: 'combat.lever_shin_cond', why_key: 'combat.lever_shin_cond_why', difficulty: 'med', impact: 'med', subsystems: ['durability'] },
  { id: 'grip_strength', tier: 2, title_key: 'combat.lever_grip', why_key: 'combat.lever_grip_why', difficulty: 'easy', impact: 'med', subsystems: ['grappling_skill', 'durability'] },
  { id: 'defensive_head_movement', tier: 2, title_key: 'combat.lever_head_movement', why_key: 'combat.lever_head_movement_why', difficulty: 'med', impact: 'med', subsystems: ['striking_skill', 'reaction_speed'] },

  // Tier 3
  { id: 'scenario_visualization', tier: 3, title_key: 'combat.lever_scenario_viz', why_key: 'combat.lever_scenario_viz_why', difficulty: 'easy', impact: 'med', subsystems: ['tactical_awareness'] },
  { id: 'footwork_precision', tier: 3, title_key: 'combat.lever_footwork', why_key: 'combat.lever_footwork_why', difficulty: 'med', impact: 'med', subsystems: ['striking_skill', 'reaction_speed'] },
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
