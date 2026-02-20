/**
 * @module lib/expansion/types
 * Type definitions for the Expansion (התרחבות) Cognitive Expansion Engine.
 * Diagnostic only — no plans, no routines.
 */

export type SubsystemId =
  | 'learning_depth'
  | 'creative_output'
  | 'language_complexity'
  | 'philosophical_depth';

export type Confidence = 'low' | 'med' | 'high';
export type Severity = 'low' | 'med' | 'high';

export interface ExpansionFinding {
  id: string;
  text_key: string;
  severity: Severity;
  subsystem: SubsystemId;
}

export interface ExpansionSubscores {
  learning_depth: number;
  creative_output: number;
  language_complexity: number;
  philosophical_depth: number;
}

export interface ExpansionAssessmentResult {
  assessed_at: string;
  expansion_index: number;
  confidence: Confidence;
  completeness_pct: number;
  subscores: ExpansionSubscores;
  findings: ExpansionFinding[];
  selected_focus_items: string[];
}

export interface ExpansionDomainConfig {
  latest_assessment?: ExpansionAssessmentResult;
  history?: ExpansionAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
  draft_answers?: Record<string, any>;
}

/* ─── Intake answer shapes ─── */

export interface LearningAnswers {
  hours_per_week?: number;
  learning_types: string[];
  retention: string;
  implementation: string;
  synthesis: string;
}

export interface CreativeAnswers {
  output_types: string[];
  pieces_per_week?: number;
  public_exposure: string;
  iteration_cycle: string;
  idea_generation: string;
}

export interface LanguageAnswers {
  active_languages: string[];
  non_native_fluency: string;
  complex_content_non_native: string;
  think_in_second_language: string;
  switch_languages: string;
}

export interface PhilosophicalAnswers {
  question_beliefs: string;
  read_philosophy: string;
  hold_opposing_views: string;
  journaling_frequency: string;
  systems_thinking: string;
}

export interface ExpansionIntakeAnswers {
  learning?: LearningAnswers;
  creative?: CreativeAnswers;
  language?: LanguageAnswers;
  philosophical?: PhilosophicalAnswers;
}
