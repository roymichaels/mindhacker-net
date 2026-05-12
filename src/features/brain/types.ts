export type BrainLayer = "surface" | "pattern" | "deep";

export interface BrainNode {
  id: string;
  type: string;
  layer: BrainLayer;
  pillar: string | null;
  content: string;
  confidence: number;
  strength: number;
  emotional_charge: number;
  user_confirmed: boolean;
  last_evidence_at: string | null;
  evidence_count: number;
  score: number;
}

export interface BrainEdge {
  from: string;
  to: string;
  relation: string;
  weight: number;
}

export interface BrainOverview {
  nodes: BrainNode[];
  edges: BrainEdge[];
  pillars: Record<string, { confidence: number; signal_count: number }>;
  contradictions: Array<{ id: string; pillar: string | null; a: string; b: string; status: string }>;
  recent: Array<{ id: string; type: string; content: string; confidence: number; last_evidence_at: string }>;
  unknown_areas: string[];
  generated_at: string;
}

export interface BrainEvidenceRow {
  id: string;
  source_kind: string;
  source_ref: Record<string, unknown>;
  delta_confidence: number;
  delta_strength: number;
  summary: string | null;
  created_at: string;
}