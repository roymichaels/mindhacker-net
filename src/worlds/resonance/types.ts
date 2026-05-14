/**
 * Phase 5C.3 — Cross-World Resonance + Subconscious Continuity.
 *
 * The runtime now treats the 9 cognitive worlds as ONE shared
 * subconscious field. Each world emits a `WorldResonanceSignal`
 * every tick; signals propagate through a directed `resonanceGraph`
 * with delays + decay, producing per-world `WorldInfluence` (a
 * subtle bleed adjustment to the world's climate plus a dominant
 * foreign-world `echo`).
 *
 * Effects must remain subtle, atmospheric, cumulative — never
 * exposed as numbers, arrows, or causal explanations.
 */
import type { CognitiveWorldId } from '../types';
import type { WorldClimate } from '@/worlds/runtime/types';

export interface WorldResonanceSignal {
  worldId: CognitiveWorldId;
  /** 0..1 — overall energy this world is broadcasting. */
  intensity: number;
  /** 0..1 — how stable / synchronised the world feels. */
  stability: number;
  /** -1..+1 — emotional charge sign + magnitude. */
  emotionalCharge: number;
  /** 0..1 — how heavily this world is leaning on its history right now. */
  temporalWeight: number;
  /** 0..1 — internal coherence (low entropy). */
  coherence: number;
  /** ms timestamp of emission. */
  t: number;
}

/**
 * A subtle climate delta to apply additively after the world's own
 * `evolveClimate` step. Each axis is a small signed adjustment.
 */
export interface WorldClimateBleed {
  luminosity: number;
  atmosphericDensity: number;
  motionIntensity: number;
  harmonicStability: number;
  particleActivity: number;
  resonance: number;
  emotionalTemperature: number;
  temporalCoherence: number;
  /** 0..1 — flicker / fragmentation pressure from unresolved cross-world tension. */
  fragmentation: number;
  /** 0..1 — how strongly the world has been "contaminated" by foreign signals. */
  contamination: number;
}

export interface WorldEcho {
  /** Foreign world whose signal is currently bleeding most into this one. */
  partner: CognitiveWorldId | null;
  /** 0..1 — strength of the echo. */
  strength: number;
  /** -1..+1 — sign of the foreign emotional charge. */
  charge: number;
}

export interface WorldInfluence {
  worldId: CognitiveWorldId;
  bleed: WorldClimateBleed;
  echo: WorldEcho;
}

/**
 * Lightweight temporal memory frame — kept per world in history.
 * Bounded ring buffer; cheap to persist.
 */
export interface WorldHistoryFrame {
  t: number;
  climate: Pick<
    WorldClimate,
    | 'luminosity'
    | 'motionIntensity'
    | 'harmonicStability'
    | 'emotionalTemperature'
    | 'temporalCoherence'
    | 'resonance'
  >;
  signal: Pick<WorldResonanceSignal, 'intensity' | 'stability' | 'emotionalCharge' | 'coherence'>;
}

export interface WorldHistorySummary {
  worldId: CognitiveWorldId;
  /** EMA of recent emotional charge. -1..+1 */
  emotionalDrift: number;
  /** EMA of recent intensity. 0..1 */
  momentumTrend: number;
  /** EMA of recent stability. 0..1 */
  stabilityTrend: number;
  /** how many resonance spikes (intensity > 0.7) in window */
  recentSpikes: number;
  /** -1..+1 long-term directional drift (positive = warming/opening) */
  longTermDrift: number;
}

export const ZERO_BLEED: WorldClimateBleed = {
  luminosity: 0,
  atmosphericDensity: 0,
  motionIntensity: 0,
  harmonicStability: 0,
  particleActivity: 0,
  resonance: 0,
  emotionalTemperature: 0,
  temporalCoherence: 0,
  fragmentation: 0,
  contamination: 0,
};

export const ZERO_ECHO: WorldEcho = {
  partner: null,
  strength: 0,
  charge: 0,
};