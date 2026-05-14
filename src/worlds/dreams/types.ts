/**
 * Phase 5C.4 — Dream Layer + Symbolic Emergence.
 *
 * The subconscious field is a slow, persistent layer that sits one
 * level beneath the reactive ecosystem. It does NOT drive moment-to-
 * moment climate; instead it accumulates over weeks, recognises
 * recurring patterns, and occasionally surfaces symbolic
 * environmental events.
 *
 * Nothing here is shown as text, numbers, or labels. Effects must
 * read as poetic, ambiguous, atmospheric.
 */
import type { CognitiveWorldId } from '../types';

export type ArchetypeId =
  | 'protector'
  | 'explorer'
  | 'creator'
  | 'shadow'
  | 'sage'
  | 'rebel';

/** A symbolic motif accumulated by long-term presence in a world. */
export type MotifKind =
  // Memory-flavoured
  | 'distant-echo'
  | 'recursive-constellation'
  | 'impossible-timeline'
  // Emotion-flavoured
  | 'symbolic-storm'
  | 'pressure-wave'
  | 'atmospheric-mirror'
  // Relationships-flavoured
  | 'fading-bridge'
  | 'resonance-shadow'
  | 'harmonic-pairing'
  // Creative-flavoured
  | 'spontaneous-geometry'
  | 'unfinished-structure'
  // Higher-flavoured
  | 'sacred-stillness'
  | 'impossible-depth'
  | 'luminous-alignment'
  // Habits-flavoured
  | 'sacred-orbit'
  // Cross-cutting / shadow
  | 'collapsing-structure'
  | 'glitch-silhouette'
  | 'dream-corridor';

export interface SymbolicMotif {
  id: string;
  worldId: CognitiveWorldId;
  kind: MotifKind;
  /** 0..1 — accumulated weight; decays slowly without reinforcement. */
  weight: number;
  /** count of distinct emergences over the lifetime of the universe. */
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  /** Dominant archetype the motif resonates with, if any. */
  archetype: ArchetypeId | null;
}

export interface ArchetypeAffinity {
  id: ArchetypeId;
  /** 0..1 — slow EMA of long-term behaviour alignment. */
  affinity: number;
  lastUpdated: number;
}

/**
 * A transient dream-layer phenomenon scheduled into a world.
 * Lifespan is in ms; the atmosphere fades it in/out.
 */
export interface DreamEvent {
  id: string;
  worldId: CognitiveWorldId;
  kind: MotifKind;
  archetype: ArchetypeId | null;
  /** 0..1 — visual presence; always capped low to stay subtle. */
  intensity: number;
  /** ms timestamp when scheduled. */
  startedAt: number;
  /** total lifespan in ms. */
  lifespanMs: number;
}

/** Aggregated subconscious state for a world (read-only consumers). */
export interface SubconsciousFieldSnapshot {
  motifs: SymbolicMotif[];
  archetypes: ArchetypeAffinity[];
  events: DreamEvent[];
  /** 0..1 — cumulative emotional residue (dark / heavy). */
  residue: number;
  /** 0..1 — cumulative luminous reinforcement. */
  reinforcement: number;
}

export const ARCHETYPE_IDS: ArchetypeId[] = [
  'protector',
  'explorer',
  'creator',
  'shadow',
  'sage',
  'rebel',
];