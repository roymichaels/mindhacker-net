/**
 * @module lib/presence/types
 * @purpose All Presence bio-scan types — scan results, findings, fixes, focus items.
 */

export type ConfidenceLevel = 'low' | 'med' | 'high';

// ── Manual Inputs (optional enrichment) ──

export interface ManualInputs {
  has_beard: boolean;
  hair_length: 'buzz' | 'short' | 'medium' | 'long';
  skincare_routine: 'none' | 'basic' | 'full';
}

// ── Sub-Scores ──

export type SubScoreKey =
  | 'facial_definition'
  | 'posture_alignment'
  | 'body_composition'
  | 'grooming_baseline'
  | 'style_signal';

export interface SubScore {
  score: number;
  confidence: ConfidenceLevel;
  label: string;
}

export type PresenceScores = Record<SubScoreKey, SubScore>;

// ── Structural Potential ──

export type StructuralPotential = 'low' | 'med' | 'high';

// ── Findings ──

export interface Finding {
  id: string;
  text: string;
  severity: 'mild' | 'moderate' | 'notable';
}

// ── Fix Items ──

export interface FixItem {
  id: string;
  name: string;
  why: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'med' | 'high';
  category: string;
}

// ── Scan Result ──

export interface PresenceScanResult {
  presence_index: number;
  confidence: ConfidenceLevel;
  scores: PresenceScores;
  structural_potential: StructuralPotential;
  findings: Finding[];
  top_priorities: FixItem[];
  assessed_at: string;
  scan_id?: string;
}

// ── Domain Config Shape (stored in life_domains.domain_config) ──

export interface PresenceDomainConfig {
  latest_scan?: PresenceScanResult;
  scan_history?: PresenceScanResult[];
  manual_inputs?: ManualInputs;
  focus_items_selected?: string[];
  completed?: boolean;
  completed_at?: string | null;
}
