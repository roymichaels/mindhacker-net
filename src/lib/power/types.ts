/**
 * @module lib/power/types
 * Power Pillar – Elite Strength & Skill Assessment Engine types.
 */

/* ─── Track IDs (goal-based, not abstract) ─── */
export type PowerTrackId =
  | 'gym_strength'
  | 'calisthenics_conditioning'
  | 'calisthenics_skills'
  | 'explosive_power'
  | 'general_athleticism';

/* ─── Rep estimation method for gym lifts ─── */
export type RepScheme = '1rm' | '5rm' | '8_12rm';

/* ─── Gym Strength ─── */
export interface GymStrengthInput {
  repScheme: RepScheme;
  bodyweight?: number;
  squat?: { weight: number; reps: number };
  deadlift?: { weight: number; reps: number };
  bench?: { weight: number; reps: number };
  ohp?: { weight: number; reps: number };
}

/* ─── Calisthenics Conditioning ─── */
export interface CalConditioningInput {
  maxPushups?: number;
  maxPullups?: number;
  maxDips?: number;
  maxBwSquats?: number;
  weightedCalisthenics: boolean;
  weightedDipWeight?: number;
  weightedDipReps?: number;
  weightedPullupWeight?: number;
  weightedPullupReps?: number;
}

/* ─── Calisthenics Skills (progression ladders) ─── */
export type SkillLevel = number; // 0 = not training, 1–N = ladder position

export interface CalSkillsInput {
  handstand: SkillLevel;
  planche: SkillLevel;
  frontLever: SkillLevel;
  backLever: SkillLevel;
  humanFlag: SkillLevel;
}

export interface SkillLadderStep {
  level: number;
  key: string; // i18n key suffix
}

/* ─── Explosive Power ─── */
export interface ExplosivePowerInput {
  verticalJumpCm?: number;
  broadJumpCm?: number;
  sprint20mSeconds?: number;
  sprint40mSeconds?: number;
}

/* ─── Module Score ─── */
export interface ModuleScore {
  trackId: PowerTrackId;
  score: number; // 0–100, -1 = unassessed
  subScores: Record<string, number>;
  label: string;
  confidence: 'low' | 'med' | 'high';
}

/* ─── Finding ─── */
export interface PowerFinding {
  id: string;
  severity: 'notable' | 'moderate' | 'minor';
  text: string;
  textHe: string;
}

/* ─── Fix Library Item ─── */
export interface FixItem {
  id: string;
  title: string;
  titleHe: string;
  why: string;
  whyHe: string;
  tier: 1 | 2 | 3;
  impact: 'low' | 'med' | 'high';
  difficulty: 'easy' | 'med' | 'hard';
  tags: PowerTrackId[];
}

/* ─── Assessment ─── */
export interface PowerAssessment {
  selectedTracks: PowerTrackId[];
  moduleScores: Record<string, ModuleScore>;
  powerIndex: number;
  confidence: 'low' | 'med' | 'high';
  findings: PowerFinding[];
  focusItems: FixItem[];
  assessedAt: string;
}

/* ─── Domain Config stored in life_domains ─── */
export interface PowerDomainConfig {
  latest: PowerAssessment | null;
  history: PowerAssessment[];
  completed: boolean;
  completed_at: string | null;
}
