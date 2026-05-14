/**
 * Phase 5C.6 — Gesture as Atmosphere.
 *
 * Per-world transient input energy. Decays exponentially (~3s tau) and
 * bleeds into `WorldSignals`, which the climate runtime then folds into
 * the visible atmosphere. The user never sees these numbers — they feel
 * them.
 */
import type { CognitiveWorldId } from '../types';

export interface GestureEnergy {
  /** Sustained pressure / dwell on the world. 0..1 */
  dwell: number;
  /** Recent swipe / drag intensity. 0..1 */
  swipe: number;
  /** Recent tap-cluster pulse. 0..1 */
  pulse: number;
  /** Direction of last swipe in radians (0 = +x), or null. */
  swipeAngle: number | null;
  /** Last focal point in viewport coords [0..1, 0..1] for ripple anchoring. */
  focal: { x: number; y: number } | null;
  /** ms timestamp of last meaningful event. */
  lastAt: number;
}

export const ZERO_ENERGY: GestureEnergy = {
  dwell: 0,
  swipe: 0,
  pulse: 0,
  swipeAngle: null,
  focal: null,
  lastAt: 0,
};

export type GestureKind = 'dwell' | 'swipe-up' | 'swipe-down' | 'swipe-h' | 'pulse' | 'tap';

export interface VerbDescriptor { id: string; label: string }

/** Resolves a gesture → verb id for a world. Returns null to skip. */
export type GestureVerbResolver = (
  kind: GestureKind,
  verbs: VerbDescriptor[],
) => string | null;

export type WorldGestureBindings = Partial<Record<CognitiveWorldId, GestureVerbResolver>>;
