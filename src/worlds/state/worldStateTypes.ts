/**
 * Per-world living state. Reduced from `MutationEvent`s coming through
 * `useGraphMutator`. Persisted in `worldStateStore` so worlds keep
 * evolving across sessions without backend changes.
 */
import type { CognitiveWorldId } from '../types';

export type Climate =
  | 'calm'
  | 'charged'
  | 'heavy'
  | 'open'
  | 'turbulent'
  | 'still';

export interface ActiveNode {
  id: string;
  kind: string;
  label: string;
  /** 0..1 — semantic / momentum weight. Decays over time. */
  weight: number;
  /** ms since epoch — last reinforcement */
  lastTouched: number;
  /** count of reinforcements (for streak gravity / pattern detection) */
  hits: number;
  /** -1..+1 — emotional charge */
  charge: number;
}

export interface UnresolvedTension {
  id: string;
  aId: string;
  bId: string;
  intensity: number; // 0..1
  createdAt: number;
}

export interface RecurringPattern {
  id: string;
  label: string;
  occurrences: number;
  lastSeen: number;
}

export interface WorldState {
  worldId: CognitiveWorldId;
  activeNodes: Record<string, ActiveNode>;
  /** ids that fell below dormant threshold; kept for revival */
  dormantNodeIds: string[];
  recurringPatterns: RecurringPattern[];
  unresolvedTensions: UnresolvedTension[];
  /** 0..1 — overall momentum / coherence of the world */
  momentum: number;
  climate: Climate;
  /** 0..1 — confidence the system has in this world's structure */
  confidence: number;
  /** total interactions this world has accumulated */
  interactionCount: number;
  lastInteractionAt: number | null;
  /** session-spanning cumulative reinforcement weight */
  reinforcement: number;
  /** number of contradiction events recorded */
  contradictions: number;
}

export const emptyWorldState = (worldId: CognitiveWorldId): WorldState => ({
  worldId,
  activeNodes: {},
  dormantNodeIds: [],
  recurringPatterns: [],
  unresolvedTensions: [],
  momentum: 0,
  climate: 'still',
  confidence: 0,
  interactionCount: 0,
  lastInteractionAt: null,
  reinforcement: 0,
  contradictions: 0,
});
