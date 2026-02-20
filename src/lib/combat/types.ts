/**
 * @module lib/combat/types
 * Type definitions for the Combat (לחימה) Warrior Capability Assessment Engine.
 * Hybrid warrior model — supports solo, live, and mixed training profiles.
 */

export type CombatSubsystemId =
  | 'striking_skill'
  | 'grappling_skill'
  | 'reaction_speed'
  | 'conditioning'
  | 'durability'
  | 'tactical_awareness';

export type Confidence = 'low' | 'med' | 'high';
export type Severity = 'low' | 'med' | 'high';

export type WarriorMode = 'solo' | 'gym' | 'hybrid' | 'tactical';

export interface CombatFinding {
  id: string;
  text_key: string;
  severity: Severity;
  subsystem: CombatSubsystemId;
}

export interface CombatSubscores {
  striking_skill: number;
  grappling_skill: number;
  reaction_speed: number;
  conditioning: number;
  durability: number;
  tactical_awareness: number;
}

export interface CombatAssessmentResult {
  assessed_at: string;
  warrior_index: number;
  confidence: Confidence;
  completeness_pct: number;
  subscores: CombatSubscores;
  findings: CombatFinding[];
  selected_focus_items: string[];
  warrior_mode: WarriorMode;
}

export interface CombatDomainConfig {
  latest_assessment?: CombatAssessmentResult;
  history?: CombatAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
  draft_answers?: Record<string, any>;
}

/* ─── Intake answer shapes ─── */

export type CombatDiscipline =
  | 'boxing' | 'muay_thai' | 'kickboxing'
  | 'bjj' | 'wrestling' | 'judo'
  | 'krav_maga' | 'kung_fu' | 'military_training'
  | 'mma' | 'none';

export const GRAPPLING_DISCIPLINES: CombatDiscipline[] = ['bjj', 'wrestling', 'judo', 'mma'];

export interface ProfileAnswers {
  warrior_mode: WarriorMode;
  disciplines?: CombatDiscipline[];
  years_training?: string; // 'none' | '<1' | '1_3' | '3_5' | '5_plus'
}

export interface RealityAnswers {
  sessions_per_week?: number;
  sessions_last_30?: number;
  solo_vs_live_pct?: number; // 0 = all live, 100 = all solo
  sparring_depth_freq?: string; // only if live > 0
}

export interface ShadowAnswers {
  shadow_format?: string; // structured | continuous | mixed
  // structured
  round_length?: string;
  rest_length?: string;
  rounds_per_session?: number;
  rpe_last_2?: number;
  tech_complexity_fatigue?: string;
  // continuous
  minutes_before_degrade?: number;
  continuous_rpe?: number;
  continuous_complexity?: string;
  // common
  uses_bands?: boolean;
  films_self?: boolean;
  trains_defense_shadow?: boolean;
}

export interface LiveAnswers {
  sparring_sessions_30d?: number;
  intensity_level?: string;
  panic_under_pressure?: string;
  breath_through_rounds?: string;
}

export interface GrapplingAnswers {
  lifetime_rolling_hours?: string;
  rolling_freq_12mo?: string;
  escape_mount?: string;
  sprawl_instinct?: string;
}

export interface ReactionAnswers {
  surprise_response?: string;
  reaction_drill_freq?: string;
  scans_environment?: string;
}

export interface ConditioningAnswers {
  max_pushups?: number;
  max_pullups?: number;
  max_air_squats?: number;
  six_rounds_shadow?: string;
  sprint_capacity?: string;
}

export interface DurabilityAnswers {
  impact_conditioning?: string; // shin | knuckle | none
  injury_flags?: string[];
}

export interface CombatIntakeAnswers {
  profile?: ProfileAnswers;
  reality?: RealityAnswers;
  shadow?: ShadowAnswers;
  live?: LiveAnswers;
  grappling?: GrapplingAnswers;
  reaction?: ReactionAnswers;
  conditioning?: ConditioningAnswers;
  durability?: DurabilityAnswers;
  skipped_subsystems?: CombatSubsystemId[];
}
