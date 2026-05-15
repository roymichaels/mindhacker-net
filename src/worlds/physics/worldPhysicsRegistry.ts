/**
 * Phase 5C.7 — World-Specific Interaction Physics.
 *
 * Per-world laws of touch. Each function is pure. The runtime calls them;
 * the user only ever feels the result.
 *
 * Conventions:
 *   - all returned numbers are clamped 0..1 (or -1..1 for emotionalTemperature)
 *   - mutateSignals → slow, baked into climate over seconds
 *   - mutateClimate → fast, post-evolveClimate shove (single tick)
 *   - onGesture     → rare symbolic emergence; cap intensity ≤ 0.4
 */
import type { CognitiveWorldId } from '../types';
import type { WorldClimate, WorldSignals } from '@/worlds/runtime/types';
import type { GestureEnergy } from '@/worlds/gesture/types';
import type { WorldPhysics, WorldPhysicsRegistry, GestureEvent } from './types';
import type { DreamEvent, MotifKind } from '@/worlds/dreams/types';

const c01 = (n: number) => Math.max(0, Math.min(1, n));
const cS = (n: number) => Math.max(-1, Math.min(1, n));

/** Decide whether a swipe is sharp (fast/strong) vs slow/soft. */
const isSharp = (e: GestureEnergy) => e.swipe > 0.55;
/** Approximate "horizontal vs vertical" from the last swipe angle. */
const isVertical = (e: GestureEnergy) =>
  e.swipeAngle != null && Math.abs(Math.sin(e.swipeAngle)) > 0.7;
const isCircular = (e: GestureEnergy) =>
  // Treat sustained dwell + light swipe as a "circular" / orbiting motion.
  e.dwell > 0.35 && e.swipe > 0.2 && e.swipe < 0.55;

/** Helper: spawn a low-intensity dream event. */
function dreamEvent(
  worldId: CognitiveWorldId,
  kind: MotifKind,
  weight: number,
  now: number,
): DreamEvent {
  return {
    id: `${worldId}:${kind}:${now}`,
    worldId,
    kind,
    archetype: null,
    intensity: Math.min(0.4, 0.18 + weight * 0.22),
    startedAt: now,
    lifespanMs: 14000 + weight * 26000,
  };
}

/* -------------------------------------------------------------------------- */
/* Per-world physics                                                          */
/* -------------------------------------------------------------------------- */

/** Emotions — weather. Dwell thickens fog; slow swipes calm; sharp swipes
 *  cause turbulence. Pulse spikes lightning-like intensity briefly. */
const emotionsPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    emotionalIntensity: c01(s.emotionalIntensity + e.dwell * 0.22 + (isSharp(e) ? e.swipe * 0.30 : -e.swipe * 0.18) + e.pulse * 0.30),
    unresolvedTension:  c01(s.unresolvedTension + (isSharp(e) ? e.swipe * 0.28 : -e.swipe * 0.22) + e.pulse * 0.16 - e.dwell * 0.10),
    recoveryLevel:      c01(s.recoveryLevel + (isSharp(e) ? -e.swipe * 0.18 : e.swipe * 0.20) + e.dwell * 0.14),
    burnoutPressure:    c01(s.burnoutPressure + (isSharp(e) ? e.swipe * 0.18 : -e.swipe * 0.10)),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    atmosphericDensity: c01(c.atmosphericDensity + e.dwell * 0.22),
    motionIntensity:    c01(c.motionIntensity + (isSharp(e) ? e.swipe * 0.35 : -e.swipe * 0.18) + e.pulse * 0.25),
    harmonicStability:  c01(c.harmonicStability + (isSharp(e) ? -e.swipe * 0.30 : e.swipe * 0.18) + e.dwell * 0.10 - e.pulse * 0.15),
    emotionalTemperature: cS(c.emotionalTemperature + (isSharp(e) ? -e.swipe * 0.18 : e.swipe * 0.12)),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'pulse' && ev.intensity > 0.6) return dreamEvent(ev.worldId, 'symbolic-storm', 0.55, ev.at);
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.7) return dreamEvent(ev.worldId, 'pressure-wave', 0.35, ev.at);
    return null;
  },
};

