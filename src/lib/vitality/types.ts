/**
 * Precision Vitality Intelligence Engine — Types
 * Diagnostic-only. No plans, no routines.
 */

export type Confidence = 'low' | 'med' | 'high';

export interface SubsystemScore {
  id: string;
  score: number;           // 0–100, -1 if insufficient data
  dataCompleteness: number; // 0–1
  confidence: Confidence;
  inputsUsed: string[];
  inputsMissing: string[];
}

export interface VitalityFinding {
  id: string;
  textKey: string;         // translation key
  severity: 'positive' | 'neutral' | 'concern';
  subsystem: string;
  triggerInputs: string[];
}

export interface VitalityAssessment {
  assessedAt: string;
  vitalityIndex: number;   // 0–100
  confidence: Confidence;
  completeness: number;    // 0–1 overall
  subsystemScores: Record<string, SubsystemScore>;
  findings: VitalityFinding[];
  rawInputsUsed: Record<string, any>;
}

export interface VitalityDomainConfig {
  latest_assessment?: VitalityAssessment;
  history: VitalityAssessment[];
  completed: boolean;
  completed_at: string | null;
}
