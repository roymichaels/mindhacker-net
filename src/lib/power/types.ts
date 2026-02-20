/**
 * @module lib/power/types
 * Power Pillar assessment types.
 */

export type PowerModuleId =
  | 'max_strength'
  | 'relative_bodyweight'
  | 'static_skill_strength'
  | 'explosive_power'
  | 'structural_strength';

export interface MaxStrengthInput {
  bench1rm?: number;
  squat1rm?: number;
  deadlift1rm?: number;
  bodyweight: number;
}

export interface RelativeBodyweightInput {
  maxPushups?: number;
  maxPullups?: number;
  maxDips?: number;
  lSitHoldSeconds?: number;
}

export type PlancheTier = 'none' | 'tuck' | 'adv_tuck' | 'straddle' | 'half_lay' | 'full';
export type FrontLeverTier = 'none' | 'tuck' | 'adv_tuck' | 'straddle' | 'half_lay' | 'full';

export interface StaticSkillInput {
  plancheProgression: PlancheTier;
  frontLeverProgression: FrontLeverTier;
  handstandHoldSeconds?: number;
}

export interface ExplosivePowerInput {
  sprint30mSeconds?: number;
  verticalJumpCm?: number;
  broadJumpCm?: number;
  clapPushups?: number;
}

export interface StructuralStrengthInput {
  deadHangSeconds?: number;
  sidePlankSeconds?: number;
  singleLegBalanceSeconds?: number;
  deepSquatHoldSeconds?: number;
}

export type ModuleInputMap = {
  max_strength: MaxStrengthInput;
  relative_bodyweight: RelativeBodyweightInput;
  static_skill_strength: StaticSkillInput;
  explosive_power: ExplosivePowerInput;
  structural_strength: StructuralStrengthInput;
};

export interface ModuleScore {
  moduleId: PowerModuleId;
  score: number; // 0–100
  subScores: Record<string, number>;
  label: string;
}

export interface PowerFinding {
  id: string;
  severity: 'notable' | 'moderate' | 'minor';
  text: string;
  textHe: string;
}

export interface PowerLever {
  id: string;
  name: string;
  nameHe: string;
  why: string;
  whyHe: string;
  moduleId: PowerModuleId;
}

export interface PowerAssessment {
  selectedModules: PowerModuleId[];
  moduleScores: Record<string, ModuleScore>;
  powerIndex: number;
  findings: PowerFinding[];
  levers: PowerLever[];
  assessedAt: string;
}

export interface PowerDomainConfig {
  selected_modules: PowerModuleId[];
  latest_assessment: PowerAssessment | null;
  history: PowerAssessment[];
  completed: boolean;
}
