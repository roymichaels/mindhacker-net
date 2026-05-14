/**
 * Phase 5C.2 — Living Worlds Reactivity Layer.
 *
 * `WorldSignals` are the raw psychological/behavioural axes flowing into a
 * world. They are derived (currently simulated) per world by `worldSignals.ts`.
 *
 * `WorldClimate` is the resolved environmental state the atmosphere reads.
 * Every axis is normalised 0..1 unless noted.
 */
import type { CognitiveWorldId } from '../types';

export interface WorldSignals {
  habitsConsistency: number;
  emotionalIntensity: number;
  journalingDensity: number;
  memoryActivity: number;
  relationshipActivity: number;
  creativeActivity: number;
  burnoutPressure: number;
  recoveryLevel: number;
  longTermMomentum: number;
  unresolvedTension: number;
}

export interface WorldClimate {
  /** brightness of ambient/glow layers */
  luminosity: number;
  /** fog / haze / volumetric thickness */
  atmosphericDensity: number;
  /** speed multiplier for drift/parallax animations */
  motionIntensity: number;
  /** 0 = chaotic, 1 = perfectly stable; controls pulse amplitude inversely */
  harmonicStability: number;
  /** density + twinkle of particulate field */
  particleActivity: number;
  /** cross-world coupling strength; subtle shimmer when high */
  resonance: number;
  /** -1 cool .. +1 warm — biases hue of the climate veil */
  emotionalTemperature: number;
  /** 0 short draw distance .. 1 deep cosmic distance */
  temporalCoherence: number;
}

export interface WorldMomentumSnapshot {
  worldId: CognitiveWorldId;
  short: number;  // immediate momentum (0..1)
  long: number;   // long-window EMA (0..1)
}

export interface CrossWorldResonance {
  worldId: CognitiveWorldId;
  resonance: number;
  partner: CognitiveWorldId | null;
}

export const DEFAULT_SIGNALS: WorldSignals = {
  habitsConsistency: 0.4,
  emotionalIntensity: 0.3,
  journalingDensity: 0.3,
  memoryActivity: 0.3,
  relationshipActivity: 0.3,
  creativeActivity: 0.3,
  burnoutPressure: 0.2,
  recoveryLevel: 0.5,
  longTermMomentum: 0.4,
  unresolvedTension: 0.2,
};

export const DEFAULT_CLIMATE: WorldClimate = {
  luminosity: 0.55,
  atmosphericDensity: 0.4,
  motionIntensity: 0.4,
  harmonicStability: 0.6,
  particleActivity: 0.5,
  resonance: 0.3,
  emotionalTemperature: 0,
  temporalCoherence: 0.5,
};