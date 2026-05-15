/**
 * orbBehavior — Phase 5L.1.
 *
 * Canonical behavioural physics table for AION's orb. Maps each
 * `OrbBehaviorState` to numeric drives that surfaces, atmosphere and
 * shader uniforms can consume without coupling to the orb's render
 * path. The bridge (`useOrbPresenceBehaviour`) publishes these as CSS
 * vars on `<html>` so any layer can read without re-rendering.
 *
 * Not moods. Not animations. Behavioural states.
 */
import type { AionPresenceState } from '@/aion/presenceState';

/** Behavioural physics states the orb can inhabit. */
export type OrbBehaviorState =
  | 'resting'
  | 'listening'
  | 'thinking'
  | 'noticing'
  | 'guiding'
  | 'resonating'
  | 'hesitating'
  | 'dreaming'
  | 'evolving';

export interface OrbBehaviorProfile {
  /** Lateral wandering amplitude, 0..1. Multiplied into orb tug vectors. */
  drift: number;
  /** Inner pulse rate, 0..1 (slow → fast). */
  pulseRate: number;
  /** Outer glow amplitude, 0..1. */
  glow: number;
  /** How strongly this state radiates into the surrounding atmosphere, 0..1. */
  influence: number;
  /** Reaction lag in ms. Larger = the orb takes longer to respond to input. */
  responseDelayMs: number;
}

export const BEHAVIOR_PROFILE: Record<OrbBehaviorState, OrbBehaviorProfile> = {
  resting:    { drift: 0.10, pulseRate: 0.20, glow: 0.45, influence: 0.20, responseDelayMs: 320 },
  listening:  { drift: 0.18, pulseRate: 0.45, glow: 0.55, influence: 0.30, responseDelayMs: 140 },
  thinking:   { drift: 0.55, pulseRate: 0.35, glow: 0.50, influence: 0.40, responseDelayMs: 420 },
  noticing:   { drift: 0.30, pulseRate: 0.75, glow: 0.65, influence: 0.55, responseDelayMs:  90 },
  guiding:    { drift: 0.40, pulseRate: 0.50, glow: 0.60, influence: 0.60, responseDelayMs: 160 },
  resonating: { drift: 0.25, pulseRate: 0.60, glow: 0.80, influence: 0.85, responseDelayMs: 200 },
  hesitating: { drift: 0.45, pulseRate: 0.30, glow: 0.40, influence: 0.20, responseDelayMs: 520 },
  dreaming:   { drift: 0.60, pulseRate: 0.18, glow: 0.50, influence: 0.45, responseDelayMs: 600 },
  evolving:   { drift: 0.50, pulseRate: 0.55, glow: 0.90, influence: 1.00, responseDelayMs: 280 },
};

/**
 * Map the legacy `AionPresenceState` (6 states) to the broader
 * `OrbBehaviorState` (9 states). Existing call sites keep using
 * presenceState; this mapping lets behavioural runtime read the richer
 * table without breaking anything.
 */
const PRESENCE_TO_BEHAVIOR: Record<AionPresenceState, OrbBehaviorState> = {
  resting:     'resting',
  listening:   'listening',
  noticing:    'noticing',
  forming:     'thinking',
  manifesting: 'guiding',
  evolving:    'evolving',
};

export function behaviorFromPresence(p: AionPresenceState): OrbBehaviorState {
  return PRESENCE_TO_BEHAVIOR[p] ?? 'resting';
}