/** Habits — orbital. Circular gestures stabilise; pulse builds rhythm;
 *  broken rhythm (sharp lateral swipe) drifts the orbits. */
const habitsPhysics: WorldPhysics = {
  mutateSignals: (s, e) => {
    const circular = isCircular(e) ? 1 : 0;
    const broken = isSharp(e) && !isCircular(e) ? 1 : 0;
    return {
      ...s,
      habitsConsistency: c01(s.habitsConsistency + circular * 0.28 + e.pulse * 0.20 - broken * 0.30),
      longTermMomentum: c01(s.longTermMomentum + circular * 0.18 + e.pulse * 0.10 - broken * 0.18),
      unresolvedTension: c01(s.unresolvedTension + broken * 0.20 - circular * 0.12),
      recoveryLevel: c01(s.recoveryLevel + e.dwell * 0.18 - broken * 0.10),
    };
  },
  mutateClimate: (c, e) => {
    const circular = isCircular(e) ? 1 : 0;
    const broken = isSharp(e) && !isCircular(e) ? 1 : 0;
    return {
      ...c,
      harmonicStability: c01(c.harmonicStability + circular * 0.30 + e.pulse * 0.10 - broken * 0.28),
      motionIntensity:   c01(c.motionIntensity + broken * 0.32 + e.pulse * 0.18 - circular * 0.10),
      resonance:         c01(c.resonance + circular * 0.20 + e.pulse * 0.15),
    };
  },
  onGesture: (ev) => {
    if (ev.kind === 'pulse' && ev.intensity > 0.6) return dreamEvent(ev.worldId, 'sacred-orbit', 0.45, ev.at);
    return null;
  },
};

/** Memory — drag creates timeline wakes; dwell summons fragments;
 *  fast movement blurs recall. */
const memoryPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    memoryActivity:    c01(s.memoryActivity + e.swipe * 0.30 + e.dwell * 0.18),
    journalingDensity: c01(s.journalingDensity + e.dwell * 0.22 - (isSharp(e) ? e.swipe * 0.18 : 0)),
    longTermMomentum:  c01(s.longTermMomentum + e.dwell * 0.10),
    emotionalIntensity: c01(s.emotionalIntensity + e.dwell * 0.10),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    particleActivity: c01(c.particleActivity + e.swipe * 0.30 + e.dwell * 0.18),
    temporalCoherence: c01(c.temporalCoherence + e.dwell * 0.22 - (isSharp(e) ? e.swipe * 0.32 : 0)),
    luminosity:       c01(c.luminosity + e.dwell * 0.14 - (isSharp(e) ? e.swipe * 0.18 : 0)),
    atmosphericDensity: c01(c.atmosphericDensity + (isSharp(e) ? e.swipe * 0.22 : 0)),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.65) return dreamEvent(ev.worldId, 'distant-echo', 0.40, ev.at);
    if (ev.kind === 'swipe-h' && ev.intensity > 0.7) return dreamEvent(ev.worldId, 'impossible-timeline', 0.30, ev.at);
    return null;
  },
};

/** Relationships — touch pulls nodes closer; dwell reveals tension fields;
 *  opposing swipes (high swipe + low dwell) create distance. */
const relationshipsPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    relationshipActivity: c01(s.relationshipActivity + e.dwell * 0.25 - (isSharp(e) ? e.swipe * 0.22 : -e.swipe * 0.10)),
    unresolvedTension:    c01(s.unresolvedTension + e.dwell * 0.18 + (isSharp(e) ? e.swipe * 0.18 : 0)),
    emotionalIntensity:   c01(s.emotionalIntensity + e.dwell * 0.16 + e.pulse * 0.20),
    recoveryLevel:        c01(s.recoveryLevel + e.dwell * 0.10 - (isSharp(e) ? e.swipe * 0.10 : 0)),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    resonance:        c01(c.resonance + e.dwell * 0.25 - (isSharp(e) ? e.swipe * 0.25 : -e.swipe * 0.08)),
    atmosphericDensity: c01(c.atmosphericDensity + e.dwell * 0.18),
    luminosity:       c01(c.luminosity - (isSharp(e) ? e.swipe * 0.18 : 0)),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.65) return dreamEvent(ev.worldId, 'harmonic-pairing', 0.35, ev.at);
    if ((ev.kind === 'swipe-h' || ev.kind === 'swipe-up') && ev.intensity > 0.7)
      return dreamEvent(ev.worldId, 'fading-bridge', 0.40, ev.at);
    return null;
  },
};

