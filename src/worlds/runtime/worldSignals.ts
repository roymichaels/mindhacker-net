/**
 * Derive simulated `WorldSignals` per world.
 *
 * Inputs: real `worldStateStore` slice (when present) + time-based oscillators
 * so worlds always feel alive even when the user does nothing. Each world
 * weights its axes differently — this is what makes Habits feel orbital and
 * Emotions feel like weather without any visible labels.
 *
 * Pure functions; no React, no side-effects.
 */
import type { CognitiveWorldId } from '../types';
import type { WorldState } from '@/worlds/state/worldStateTypes';
import { DEFAULT_SIGNALS, type WorldSignals } from './types';
import { useGestureFieldStore } from '@/worlds/gesture/gestureFieldStore';
import type { GestureEnergy } from '@/worlds/gesture/types';
import { getWorldPhysics } from '@/worlds/physics/worldPhysicsRegistry';

/** Periodic oscillator in [0,1]. period in seconds. */
const osc = (tMs: number, periodSec: number, phase = 0): number =>
  0.5 + 0.5 * Math.sin((tMs / 1000) * (Math.PI * 2 / periodSec) + phase);

/** Slow drift in [0,1] from two coprime sines so it never feels mechanical. */
const drift = (tMs: number, a: number, b: number, phase = 0): number => {
  const x = osc(tMs, a, phase) * 0.6 + osc(tMs, b, phase * 1.7) * 0.4;
  return Math.max(0, Math.min(1, x));
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const baseFromState = (state: WorldState | undefined) => {
  if (!state) return { momentum: 0, tension: 0, charge: 0, density: 0 };
  const tension = Math.min(1, state.unresolvedTensions.length / 6);
  const nodes = Object.values(state.activeNodes);
  const meanCharge = nodes.length
    ? nodes.reduce((s, n) => s + n.charge, 0) / nodes.length
    : 0;
  const density = Math.min(1, nodes.length / 14);
  return { momentum: state.momentum, tension, charge: meanCharge, density };
};

/**
 * Generic fallback gesture → signal bias for worlds that have no physics
 * law registered. Per-world physics (Phase 5C.7) override this.
 */
function applyGenericGestureBias(s: WorldSignals, g: GestureEnergy): WorldSignals {
  if (!g || (g.dwell + g.swipe + g.pulse) < 0.01) return s;
  return {
    ...s,
    emotionalIntensity: clamp01(s.emotionalIntensity + g.dwell * 0.18 + g.pulse * 0.22),
    recoveryLevel:      clamp01(s.recoveryLevel + g.dwell * 0.22 - g.pulse * 0.08),
    longTermMomentum:   clamp01(s.longTermMomentum + g.dwell * 0.10 + g.swipe * 0.06),
    memoryActivity:     clamp01(s.memoryActivity + g.swipe * 0.20),
    journalingDensity:  clamp01(s.journalingDensity + g.dwell * 0.10),
    creativeActivity:   clamp01(s.creativeActivity + g.pulse * 0.28 + g.swipe * 0.10),
    relationshipActivity: clamp01(s.relationshipActivity + g.swipe * 0.08),
    unresolvedTension:  clamp01(s.unresolvedTension + g.pulse * 0.10 - g.dwell * 0.06),
    burnoutPressure:    clamp01(s.burnoutPressure - g.dwell * 0.12 + g.pulse * 0.04),
  };
}

/**
 * Per-world recipe. Each world emphasises a different subset of axes.
 */
export function deriveWorldSignals(
  worldId: CognitiveWorldId,
  state: WorldState | undefined,
  tMs: number,
): WorldSignals {
  const { momentum, tension, charge, density } = baseFromState(state);

  // Slow ambient oscillators give every world its own breathing rhythm.
  const slow = drift(tMs, 47, 73, worldId.length * 0.7);
  const med = drift(tMs, 19, 31, worldId.length * 1.3);
  const fast = drift(tMs, 7, 11, worldId.length * 2.1);

  const s: WorldSignals = { ...DEFAULT_SIGNALS };

  switch (worldId) {
    case 'habits':
      s.habitsConsistency = clamp01(0.45 + momentum * 0.4 + (slow - 0.5) * 0.1);
      s.longTermMomentum = clamp01(0.35 + momentum * 0.5 + (slow - 0.5) * 0.1);
      s.recoveryLevel = clamp01(0.4 + (slow - 0.5) * 0.2);
      s.emotionalIntensity = clamp01(0.15 + tension * 0.4);
      s.unresolvedTension = clamp01(tension * 0.6);
      break;
    case 'emotions':
      s.emotionalIntensity = clamp01(0.35 + Math.abs(charge) * 0.5 + fast * 0.15);
      s.unresolvedTension = clamp01(0.2 + tension * 0.7 + (fast - 0.5) * 0.1);
      s.recoveryLevel = clamp01(0.45 + (slow - 0.5) * 0.3 - tension * 0.3);
      s.burnoutPressure = clamp01(0.15 + tension * 0.4);
      break;
    case 'memory':
      s.journalingDensity = clamp01(0.3 + density * 0.5 + (slow - 0.5) * 0.1);
      s.memoryActivity = clamp01(0.3 + momentum * 0.4 + med * 0.15);
      s.longTermMomentum = clamp01(0.4 + momentum * 0.4);
      s.emotionalIntensity = clamp01(0.2 + Math.abs(charge) * 0.3);
      break;
    case 'relationships':
      s.relationshipActivity = clamp01(0.3 + momentum * 0.5 + med * 0.15);
      s.emotionalIntensity = clamp01(0.25 + Math.abs(charge) * 0.4);
      s.unresolvedTension = clamp01(tension * 0.5);
      s.recoveryLevel = clamp01(0.45 + (slow - 0.5) * 0.2);
      break;
    case 'creative':
      s.creativeActivity = clamp01(0.3 + momentum * 0.5 + fast * 0.2);
      s.emotionalIntensity = clamp01(0.25 + (med - 0.5) * 0.3);
      s.longTermMomentum = clamp01(0.35 + momentum * 0.4);
      break;
    case 'higher':
      s.recoveryLevel = clamp01(0.55 + (slow - 0.5) * 0.3);
      s.longTermMomentum = clamp01(0.5 + momentum * 0.4 + (slow - 0.5) * 0.1);
      s.emotionalIntensity = clamp01(0.1 + tension * 0.2);
      s.burnoutPressure = clamp01(0.1 + tension * 0.2);
      s.unresolvedTension = clamp01(tension * 0.3);
      break;
    case 'beliefs':
      s.longTermMomentum = clamp01(0.35 + momentum * 0.4 + (slow - 0.5) * 0.1);
      s.unresolvedTension = clamp01(tension * 0.6);
      s.emotionalIntensity = clamp01(0.2 + Math.abs(charge) * 0.3);
      break;
    case 'archetypes':
      s.creativeActivity = clamp01(0.25 + momentum * 0.3 + (med - 0.5) * 0.2);
      s.emotionalIntensity = clamp01(0.25 + Math.abs(charge) * 0.4);
      s.longTermMomentum = clamp01(0.35 + momentum * 0.4);
      break;
    case 'self':
    default:
      s.recoveryLevel = clamp01(0.5 + (slow - 0.5) * 0.2);
      s.longTermMomentum = clamp01(0.4 + momentum * 0.4);
      s.emotionalIntensity = clamp01(0.2 + Math.abs(charge) * 0.3);
      s.unresolvedTension = clamp01(tension * 0.4);
      break;
  }

  // Phase 5C.6 — fold live gesture energy into the signal vector so the
  // climate runtime sees the user's touch as just another psychological
  // input. Phase 5C.7 — delegate to per-world physics when available so
  // identical gestures shape each world differently.
  const energy = useGestureFieldStore.getState().energy[worldId];
  if (!energy) return s;
  const physics = getWorldPhysics(worldId);
  if (physics?.mutateSignals) return physics.mutateSignals(s, energy);
  return applyGenericGestureBias(s, energy);
}