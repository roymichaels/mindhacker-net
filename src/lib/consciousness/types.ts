/**
 * @module lib/consciousness/types
 * Type definitions for the Consciousness (תודעה) Soul Frequency & Identity Unmasking Engine.
 * Diagnostic only — no plans, no routines.
 */

export type ConsciousnessSubsystemId =
  | 'soul_intent_clarity'
  | 'mask_awareness'
  | 'frequency_stability'
  | 'alignment_integrity'
  | 'inner_signal_access'
  | 'field_coherence';

export type Confidence = 'low' | 'med' | 'high';
export type Severity = 'low' | 'med' | 'high';
export type AssessmentDepth = 'quick' | 'full';

export interface ConsciousnessFinding {
  id: string;
  text_key: string;
  severity: Severity;
  subsystem: ConsciousnessSubsystemId;
  evidence_ids?: string[];
}

export interface ConsciousnessSubscores {
  soul_intent_clarity: number;
  mask_awareness: number;
  frequency_stability: number;
  alignment_integrity: number;
  inner_signal_access: number;
  field_coherence: number;
}

export interface ConsciousnessAssessmentResult {
  assessed_at: string;
  consciousness_index: number;
  confidence: Confidence;
  completeness_pct: number;
  subscores: ConsciousnessSubscores;
  findings: ConsciousnessFinding[];
  selected_focus_items: string[];
  depth: AssessmentDepth;
}

export interface ConsciousnessDomainConfig {
  latest_assessment?: ConsciousnessAssessmentResult;
  history?: ConsciousnessAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
  draft_answers?: Record<string, any>;
}

/* ─── Intake answer shapes ─── */

export interface SoulIntentAnswers {
  mission_clarity?: string; // 1-5 band
  ideal_life_image?: string;
  core_values?: string[];
  core_values_freetext?: string;
}

export interface MaskAnswers {
  performs_persona?: string; // 1-5 band
  main_masks?: string[];
  mask_costs?: string[];
}

export interface FrequencyAnswers {
  baseline_state?: string;
  mood_volatility?: string; // 1-5 band
  social_collapse?: string; // 1-5 band
  context_split?: string; // 1-5 band
}

export interface AlignmentAnswers {
  values_alignment?: string; // 1-5 band
  misalignment_area?: string;
  misalignment_response?: string;
}

export interface InnerSignalAnswers {
  body_yes_no?: string; // 1-5 band
  trusts_guidance?: string; // 1-5 band
  silence_capacity?: string; // 1-5 band
  signal_channel?: string;
}

export interface FieldCoherenceAnswers {
  breath_under_stress?: string;
  sleep_stability?: string;
  caffeine_dependence?: string;
  morning_sunlight?: string;
}

export interface ConsciousnessIntakeAnswers {
  depth?: AssessmentDepth;
  soul_intent?: SoulIntentAnswers;
  masks?: MaskAnswers;
  frequency?: FrequencyAnswers;
  alignment?: AlignmentAnswers;
  inner_signal?: InnerSignalAnswers;
  field_coherence?: FieldCoherenceAnswers;
}
