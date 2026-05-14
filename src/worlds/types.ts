/**
 * Cognitive Worlds — type contract.
 *
 * A "world" is NOT a route. A world is a typed slice of the user's
 * semantic graph rendered with its own spatial scene, ontology, and
 * interaction grammar. AION threads through every world as the same
 * canonical presence; only its framing role changes.
 *
 * See mem://architecture/cognitive-worlds-system.
 */
import type { LucideIcon } from 'lucide-react';

export type CognitiveWorldId =
  | 'self'
  | 'habits'
  | 'emotions'
  | 'beliefs'
  | 'memory'
  | 'relationships'
  | 'archetypes'
  | 'creative'
  | 'higher';

export type WorldStatus = 'live' | 'scaffold' | 'coming';

export type SceneKind =
  | 'band-stack'
  | 'ritual-orbits'
  | 'weather'
  | 'root-system'
  | 'timeline'
  | 'galaxy'
  | 'entity-circle'
  | 'ecosystem'
  | 'dreamspace';

export type AionRole = 'guide' | 'interpreter' | 'orchestrator' | 'observer';

/** Verbs available inside a world. Drive the WorldComposer quick prompts. */
export interface WorldVerb {
  id: string;
  labelHe: string;
  labelEn: string;
}

export interface WorldNodeKind {
  id: string;
  labelHe: string;
  labelEn: string;
}

export interface WorldEdgeKind {
  id: string;
  labelHe: string;
  labelEn: string;
}

export interface WorldSceneSpec {
  kind: SceneKind;
  /** Short metaphor sentence rendered above the stage. */
  metaphorHe: string;
  metaphorEn: string;
  /** Tailwind-friendly accent (HSL triplet, no `hsl()` wrapper). */
  accentHsl: string;
}

export interface WorldInteractionSpec {
  verbs: WorldVerb[];
}

export interface CognitiveWorld {
  id: CognitiveWorldId;
  labelHe: string;
  labelEn: string;
  hintHe: string;
  hintEn: string;
  icon: LucideIcon;
  nodeKinds: WorldNodeKind[];
  edgeKinds: WorldEdgeKind[];
  scene: WorldSceneSpec;
  interaction: WorldInteractionSpec;
  aionRole: AionRole;
  /** Presence-aware tagline AION speaks when the user enters the world. */
  aionLineHe: string;
  aionLineEn: string;
  status: WorldStatus;
}
