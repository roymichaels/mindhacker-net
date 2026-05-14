/**
 * Shared semantic graph primitives. Worlds project from ONE underlying
 * graph; each world's projection is just a typed slice of nodes/edges.
 */
import type { CognitiveWorldId } from '../types';

export interface WorldNode {
  id: string;
  kind: string;          // ontology kind owned by the world
  label: string;
  weight?: number;       // 0..1 — optional importance / momentum
  worldId: CognitiveWorldId;
  meta?: Record<string, unknown>;
}

export interface WorldEdge {
  id: string;
  kind: string;
  fromId: string;
  toId: string;
  worldId: CognitiveWorldId;
}

export interface WorldProjection {
  worldId: CognitiveWorldId;
  nodes: WorldNode[];
  edges: WorldEdge[];
  /** True when the projection is empty / pre-data — scenes should fall back to demo. */
  isEmpty: boolean;
  loading?: boolean;
}

export const emptyProjection = (worldId: CognitiveWorldId): WorldProjection => ({
  worldId,
  nodes: [],
  edges: [],
  isEmpty: true,
});
