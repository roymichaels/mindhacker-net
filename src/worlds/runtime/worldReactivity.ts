/**
 * Pure mapping `WorldSignals → WorldClimate`, world-aware.
 * Each world weights climate axes differently so the same signal moves
 * different felt qualities depending on which world the user is in.
 *
 * `evolveClimate(prev, signals, dtMs, worldId)` smooths each axis toward
 * its target with a per-axis time-constant so the environment never jumps.
 */
import type { CognitiveWorldId } from '../types';
import { DEFAULT_CLIMATE, type WorldClimate, type WorldSignals } from './types';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const clampS = (n: number) => Math.max(-1, Math.min(1, n));

/** Resolve target climate for a world from raw signals. */
function targetClimate(worldId: CognitiveWorldId, s: WorldSignals): WorldClimate {
  // Shared base derivations
  const arousal = (s.emotionalIntensity + s.unresolvedTension) * 0.5;
  const calm = clamp01(s.recoveryLevel - s.burnoutPressure * 0.5);

  let c: WorldClimate = {
    luminosity: clamp01(0.4 + s.longTermMomentum * 0.4 + calm * 0.2),
    atmosphericDensity: clamp01(0.3 + s.emotionalIntensity * 0.4 + s.burnoutPressure * 0.3),
    motionIntensity: clamp01(0.25 + arousal * 0.6),
    harmonicStability: clamp01(0.4 + (1 - s.unresolvedTension) * 0.5 + s.recoveryLevel * 0.1),
    particleActivity: clamp01(0.35 + s.memoryActivity * 0.3 + s.journalingDensity * 0.2),
    resonance: clamp01(0.2 + s.relationshipActivity * 0.3 + s.creativeActivity * 0.2 + s.longTermMomentum * 0.2),
    emotionalTemperature: clampS((s.creativeActivity - s.burnoutPressure) * 0.6 + (calm - 0.5) * 0.4),
    temporalCoherence: clamp01(0.4 + s.longTermMomentum * 0.4 + (1 - s.emotionalIntensity) * 0.2),
  };

  switch (worldId) {
    case 'habits':
      c.harmonicStability = clamp01(0.5 + s.habitsConsistency * 0.45);
      c.luminosity = clamp01(c.luminosity + s.longTermMomentum * 0.15);
      c.motionIntensity = clamp01(0.2 + (1 - s.habitsConsistency) * 0.55);
      c.resonance = clamp01(c.resonance + s.habitsConsistency * 0.15);
      break;
    case 'emotions':
      c.atmosphericDensity = clamp01(0.35 + s.emotionalIntensity * 0.55);
      c.motionIntensity = clamp01(0.3 + arousal * 0.65);
      c.harmonicStability = clamp01(0.55 - s.unresolvedTension * 0.55);
      c.emotionalTemperature = clampS((calm - s.unresolvedTension) * 0.8);
      break;
    case 'memory':
      c.particleActivity = clamp01(0.45 + s.journalingDensity * 0.45 + s.memoryActivity * 0.2);
      c.temporalCoherence = clamp01(0.45 + s.longTermMomentum * 0.5);
      c.atmosphericDensity = clamp01(0.3 + (1 - s.memoryActivity) * 0.3);
      c.luminosity = clamp01(0.35 + s.memoryActivity * 0.4);
      break;
    case 'relationships':
      c.resonance = clamp01(0.3 + s.relationshipActivity * 0.6);
      c.luminosity = clamp01(0.4 + s.relationshipActivity * 0.4);
      c.atmosphericDensity = clamp01(0.25 + (1 - s.relationshipActivity) * 0.35);
      c.particleActivity = clamp01(0.3 + s.relationshipActivity * 0.4);
      break;
    case 'creative':
      c.motionIntensity = clamp01(0.3 + s.creativeActivity * 0.55);
      c.resonance = clamp01(0.25 + s.creativeActivity * 0.55);
      c.particleActivity = clamp01(0.3 + s.creativeActivity * 0.5);
      c.emotionalTemperature = clampS(0.2 + s.creativeActivity * 0.6);
      break;
    case 'higher':
      c.motionIntensity = clamp01(0.1 + (1 - s.recoveryLevel) * 0.25);
      c.atmosphericDensity = clamp01(0.2 + (1 - s.recoveryLevel) * 0.2);
      c.temporalCoherence = clamp01(0.55 + s.recoveryLevel * 0.4);
      c.harmonicStability = clamp01(0.65 + s.recoveryLevel * 0.3);
      c.luminosity = clamp01(0.5 + s.longTermMomentum * 0.4);
      break;
    case 'beliefs':
      c.motionIntensity = clamp01(0.15 + s.unresolvedTension * 0.35);
      c.atmosphericDensity = clamp01(0.4 + s.unresolvedTension * 0.4);
      c.harmonicStability = clamp01(0.5 + (1 - s.unresolvedTension) * 0.4);
      break;
    case 'archetypes':
      c.harmonicStability = clamp01(0.55 + (1 - s.emotionalIntensity) * 0.3);
      c.resonance = clamp01(0.35 + s.creativeActivity * 0.3);
      break;
    case 'self':
      c.luminosity = clamp01(0.5 + s.longTermMomentum * 0.4);
      c.harmonicStability = clamp01(0.55 + s.recoveryLevel * 0.35);
      c.temporalCoherence = clamp01(0.5 + s.longTermMomentum * 0.4);
      break;
  }

  return c;
}

/** Per-axis time constants (seconds). Larger = slower to react. */
const TAU: Record<keyof WorldClimate, number> = {
  luminosity: 4,
  atmosphericDensity: 5,
  motionIntensity: 3,
  harmonicStability: 6,
  particleActivity: 4,
  resonance: 5,
  emotionalTemperature: 7,
  temporalCoherence: 8,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Smoothly evolve climate toward target derived from signals.
 * `dtMs` is the delta since the last tick.
 */
export function evolveClimate(
  prev: WorldClimate | undefined,
  signals: WorldSignals,
  dtMs: number,
  worldId: CognitiveWorldId,
): WorldClimate {
  const base = prev ?? DEFAULT_CLIMATE;
  const target = targetClimate(worldId, signals);
  const dt = Math.max(0.016, dtMs / 1000);
  const out = { ...base } as WorldClimate;
  (Object.keys(TAU) as (keyof WorldClimate)[]).forEach((key) => {
    const tau = TAU[key];
    const k = 1 - Math.exp(-dt / tau);
    out[key] = lerp(base[key], target[key], k);
  });
  return out;
}