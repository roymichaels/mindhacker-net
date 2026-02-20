/**
 * @module lib/consciousness/levers
 * Calibration Library for the Consciousness (תודעה) pillar.
 * Tiered lever items — no plan generation.
 */
import type { ConsciousnessSubsystemId } from './types';

export type LeverDifficulty = 'easy' | 'med' | 'hard';
export type LeverImpact = 'low' | 'med' | 'high';

export interface ConsciousnessLever {
  id: string;
  tier: 1 | 2 | 3;
  nameKey: string;
  whyKey: string;
  difficulty: LeverDifficulty;
  impact: LeverImpact;
  subsystems: ConsciousnessSubsystemId[];
  tags: string[];
}

export const CONSCIOUSNESS_LEVERS: ConsciousnessLever[] = [
  // Tier 1 — Core Calibration
  { id: 'soul_sentence', tier: 1, nameKey: 'consciousness.lever_soul_sentence', whyKey: 'consciousness.lever_soul_sentence_why', difficulty: 'easy', impact: 'high', subsystems: ['soul_intent_clarity'], tags: ['clarity', 'identity'] },
  { id: 'mask_drop', tier: 1, nameKey: 'consciousness.lever_mask_drop', whyKey: 'consciousness.lever_mask_drop_why', difficulty: 'med', impact: 'high', subsystems: ['mask_awareness'], tags: ['unmasking', 'truth'] },
  { id: 'coherence_breath', tier: 1, nameKey: 'consciousness.lever_coherence_breath', whyKey: 'consciousness.lever_coherence_breath_why', difficulty: 'easy', impact: 'high', subsystems: ['field_coherence', 'frequency_stability'], tags: ['breath', 'coherence'] },
  { id: 'values_bridge', tier: 1, nameKey: 'consciousness.lever_values_bridge', whyKey: 'consciousness.lever_values_bridge_why', difficulty: 'med', impact: 'high', subsystems: ['alignment_integrity'], tags: ['values', 'action'] },
  { id: 'silence_reps', tier: 1, nameKey: 'consciousness.lever_silence_reps', whyKey: 'consciousness.lever_silence_reps_why', difficulty: 'easy', impact: 'high', subsystems: ['inner_signal_access'], tags: ['silence', 'signal'] },

  // Tier 2 — Depth Work
  { id: 'unmasking_session', tier: 2, nameKey: 'consciousness.lever_unmasking_session', whyKey: 'consciousness.lever_unmasking_session_why', difficulty: 'med', impact: 'med', subsystems: ['mask_awareness', 'soul_intent_clarity'], tags: ['guided', 'meditation'] },
  { id: 'identity_reframe', tier: 2, nameKey: 'consciousness.lever_identity_reframe', whyKey: 'consciousness.lever_identity_reframe_why', difficulty: 'med', impact: 'med', subsystems: ['soul_intent_clarity', 'mask_awareness'], tags: ['hypnosis', 'identity'] },
  { id: 'shadow_journal', tier: 2, nameKey: 'consciousness.lever_shadow_journal', whyKey: 'consciousness.lever_shadow_journal_why', difficulty: 'easy', impact: 'med', subsystems: ['mask_awareness', 'alignment_integrity'], tags: ['journal', 'shadow'] },
  { id: 'somatic_training', tier: 2, nameKey: 'consciousness.lever_somatic_training', whyKey: 'consciousness.lever_somatic_training_why', difficulty: 'med', impact: 'med', subsystems: ['inner_signal_access', 'field_coherence'], tags: ['body', 'somatic'] },

  // Tier 3 — Energetic Arts
  { id: 'tai_chi', tier: 3, nameKey: 'consciousness.lever_tai_chi', whyKey: 'consciousness.lever_tai_chi_why', difficulty: 'hard', impact: 'high', subsystems: ['field_coherence', 'frequency_stability'], tags: ['energy', 'movement'] },
  { id: 'qi_gong', tier: 3, nameKey: 'consciousness.lever_qi_gong', whyKey: 'consciousness.lever_qi_gong_why', difficulty: 'hard', impact: 'high', subsystems: ['field_coherence', 'inner_signal_access'], tags: ['energy', 'qi'] },
  { id: 'nei_gong', tier: 3, nameKey: 'consciousness.lever_nei_gong', whyKey: 'consciousness.lever_nei_gong_why', difficulty: 'hard', impact: 'high', subsystems: ['field_coherence', 'inner_signal_access'], tags: ['energy', 'internal'] },
  { id: 'yoga', tier: 3, nameKey: 'consciousness.lever_yoga', whyKey: 'consciousness.lever_yoga_why', difficulty: 'med', impact: 'med', subsystems: ['field_coherence', 'frequency_stability'], tags: ['energy', 'movement'] },
];

/** Auto-pick top 3 levers based on lowest subscores (weighted) */
export function autoPickLevers(subscores: Record<ConsciousnessSubsystemId, number>): string[] {
  const sorted = (Object.entries(subscores) as [ConsciousnessSubsystemId, number][])
    .sort((a, b) => a[1] - b[1]);

  const picked: string[] = [];
  for (const [sub] of sorted) {
    if (picked.length >= 3) break;
    const candidates = CONSCIOUSNESS_LEVERS
      .filter(l => l.tier <= 2 && l.subsystems.includes(sub) && !picked.includes(l.id))
      .sort((a, b) => a.tier - b.tier);
    if (candidates.length > 0) picked.push(candidates[0].id);
  }

  if (picked.length < 3) {
    for (const l of CONSCIOUSNESS_LEVERS.filter(l => l.tier === 1 && !picked.includes(l.id))) {
      if (picked.length >= 3) break;
      picked.push(l.id);
    }
  }

  return picked;
}
