/**
 * @module lib/focus/types
 * Type definitions for the Focus (מיקוד) Conscious Regulation Engine.
 * Diagnostic only — no plans, no routines.
 */

export type SubsystemId =
  | 'breath_control'
  | 'attention_stability'
  | 'guided_suggestibility'
  | 'trance_depth'
  | 'somatic_awareness'
  | 'structural_calm';

export type Confidence = 'low' | 'med' | 'high';
export type Severity = 'low' | 'med' | 'high';

export interface FocusFinding {
  id: string;
  text_key: string;
  severity: Severity;
  subsystem: SubsystemId;
}

export interface FocusSubscores {
  breath_control: number;
  attention_stability: number;
  guided_suggestibility: number;
  trance_depth: number;
  somatic_awareness: number;
  structural_calm: number;
}

export interface FocusAssessmentResult {
  assessed_at: string;
  overall_index: number;
  confidence: Confidence;
  completeness_pct: number;
  subscores: FocusSubscores;
  findings: FocusFinding[];
  selected_focus_items: string[];
}

export interface FocusDomainConfig {
  latest_assessment?: FocusAssessmentResult;
  history?: FocusAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
  draft_answers?: Record<string, any>;
}

/* ─── Intake answer shapes ─── */

export interface BreathAnswers {
  practice_types: string[];
  frequency: string;
  duration: string;
  control_claim: string;
  breath_hold_seconds?: number;
}

export interface MeditationAnswers {
  frequency: string;
  session_length: string;
  stillness_capacity: string;
  mind_wandering: string;
  after_effect: string;
}

export interface GuidedMeditationAnswers {
  frequency: string;
  falls_asleep: string;
  follow_guidance: string;
  post_shift: string;
  preferred_voice: string;
}

export interface HypnosisAnswers {
  experience: string;
  frequency: string;
  depth_markers: string[];
  suggestion_effectiveness: string;
  preferred_length?: number;
}

export interface SomaticAnswers {
  practice_types: string[];
  frequency: string;
  session_length: string;
  breath_motion_integration: string;
  sensation_markers: string[];
}

export interface YogaAnswers {
  styles: string[];
  frequency: string;
  breath_under_strain: string;
  balance_control: string;
  injury_constraints?: string;
}

export interface FocusIntakeAnswers {
  breath?: BreathAnswers;
  meditation?: MeditationAnswers;
  guided?: GuidedMeditationAnswers;
  hypnosis?: HypnosisAnswers;
  somatic?: SomaticAnswers;
  yoga?: YogaAnswers;
  skipped_subsystems?: SubsystemId[];
}
