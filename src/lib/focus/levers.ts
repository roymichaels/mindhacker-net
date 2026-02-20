/**
 * @module lib/focus/levers
 * Fix library — lever cards for the Focus pillar.
 * Diagnostic suggestions only. No plan generation.
 */
import type { SubsystemId } from './types';

export type LeverDifficulty = 'easy' | 'med' | 'hard';
export type LeverImpact = 'low' | 'med' | 'high';

export interface FocusLever {
  id: string;
  tier: 1 | 2 | 3;
  title_key: string;
  why_key: string;
  difficulty: LeverDifficulty;
  impact: LeverImpact;
  subsystems: SubsystemId[];
}

export const FOCUS_LEVERS: FocusLever[] = [
  // Tier 1 — highest impact
  { id: 'coherent_breathing_6bpm', tier: 1, title_key: 'focus.lever_coherent_breathing', why_key: 'focus.lever_coherent_breathing_why', difficulty: 'easy', impact: 'high', subsystems: ['breath_control'] },
  { id: 'nasal_breathing_reset', tier: 1, title_key: 'focus.lever_nasal_reset', why_key: 'focus.lever_nasal_reset_why', difficulty: 'easy', impact: 'high', subsystems: ['breath_control'] },
  { id: '10min_silent_sit', tier: 1, title_key: 'focus.lever_silent_sit', why_key: 'focus.lever_silent_sit_why', difficulty: 'med', impact: 'high', subsystems: ['attention_stability'] },
  { id: 'hypnosis_depth_basic', tier: 1, title_key: 'focus.lever_hypnosis_basic', why_key: 'focus.lever_hypnosis_basic_why', difficulty: 'med', impact: 'high', subsystems: ['trance_depth'] },
  { id: 'evening_downshift', tier: 1, title_key: 'focus.lever_evening_downshift', why_key: 'focus.lever_evening_downshift_why', difficulty: 'easy', impact: 'high', subsystems: ['breath_control', 'attention_stability'] },
  { id: 'screen_winddown', tier: 1, title_key: 'focus.lever_screen_winddown', why_key: 'focus.lever_screen_winddown_why', difficulty: 'easy', impact: 'high', subsystems: ['attention_stability', 'structural_calm'] },
  { id: 'tai_chi_5min', tier: 1, title_key: 'focus.lever_tai_chi_5min', why_key: 'focus.lever_tai_chi_5min_why', difficulty: 'med', impact: 'high', subsystems: ['somatic_awareness'] },
  { id: 'yoga_nasal_flow', tier: 1, title_key: 'focus.lever_yoga_nasal', why_key: 'focus.lever_yoga_nasal_why', difficulty: 'med', impact: 'high', subsystems: ['structural_calm', 'breath_control'] },

  // Tier 2
  { id: 'box_breathing_sets', tier: 2, title_key: 'focus.lever_box_breathing', why_key: 'focus.lever_box_breathing_why', difficulty: 'easy', impact: 'med', subsystems: ['breath_control'] },
  { id: 'guided_non_sleep', tier: 2, title_key: 'focus.lever_guided_non_sleep', why_key: 'focus.lever_guided_non_sleep_why', difficulty: 'easy', impact: 'med', subsystems: ['guided_suggestibility'] },
  { id: 'breath_hold_co2', tier: 2, title_key: 'focus.lever_co2_tolerance', why_key: 'focus.lever_co2_tolerance_why', difficulty: 'med', impact: 'med', subsystems: ['breath_control'] },
  { id: 'somatic_scan_8min', tier: 2, title_key: 'focus.lever_somatic_scan', why_key: 'focus.lever_somatic_scan_why', difficulty: 'easy', impact: 'med', subsystems: ['somatic_awareness', 'guided_suggestibility'] },
  { id: 'mantra_focus', tier: 2, title_key: 'focus.lever_mantra_focus', why_key: 'focus.lever_mantra_focus_why', difficulty: 'med', impact: 'med', subsystems: ['attention_stability'] },
  { id: 'posture_relax', tier: 2, title_key: 'focus.lever_posture_relax', why_key: 'focus.lever_posture_relax_why', difficulty: 'easy', impact: 'med', subsystems: ['structural_calm', 'somatic_awareness'] },

  // Tier 3
  { id: 'trance_fractionation', tier: 3, title_key: 'focus.lever_fractionation', why_key: 'focus.lever_fractionation_why', difficulty: 'hard', impact: 'high', subsystems: ['trance_depth'] },
  { id: 'nei_gong_standing', tier: 3, title_key: 'focus.lever_nei_gong', why_key: 'focus.lever_nei_gong_why', difficulty: 'hard', impact: 'med', subsystems: ['somatic_awareness'] },
  { id: 'pranayama_basic', tier: 3, title_key: 'focus.lever_pranayama', why_key: 'focus.lever_pranayama_why', difficulty: 'med', impact: 'med', subsystems: ['breath_control', 'attention_stability'] },
  { id: 'mobility_recovery_breath', tier: 3, title_key: 'focus.lever_mobility_recovery', why_key: 'focus.lever_mobility_recovery_why', difficulty: 'easy', impact: 'low', subsystems: ['structural_calm'] },
];

/** Get levers relevant to a given subsystem */
export function getLeversForSubsystem(subsystem: SubsystemId): FocusLever[] {
  return FOCUS_LEVERS.filter(l => l.subsystems.includes(subsystem));
}

/** Auto-pick top 3 levers based on lowest subscores */
export function autoPickLevers(subscores: Record<SubsystemId, number>): string[] {
  // Sort subsystems by score ascending
  const sorted = (Object.entries(subscores) as [SubsystemId, number][])
    .sort((a, b) => a[1] - b[1]);

  const picked: string[] = [];
  for (const [sub] of sorted) {
    if (picked.length >= 3) break;
    const candidates = FOCUS_LEVERS
      .filter(l => l.subsystems.includes(sub) && !picked.includes(l.id))
      .sort((a, b) => a.tier - b.tier);
    if (candidates.length > 0) picked.push(candidates[0].id);
  }

  // Fill remaining from tier 1
  if (picked.length < 3) {
    for (const l of FOCUS_LEVERS.filter(l => l.tier === 1 && !picked.includes(l.id))) {
      if (picked.length >= 3) break;
      picked.push(l.id);
    }
  }

  return picked;
}