/** Beliefs — pressure (dwell) reveals roots; swipes expose fractures;
 *  holding stabilises structures. */
const beliefsPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    longTermMomentum: c01(s.longTermMomentum + e.dwell * 0.20 - (isSharp(e) ? e.swipe * 0.20 : 0)),
    unresolvedTension: c01(s.unresolvedTension + (isSharp(e) ? e.swipe * 0.30 : 0) - e.dwell * 0.18),
    emotionalIntensity: c01(s.emotionalIntensity + e.pulse * 0.18),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    harmonicStability: c01(c.harmonicStability + e.dwell * 0.28 - (isSharp(e) ? e.swipe * 0.32 : 0)),
    atmosphericDensity: c01(c.atmosphericDensity + e.dwell * 0.20 + (isSharp(e) ? e.swipe * 0.18 : 0)),
    motionIntensity:   c01(c.motionIntensity + (isSharp(e) ? e.swipe * 0.25 : 0) - e.dwell * 0.15),
    luminosity:        c01(c.luminosity + e.dwell * 0.12),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.7) return dreamEvent(ev.worldId, 'impossible-depth', 0.35, ev.at);
    if (isSharp(ev.energy) && ev.intensity > 0.7) return dreamEvent(ev.worldId, 'collapsing-structure', 0.45, ev.at);
    return null;
  },
};

/** Creativity — gestures birth shards; pulse-collisions combine ideas;
 *  stillness lets forms emerge. */
const creativePhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    creativeActivity:  c01(s.creativeActivity + e.swipe * 0.28 + e.pulse * 0.30 + e.dwell * 0.10),
    longTermMomentum:  c01(s.longTermMomentum + e.dwell * 0.18),
    emotionalIntensity: c01(s.emotionalIntensity + e.pulse * 0.22),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    particleActivity: c01(c.particleActivity + e.swipe * 0.30 + e.pulse * 0.32),
    motionIntensity:  c01(c.motionIntensity + e.swipe * 0.22 + e.pulse * 0.25),
    resonance:        c01(c.resonance + e.dwell * 0.22 + e.pulse * 0.18),
    emotionalTemperature: cS(c.emotionalTemperature + e.pulse * 0.18 + e.swipe * 0.10),
    harmonicStability: c01(c.harmonicStability + e.dwell * 0.20 - e.pulse * 0.12),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'pulse' && ev.intensity > 0.6) return dreamEvent(ev.worldId, 'spontaneous-geometry', 0.50, ev.at);
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.7) return dreamEvent(ev.worldId, 'unfinished-structure', 0.30, ev.at);
    return null;
  },
};

/** Higher Self — stillness increases coherence; fast movement fades the
 *  field; long dwell expands depth. */
const higherPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    recoveryLevel:    c01(s.recoveryLevel + e.dwell * 0.30 - e.swipe * 0.20 - e.pulse * 0.18),
    longTermMomentum: c01(s.longTermMomentum + e.dwell * 0.18 - e.swipe * 0.10),
    emotionalIntensity: c01(s.emotionalIntensity + e.swipe * 0.10 + e.pulse * 0.10),
    unresolvedTension: c01(s.unresolvedTension + e.swipe * 0.12 + e.pulse * 0.10 - e.dwell * 0.18),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    harmonicStability:  c01(c.harmonicStability + e.dwell * 0.32 - e.swipe * 0.28 - e.pulse * 0.20),
    luminosity:         c01(c.luminosity + e.dwell * 0.22 - e.swipe * 0.18),
    temporalCoherence:  c01(c.temporalCoherence + e.dwell * 0.30 - e.swipe * 0.22),
    motionIntensity:    c01(c.motionIntensity + e.swipe * 0.25 + e.pulse * 0.20 - e.dwell * 0.15),
    atmosphericDensity: c01(c.atmosphericDensity - e.dwell * 0.10 + e.swipe * 0.10),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.7) return dreamEvent(ev.worldId, 'sacred-stillness', 0.40, ev.at);
    return null;
  },
};

