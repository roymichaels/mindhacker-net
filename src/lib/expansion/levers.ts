/**
 * @module lib/expansion/levers
 * Fix library — lever cards for the Expansion pillar.
 * Diagnostic suggestions only. No plan generation.
 */
import type { SubsystemId } from './types';

export type LeverDifficulty = 'easy' | 'med' | 'hard';
export type LeverImpact = 'low' | 'med' | 'high';

export interface ExpansionLever {
  id: string;
  tier: 1 | 2 | 3;
  title_key: string;
  why_key: string;
  difficulty: LeverDifficulty;
  impact: LeverImpact;
  subsystems: SubsystemId[];
}

export const EXPANSION_LEVERS: ExpansionLever[] = [
  // Tier 1 — highest impact
  { id: 'weekly_synthesis', tier: 1, title_key: 'expansion.lever_weekly_synthesis', why_key: 'expansion.lever_weekly_synthesis_why', difficulty: 'easy', impact: 'high', subsystems: ['learning_depth'] },
  { id: 'publish_before_perfect', tier: 1, title_key: 'expansion.lever_publish_before_perfect', why_key: 'expansion.lever_publish_before_perfect_why', difficulty: 'med', impact: 'high', subsystems: ['creative_output'] },
  { id: 'implementation_loop', tier: 1, title_key: 'expansion.lever_implementation_loop', why_key: 'expansion.lever_implementation_loop_why', difficulty: 'med', impact: 'high', subsystems: ['learning_depth'] },
  { id: 'opposition_journaling', tier: 1, title_key: 'expansion.lever_opposition_journaling', why_key: 'expansion.lever_opposition_journaling_why', difficulty: 'easy', impact: 'high', subsystems: ['philosophical_depth'] },
  { id: 'language_immersion', tier: 1, title_key: 'expansion.lever_language_immersion', why_key: 'expansion.lever_language_immersion_why', difficulty: 'med', impact: 'high', subsystems: ['language_complexity'] },

  // Tier 2
  { id: 'concept_mapping', tier: 2, title_key: 'expansion.lever_concept_mapping', why_key: 'expansion.lever_concept_mapping_why', difficulty: 'easy', impact: 'med', subsystems: ['learning_depth'] },
  { id: 'deep_reading_block', tier: 2, title_key: 'expansion.lever_deep_reading', why_key: 'expansion.lever_deep_reading_why', difficulty: 'easy', impact: 'med', subsystems: ['learning_depth', 'philosophical_depth'] },
  { id: 'constraint_creativity', tier: 2, title_key: 'expansion.lever_constraint_creativity', why_key: 'expansion.lever_constraint_creativity_why', difficulty: 'med', impact: 'med', subsystems: ['creative_output'] },

  // Tier 3
  { id: 'dialectical_training', tier: 3, title_key: 'expansion.lever_dialectical', why_key: 'expansion.lever_dialectical_why', difficulty: 'hard', impact: 'high', subsystems: ['philosophical_depth'] },
  { id: 'system_model_sketch', tier: 3, title_key: 'expansion.lever_system_model', why_key: 'expansion.lever_system_model_why', difficulty: 'hard', impact: 'med', subsystems: ['philosophical_depth', 'learning_depth'] },
];

/** Get levers relevant to a given subsystem */
export function getLeversForSubsystem(subsystem: SubsystemId): ExpansionLever[] {
  return EXPANSION_LEVERS.filter(l => l.subsystems.includes(subsystem));
}

/** Auto-pick top 3 levers based on lowest subscores */
export function autoPickLevers(subscores: Record<SubsystemId, number>): string[] {
  const sorted = (Object.entries(subscores) as [SubsystemId, number][])
    .sort((a, b) => a[1] - b[1]);

  const picked: string[] = [];
  for (const [sub] of sorted) {
    if (picked.length >= 3) break;
    const candidates = EXPANSION_LEVERS
      .filter(l => l.subsystems.includes(sub) && !picked.includes(l.id))
      .sort((a, b) => a.tier - b.tier);
    if (candidates.length > 0) picked.push(candidates[0].id);
  }

  if (picked.length < 3) {
    for (const l of EXPANSION_LEVERS.filter(l => l.tier === 1 && !picked.includes(l.id))) {
      if (picked.length >= 3) break;
      picked.push(l.id);
    }
  }

  return picked;
}
