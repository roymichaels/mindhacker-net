/**
 * @module lib/power/ladders
 * Skill progression ladders for calisthenics skills.
 * Each step has a level (1-based) and i18n key suffix.
 */
import type { SkillLadderStep } from './types';

export const HANDSTAND_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'wall_hold_60s' },
  { level: 2, key: 'wall_shoulder_taps' },
  { level: 3, key: 'freestanding_5s' },
  { level: 4, key: 'freestanding_15s' },
  { level: 5, key: 'freestanding_30s' },
  { level: 6, key: 'freestanding_60s' },
  { level: 7, key: 'walking' },
  { level: 8, key: 'press_to_hs' },
];

export const PLANCHE_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'frog_stand' },
  { level: 2, key: 'tuck_planche' },
  { level: 3, key: 'adv_tuck' },
  { level: 4, key: 'one_leg' },
  { level: 5, key: 'straddle' },
  { level: 6, key: 'half_lay' },
  { level: 7, key: 'full_planche' },
];

export const FRONT_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'tuck_fl' },
  { level: 2, key: 'adv_tuck_fl' },
  { level: 3, key: 'one_leg_fl' },
  { level: 4, key: 'straddle_fl' },
  { level: 5, key: 'half_lay_fl' },
  { level: 6, key: 'full_fl' },
];

export const BACK_LEVER_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'tuck_bl' },
  { level: 2, key: 'adv_tuck_bl' },
  { level: 3, key: 'one_leg_bl' },
  { level: 4, key: 'straddle_bl' },
  { level: 5, key: 'full_bl' },
];

export const HUMAN_FLAG_LADDER: SkillLadderStep[] = [
  { level: 1, key: 'tuck_flag' },
  { level: 2, key: 'one_leg_flag' },
  { level: 3, key: 'straddle_flag' },
  { level: 4, key: 'full_flag' },
];

export const SKILL_LADDERS = {
  handstand: HANDSTAND_LADDER,
  planche: PLANCHE_LADDER,
  frontLever: FRONT_LEVER_LADDER,
  backLever: BACK_LEVER_LADDER,
  humanFlag: HUMAN_FLAG_LADDER,
} as const;

export type SkillName = keyof typeof SKILL_LADDERS;