/** Archetypes — dwell reveals silhouettes; movement shifts masks;
 *  repeated gestures (pulse) awaken entities. */
const archetypesPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    creativeActivity:  c01(s.creativeActivity + e.dwell * 0.18 + e.pulse * 0.22),
    emotionalIntensity: c01(s.emotionalIntensity + e.pulse * 0.25 + e.swipe * 0.12),
    longTermMomentum:  c01(s.longTermMomentum + e.dwell * 0.16),
    unresolvedTension: c01(s.unresolvedTension + e.swipe * 0.15),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    luminosity:        c01(c.luminosity + e.dwell * 0.22 - e.swipe * 0.10),
    atmosphericDensity: c01(c.atmosphericDensity + e.dwell * 0.20),
    resonance:         c01(c.resonance + e.pulse * 0.30 + e.dwell * 0.10),
    motionIntensity:   c01(c.motionIntensity + e.swipe * 0.25 + e.pulse * 0.18),
    harmonicStability: c01(c.harmonicStability - e.swipe * 0.15 + e.dwell * 0.12),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'pulse' && ev.intensity > 0.6) return dreamEvent(ev.worldId, 'glitch-silhouette', 0.45, ev.at);
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.7) return dreamEvent(ev.worldId, 'dream-corridor', 0.30, ev.at);
    return null;
  },
};

/** Self — calm container. Dwell deepens; movement softly stirs.
 *  Self should never feel chaotic — it is the floor of presence. */
const selfPhysics: WorldPhysics = {
  mutateSignals: (s, e) => ({
    ...s,
    recoveryLevel:    c01(s.recoveryLevel + e.dwell * 0.22 - e.swipe * 0.10),
    longTermMomentum: c01(s.longTermMomentum + e.dwell * 0.14 + e.pulse * 0.10),
    emotionalIntensity: c01(s.emotionalIntensity + e.swipe * 0.10 + e.pulse * 0.12),
    unresolvedTension: c01(s.unresolvedTension - e.dwell * 0.10),
  }),
  mutateClimate: (c, e) => ({
    ...c,
    luminosity:        c01(c.luminosity + e.dwell * 0.18),
    harmonicStability: c01(c.harmonicStability + e.dwell * 0.18 - e.swipe * 0.10),
    temporalCoherence: c01(c.temporalCoherence + e.dwell * 0.16),
    motionIntensity:   c01(c.motionIntensity + e.swipe * 0.18 + e.pulse * 0.12 - e.dwell * 0.10),
  }),
  onGesture: (ev) => {
    if (ev.kind === 'dwell' && ev.energy.dwell > 0.75) return dreamEvent(ev.worldId, 'luminous-alignment', 0.30, ev.at);
    return null;
  },
};

export const WORLD_PHYSICS: WorldPhysicsRegistry = {
  emotions:      emotionsPhysics,
  habits:        habitsPhysics,
  memory:        memoryPhysics,
  relationships: relationshipsPhysics,
  beliefs:       beliefsPhysics,
  creative:      creativePhysics,
  higher:        higherPhysics,
  archetypes:    archetypesPhysics,
  self:          selfPhysics,
};

export function getWorldPhysics(worldId: CognitiveWorldId): WorldPhysics | undefined {
  return WORLD_PHYSICS[worldId];
}

/** Re-export for callers. */
export type { GestureEvent, WorldPhysics } from './types';