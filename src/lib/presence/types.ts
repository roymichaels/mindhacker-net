/**
 * @module lib/presence/types
 * @purpose All Presence bio-scan types — scan results, findings, fixes, focus items.
 */

export type ConfidenceLevel = 'low' | 'med' | 'high';

// ── Sub-Scores ──

export type SubScoreKey =
  | 'facial_structure'
  | 'posture_alignment'
  | 'body_composition'
  | 'frame_development'
  | 'inflammation_puffiness';

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
  tier: 1 | 2 | 3;
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
  focus_items_selected?: string[];
  completed?: boolean;
  completed_at?: string | null;
}
