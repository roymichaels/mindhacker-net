/**
 * @module lib/combat/types
 * Type definitions for the Combat (לחימה) Warrior Capability Assessment Engine.
 * Diagnostic only — no plans, no routines.
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
}

export interface CombatDomainConfig {
  latest_assessment?: CombatAssessmentResult;
  history?: CombatAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
  draft_answers?: Record<string, any>;
}

/* ─── Intake answer shapes ─── */

export interface BackgroundAnswers {
  disciplines: string[];
  years_training: string;
  training_mode: string;
}

export interface StrikingAnswers {
  combo_fluency: string;
  training_tools: string;
  defensive_awareness: string;
  technique_under_fatigue: string;
}

export interface GrapplingAnswers {
  live_sparring: string;
  ground_comfort: string;
  mount_escape: string;
  takedown_exp: string;
}

export interface ReactionAnswers {
  reaction_drills: string;
  reflex_catch: string;
  surprise_response: string;
}

export interface ConditioningAnswers {
  max_pushups?: number;
  max_pullups?: number;
  sprint_ability: string;
  shadowbox_rounds: string;
}

export interface DurabilityAnswers {
  conditioning_body: string;
  pain_tolerance: string;
  injury_history?: string;
}

export interface TacticalAnswers {
  situational_awareness: string;
  scenario_drills: string;
  confrontation_response: string;
}

export interface CombatIntakeAnswers {
  background?: BackgroundAnswers;
  striking?: StrikingAnswers;
  grappling?: GrapplingAnswers;
  reaction?: ReactionAnswers;
  conditioning?: ConditioningAnswers;
  durability?: DurabilityAnswers;
  tactical?: TacticalAnswers;
  skipped_subsystems?: CombatSubsystemId[];
}
