/**
 * Sacred easings — Phase 5D.1.
 *
 * Slow, cinematic motion vocabulary. Every duration is >= 800ms and every
 * curve is gentle on entry. Use these for ALL universe transitions; do
 * not import raw easing strings inside scenes/primitives.
 */

export const SACRED_EASE = {
  /** Default — emerges, never snaps. */
  breath: [0.22, 0.61, 0.36, 1] as const,
  /** Drifts in/out as if displaced by current. */
  drift: [0.4, 0.0, 0.2, 1] as const,
  /** Dissolves — fades primarily on opacity, gentle scale. */
  dissolve: [0.32, 0, 0.32, 1] as const,
  /** Orbital — slight overshoot, returns to rest. */
  orbit: [0.33, 0.05, 0.16, 1.05] as const,
};

export const SACRED_DURATION = {
  breath: 1.4,
  drift: 1.8,
  dissolve: 1.2,
  orbit: 1.6,
};