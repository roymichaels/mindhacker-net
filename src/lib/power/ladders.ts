/**
 * @module lib/power/ladders
 * Skill progression ladders for calisthenics skills.
 * Based on the Reddit BWF progression chart & Overcoming Gravity.
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
  { level: 14, key: 'one_arm_hs_progression' },
  { level: 15, key: 'straddle_one_arm_hs' },
];

export const HSPU_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'hspu_pike_pushup' },
  { level: 2, key: 'hspu_decline_pike' },
  { level: 3, key: 'hspu_box_pike' },
  { level: 4, key: 'hspu_wall_neg' },
  { level: 5, key: 'hspu_wall_partial' },
  { level: 6, key: 'hspu_wall_full' },
  { level: 7, key: 'hspu_wall_deficit' },
  { level: 8, key: 'hspu_free_neg' },
  { level: 9, key: 'hspu_free_partial' },
  { level: 10, key: 'hspu_free_full' },
  { level: 11, key: 'hspu_ring_wall' },
  { level: 12, key: 'hspu_ring_free' },
];

export const PLANCHE_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'pseudo_planche_pushup' },
  { level: 2, key: 'planche_lean_10s' },
  { level: 3, key: 'frog_stand' },
  { level: 4, key: 'frog_stand_15s' },
  { level: 5, key: 'sa_frog_stand' },
  { level: 6, key: 'tuck_planche' },
  { level: 7, key: 'adv_tuck' },
  { level: 8, key: 'one_leg' },
  { level: 9, key: 'straddle' },
  { level: 10, key: 'full_planche' },
  { level: 11, key: 'pl_tuck_planche_pu' },
  { level: 12, key: 'pl_adv_tuck_pu' },
  { level: 13, key: 'pl_straddle_pu' },
  { level: 14, key: 'pl_full_planche_pu' },
];

export const FRONT_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'dead_hang_30s' },
  { level: 2, key: 'active_hang_15s' },
  { level: 3, key: 'scap_pull' },
  { level: 4, key: 'tuck_fl_hold' },
  { level: 5, key: 'tuck_fl' },
  { level: 6, key: 'adv_tuck_fl' },
  { level: 7, key: 'one_leg_fl' },
  { level: 8, key: 'straddle_fl' },
  { level: 9, key: 'full_fl' },
  { level: 10, key: 'fl_tuck_row' },
  { level: 11, key: 'fl_adv_tuck_row' },
  { level: 12, key: 'fl_straddle_row' },
  { level: 13, key: 'fl_full_row' },
  { level: 14, key: 'fl_to_inverted' },
];

export const BACK_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'german_hang_hold' },
  { level: 2, key: 'skin_the_cat' },
  { level: 3, key: 'tuck_skin_the_cat' },
  { level: 4, key: 'adv_tuck_skin_the_cat' },
  { level: 5, key: 'tuck_bl' },
  { level: 6, key: 'adv_tuck_bl' },
  { level: 7, key: 'one_leg_bl' },
  { level: 8, key: 'straddle_bl' },
  { level: 9, key: 'full_bl' },
  { level: 10, key: 'bl_pullout' },
  { level: 11, key: 'bl_hs_lower_to_bl' },
];

export const HUMAN_FLAG_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'hf_side_plank' },
  { level: 2, key: 'vertical_flag_hold' },
  { level: 3, key: 'tuck_flag' },
  { level: 4, key: 'adv_tuck_flag' },
  { level: 5, key: 'one_leg_flag' },
  { level: 6, key: 'straddle_flag' },
  { level: 7, key: 'full_flag' },
];

export const MUSCLE_UP_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'mu_dead_hang_20s' },
  { level: 2, key: 'mu_pullup_1' },
  { level: 3, key: 'mu_pullup_5' },
  { level: 4, key: 'mu_chest_to_bar' },
  { level: 5, key: 'mu_explosive_pullup' },
  { level: 6, key: 'mu_dip_on_bar' },
  { level: 7, key: 'mu_false_grip_hang' },
  { level: 8, key: 'mu_false_grip_pullup' },
  { level: 9, key: 'mu_band_assisted' },
  { level: 10, key: 'mu_negative' },
  { level: 11, key: 'mu_kipping' },
  { level: 12, key: 'mu_strict_1' },
  { level: 13, key: 'mu_strict_3' },
  { level: 14, key: 'mu_strict_5' },
  { level: 15, key: 'mu_clean_bar' },
  { level: 16, key: 'mu_wide' },
  { level: 17, key: 'mu_lsit' },
  { level: 18, key: 'mu_weighted' },
];

export const RING_MUSCLE_UP_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'rmu_ring_support_hold' },
  { level: 2, key: 'rmu_ring_dip_3' },
  { level: 3, key: 'rmu_ring_pullup_5' },
  { level: 4, key: 'rmu_false_grip_hang' },
  { level: 5, key: 'rmu_false_grip_pullup' },
  { level: 6, key: 'rmu_negative' },
  { level: 7, key: 'rmu_kipping' },
  { level: 8, key: 'rmu_strict_1' },
  { level: 9, key: 'rmu_strict_3' },
  { level: 10, key: 'rmu_strict_5' },
  { level: 11, key: 'rmu_rto_support' },
  { level: 12, key: 'rmu_weighted' },
];

export const PISTOL_SQUAT_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'ps_assisted_squat' },
  { level: 2, key: 'ps_parallel_squat' },
  { level: 3, key: 'bw_squat_20' },
  { level: 4, key: 'deep_squat_hold_30s' },
  { level: 5, key: 'split_squat' },
  { level: 6, key: 'bulgarian_split' },
  { level: 7, key: 'ps_cossack_squat' },
  { level: 8, key: 'ps_partial_pistol' },
  { level: 9, key: 'assisted_pistol' },
  { level: 10, key: 'box_pistol' },
  { level: 11, key: 'full_pistol' },
  { level: 12, key: 'pistol_3_reps' },
  { level: 13, key: 'pistol_5_reps' },
  { level: 14, key: 'weighted_pistol' },
];

export const SHRIMP_SQUAT_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'ss_step_up' },
  { level: 2, key: 'ss_deep_step_up' },
  { level: 3, key: 'ss_beginner' },
  { level: 4, key: 'ss_intermediate' },
  { level: 5, key: 'ss_advanced' },
  { level: 6, key: 'ss_elevated' },
  { level: 7, key: 'ss_two_hand' },
  { level: 8, key: 'ss_elevated_2h' },
  { level: 9, key: 'ss_full' },
];

export const NORDIC_CURL_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'nc_ol_deadlift' },
  { level: 2, key: 'nc_90_hip' },
  { level: 3, key: 'nc_45_hip' },
  { level: 4, key: 'nc_negative' },
  { level: 5, key: 'nc_partial' },
  { level: 6, key: 'nc_full' },
  { level: 7, key: 'nc_arms_overhead' },
  { level: 8, key: 'nc_tuck_one_leg' },
  { level: 9, key: 'nc_one_leg' },
];

export const VSIT_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'knee_raise_hold' },
  { level: 2, key: 'tucked_lsit' },
  { level: 3, key: 'one_leg_lsit' },
  { level: 4, key: 'full_lsit' },
  { level: 5, key: 'adv_lsit' },
  { level: 6, key: 'tucked_vsit' },
  { level: 7, key: 'vs_45_degree' },
  { level: 8, key: 'vs_90_degree' },
  { level: 9, key: 'vs_120_degree' },
  { level: 10, key: 'vs_manna' },
];

export const DRAGON_FLAG_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'df_lying_leg_raise' },
  { level: 2, key: 'df_candlestick_hold' },
  { level: 3, key: 'df_tuck_negative' },
  { level: 4, key: 'df_tuck_hold' },
  { level: 5, key: 'df_adv_tuck' },
  { level: 6, key: 'df_one_leg' },
  { level: 7, key: 'df_straddle' },
  { level: 8, key: 'df_full_negative' },
  { level: 9, key: 'df_full' },
  { level: 10, key: 'df_ankle_weight' },
  { level: 11, key: 'df_one_arm' },
  { level: 12, key: 'df_dragon_press' },
];

export const BRIDGE_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'br_reverse_plank' },
  { level: 2, key: 'br_shoulder_bridge' },
  { level: 3, key: 'br_table_bridge' },
  { level: 4, key: 'br_angled_bridge' },
  { level: 5, key: 'br_head_bridge' },
  { level: 6, key: 'br_full_bridge' },
  { level: 7, key: 'br_decline_bridge' },
  { level: 8, key: 'br_one_leg_bridge' },
  { level: 9, key: 'br_one_arm_head' },
  { level: 10, key: 'br_one_arm_bridge' },
  { level: 11, key: 'br_stand_to_bridge' },
];

export const ELBOW_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'el_crow_pose' },
  { level: 2, key: 'el_one_arm_crow' },
  { level: 3, key: 'el_sa_frog_stand' },
  { level: 4, key: 'el_tuck_elbow_lever' },
  { level: 5, key: 'el_one_leg' },
  { level: 6, key: 'el_straddle' },
  { level: 7, key: 'el_full' },
  { level: 8, key: 'el_oa_straddle' },
  { level: 9, key: 'el_one_arm' },
  { level: 10, key: 'el_ring' },
];

export const SKILL_LADDERS = {
  handstand: HANDSTAND_LADDER,
  hspu: HSPU_LADDER,
  planche: PLANCHE_LADDER,
  frontLever: FRONT_LEVER_LADDER,
  backLever: BACK_LEVER_LADDER,
  humanFlag: HUMAN_FLAG_LADDER,
  muscleUp: MUSCLE_UP_LADDER,
  ringMuscleUp: RING_MUSCLE_UP_LADDER,
  pistolSquat: PISTOL_SQUAT_LADDER,
  shrimpSquat: SHRIMP_SQUAT_LADDER,
  nordicCurl: NORDIC_CURL_LADDER,
  vSit: VSIT_LADDER,
  dragonFlag: DRAGON_FLAG_LADDER,
  bridge: BRIDGE_LADDER,
  elbowLever: ELBOW_LEVER_LADDER,
} as const;

export type SkillName = keyof typeof SKILL_LADDERS;
