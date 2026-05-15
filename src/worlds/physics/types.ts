/**
 * Phase 5C.7 — World-Specific Interaction Physics.
 *
 * Each Cognitive World now owns a `WorldPhysics` law that interprets the
 * same generic `GestureEnergy` differently. Identical fingers, different
 * universes — Emotions thickens into fog, Habits stabilises into orbits,
 * Memory blurs, Beliefs cracks. Nothing here is visible. The laws merely
 * shape how signals, climate and the dream layer respond.
 *
 * Three surfaces a physics law may implement:
 *   - mutateSignals : long-term psychological bias (per-world recipe).
 *   - mutateClimate : fast / immediate atmospheric shove (faster than
 *                      climate's own time-constants — used for turbulence,
 *                      drift, fog thickening, etc).
 *   - onGesture     : symbolic event hook. May return a DreamEvent
 *                      (rare, low-intensity, short-lived) that is pushed
 *                      into the subconscious field.
 */
import type { CognitiveWorldId } from '../types';
import type { WorldClimate, WorldSignals } from '@/worlds/runtime/types';
import type { GestureEnergy, GestureKind } from '@/worlds/gesture/types';
import type { DreamEvent } from '@/worlds/dreams/types';

export interface GestureEvent {
  worldId: CognitiveWorldId;
  kind: GestureKind;
  /** 0..1 — strength of the originating push. */
  intensity: number;
  /** swipe angle in radians or null. */
  angle: number | null;
  /** focal point in viewport coords [0..1]. */
  focal: { x: number; y: number } | null;
  /** ms timestamp of the event. */
  at: number;
  /** snapshot of the world's energy AFTER the push. */
  energy: GestureEnergy;
}

export interface WorldPhysics {
  /** Slow signal-level bias (read by `worldSignals.deriveWorldSignals`). */
  mutateSignals?: (s: WorldSignals, e: GestureEnergy) => WorldSignals;
  /** Fast climate-level shove applied AFTER `evolveClimate` each tick. */
  mutateClimate?: (c: WorldClimate, e: GestureEnergy) => WorldClimate;
  /** Symbolic emergence hook. Return a DreamEvent to schedule, or null. */
  onGesture?: (ev: GestureEvent) => DreamEvent | null;
}

export type WorldPhysicsRegistry = Partial<Record<CognitiveWorldId, WorldPhysics>>;