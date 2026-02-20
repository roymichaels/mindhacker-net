/**
 * @module lib/consciousness/types
 * Type definitions for the Consciousness (תודעה) Soul Frequency & Identity Unmasking Engine.
 * AI-conversational assessment — no surveys.
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

export interface ConsciousnessFinding {
  id: string;
  text_he: string;
  text_en: string;
  severity: Severity;
  subsystem: ConsciousnessSubsystemId;
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
  subscores: ConsciousnessSubscores;
  findings: ConsciousnessFinding[];
  mirror_statement: { he: string; en: string };
  one_next_step: { he: string; en: string };
  selected_focus_items: string[];
}

export interface ConsciousnessDomainConfig {
  latest_assessment?: ConsciousnessAssessmentResult;
  history?: ConsciousnessAssessmentResult[];
  completed?: boolean;
  completed_at?: string | null;
}
