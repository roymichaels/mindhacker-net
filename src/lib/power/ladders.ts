/**
 * @module lib/power/ladders
 * Skill progression ladders for calisthenics skills.
 * Each step has a level (1-based) and i18n key suffix.
 */
import type { SkillLadderStep } from './types';

export const HANDSTAND_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'plank_hold_60s' },
  { level: 2, key: 'pike_hold_30s' },
  { level: 3, key: 'wall_walk_up' },
  { level: 4, key: 'wall_hold_30s' },
  { level: 5, key: 'wall_hold_60s' },
  { level: 6, key: 'wall_shoulder_taps' },
  { level: 7, key: 'kick_up_hold_3s' },
  { level: 8, key: 'freestanding_5s' },
  { level: 9, key: 'freestanding_15s' },
  { level: 10, key: 'freestanding_30s' },
  { level: 11, key: 'freestanding_60s' },
  { level: 12, key: 'walking' },
  { level: 13, key: 'press_to_hs' },
];

export const PLANCHE_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'pseudo_planche_pushup' },
  { level: 2, key: 'planche_lean_10s' },
  { level: 3, key: 'frog_stand' },
  { level: 4, key: 'frog_stand_15s' },
  { level: 5, key: 'tuck_planche' },
  { level: 6, key: 'adv_tuck' },
  { level: 7, key: 'one_leg' },
  { level: 8, key: 'straddle' },
  { level: 9, key: 'half_lay' },
  { level: 10, key: 'full_planche' },
];

export const FRONT_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'dead_hang_30s' },
  { level: 2, key: 'active_hang_15s' },
  { level: 3, key: 'tuck_fl_hold' },
  { level: 4, key: 'tuck_fl' },
  { level: 5, key: 'adv_tuck_fl' },
  { level: 6, key: 'one_leg_fl' },
  { level: 7, key: 'straddle_fl' },
  { level: 8, key: 'half_lay_fl' },
  { level: 9, key: 'full_fl' },
];

export const BACK_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'skin_the_cat' },
  { level: 2, key: 'german_hang_10s' },
  { level: 3, key: 'tuck_bl' },
  { level: 4, key: 'adv_tuck_bl' },
  { level: 5, key: 'one_leg_bl' },
  { level: 6, key: 'straddle_bl' },
  { level: 7, key: 'full_bl' },
];

export const HUMAN_FLAG_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'vertical_flag_hold' },
  { level: 2, key: 'tuck_flag' },
  { level: 3, key: 'one_leg_flag' },
  { level: 4, key: 'straddle_flag' },
  { level: 5, key: 'full_flag' },
];

export const MUSCLE_UP_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'pullup_5_strict' },
  { level: 2, key: 'straight_bar_dip_3' },
  { level: 3, key: 'false_grip_hang_15s' },
  { level: 4, key: 'false_grip_pullup' },
  { level: 5, key: 'high_pullup' },
  { level: 6, key: 'explosive_pullup' },
  { level: 7, key: 'negative_mu' },
  { level: 8, key: 'kipping_mu' },
  { level: 9, key: 'strict_mu_1' },
  { level: 10, key: 'strict_mu_3' },
  { level: 11, key: 'strict_mu_5' },
  { level: 12, key: 'bar_mu' },
  { level: 13, key: 'weighted_mu' },
];

export const PISTOL_SQUAT_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'bw_squat_20' },
  { level: 2, key: 'deep_squat_hold_30s' },
  { level: 3, key: 'split_squat' },
  { level: 4, key: 'bulgarian_split' },
  { level: 5, key: 'shrimp_squat_assisted' },
  { level: 6, key: 'assisted_pistol' },
  { level: 7, key: 'box_pistol' },
  { level: 8, key: 'full_pistol' },
  { level: 9, key: 'pistol_3_reps' },
  { level: 10, key: 'pistol_5_reps' },
  { level: 11, key: 'weighted_pistol' },
];

export const VSIT_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'knee_raise_hold' },
  { level: 2, key: 'tucked_lsit' },
  { level: 3, key: 'one_leg_lsit' },
  { level: 4, key: 'full_lsit' },
  { level: 5, key: 'adv_lsit' },
  { level: 6, key: 'tucked_vsit' },
  { level: 7, key: 'straddle_vsit' },
  { level: 8, key: 'full_vsit' },
];

export const SKILL_LADDERS = {
  handstand: HANDSTAND_LADDER,
  planche: PLANCHE_LADDER,
  frontLever: FRONT_LEVER_LADDER,
  backLever: BACK_LEVER_LADDER,
  humanFlag: HUMAN_FLAG_LADDER,
  muscleUp: MUSCLE_UP_LADDER,
  pistolSquat: PISTOL_SQUAT_LADDER,
  vSit: VSIT_LADDER,
} as const;

export type SkillName = keyof typeof SKILL_LADDERS;
