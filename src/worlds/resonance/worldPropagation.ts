/**
 * Cross-world signal emission, propagation, and bleed application.
 * Plus a write-only `useWorldInfluenceStore` published for atmosphere
 * consumers via `useCrossWorldInfluence`.
 */
import { create } from 'zustand';
import type { CognitiveWorldId } from '../types';
import type { WorldClimate } from '@/worlds/runtime/types';
import { RESONANCE_GRAPH } from './resonanceGraph';
import {
  ZERO_BLEED,
  ZERO_ECHO,
  type WorldClimateBleed,
  type WorldEcho,
  type WorldInfluence,
  type WorldResonanceSignal,
} from './types';
import { useWorldHistoryStore } from './worldStateHistory';

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/* ─── store ───────────────────────────────────────────────────────────── */

interface InfluenceState {
  influences: Partial<Record<CognitiveWorldId, WorldInfluence>>;
  setInfluence: (worldId: CognitiveWorldId, inf: WorldInfluence) => void;
}

export const useWorldInfluenceStore = create<InfluenceState>((set) => ({
  influences: {},
  setInfluence: (worldId, inf) =>
    set((s) => ({ influences: { ...s.influences, [worldId]: inf } })),
}));

/* ─── emission ────────────────────────────────────────────────────────── */

export function emitResonanceSignal(
  worldId: CognitiveWorldId,
  climate: WorldClimate,
  t: number,
): WorldResonanceSignal {
  const intensity = clamp(
    climate.motionIntensity * 0.5 + climate.atmosphericDensity * 0.3 + climate.resonance * 0.2,
    0,
    1,
  );
  const stability = clamp(
    climate.harmonicStability * 0.7 + climate.temporalCoherence * 0.3,
    0,
    1,
  );
  const coherence = clamp(climate.temporalCoherence * 0.6 + climate.harmonicStability * 0.4, 0, 1);
  return {
    worldId,
    intensity,
    stability,
    emotionalCharge: climate.emotionalTemperature,
    temporalWeight: clamp(1 - climate.motionIntensity, 0, 1),
    coherence,
    t,
  };
}

/* ─── propagation ─────────────────────────────────────────────────────── */

function delayedSignal(
  from: CognitiveWorldId,
  delayMs: number,
  now: number,
  current: WorldResonanceSignal,
): WorldResonanceSignal {
  const target = now - delayMs;
  const frames = useWorldHistoryStore.getState().frames[from] ?? [];
  let chosen: typeof frames[number] | undefined;
  for (let i = frames.length - 1; i >= 0; i--) {
    if (frames[i].t <= target) {
      chosen = frames[i];
      break;
    }
  }
  if (!chosen) return current;
  return {
    worldId: from,
    intensity: chosen.signal.intensity,
    stability: chosen.signal.stability,
    emotionalCharge: chosen.signal.emotionalCharge,
    coherence: chosen.signal.coherence,
    temporalWeight: 1 - chosen.climate.motionIntensity,
    t: chosen.t,
  };
}

export function propagateInfluence(
  signals: Partial<Record<CognitiveWorldId, WorldResonanceSignal>>,
  now: number,
): Partial<Record<CognitiveWorldId, WorldInfluence>> {
  const out: Partial<Record<CognitiveWorldId, WorldInfluence>> = {};
  const ids = Object.keys(signals) as CognitiveWorldId[];

  for (const to of ids) {
    const bleed: WorldClimateBleed = { ...ZERO_BLEED };
    let dominant: { from: CognitiveWorldId; strength: number; charge: number } | null = null;

    for (const from of ids) {
      if (from === to) continue;
      const edge = RESONANCE_GRAPH[from]?.[to];
      if (!edge) continue;
      const cur = signals[from]!;
      const src = delayedSignal(from, edge.delayMs, now, cur);

      const pressure =
        edge.weight * clamp(src.intensity * 0.7 + (1 - src.stability) * 0.3, 0, 1);

      for (const axis of edge.axes) {
        switch (axis) {
          case 'luminosity':
            bleed.luminosity += pressure * (src.coherence - 0.5) * 0.3;
            break;
          case 'atmosphericDensity':
            bleed.atmosphericDensity += pressure * (1 - src.stability) * 0.35;
            break;
          case 'motionIntensity':
            bleed.motionIntensity += pressure * ((1 - src.stability) - 0.4) * 0.3;
            break;
          case 'harmonicStability':
            bleed.harmonicStability += pressure * (src.stability - 0.5) * 0.4;
            break;
          case 'particleActivity':
            bleed.particleActivity += pressure * (src.intensity - 0.3) * 0.3;
            break;
          case 'resonance':
            bleed.resonance += pressure * (src.coherence * 0.6 + src.intensity * 0.2) * 0.35;
            break;
          case 'emotionalTemperature':
            bleed.emotionalTemperature += pressure * src.emotionalCharge * 0.35;
            break;
          case 'temporalCoherence':
            bleed.temporalCoherence += pressure * (src.coherence - 0.4) * 0.3;
            break;
        }
      }

      if (src.stability < 0.4) {
        bleed.fragmentation += pressure * (0.4 - src.stability) * 0.6;
      }
      bleed.contamination += pressure * 0.15;

      if (!dominant || pressure > dominant.strength) {
        dominant = { from, strength: pressure, charge: src.emotionalCharge };
      }
    }

    const cap = (v: number, m = 0.18) => clamp(v, -m, m);
    bleed.luminosity = cap(bleed.luminosity);
    bleed.atmosphericDensity = cap(bleed.atmosphericDensity);
    bleed.motionIntensity = cap(bleed.motionIntensity);
    bleed.harmonicStability = cap(bleed.harmonicStability);
    bleed.particleActivity = cap(bleed.particleActivity);
    bleed.resonance = cap(bleed.resonance);
    bleed.emotionalTemperature = cap(bleed.emotionalTemperature, 0.3);
    bleed.temporalCoherence = cap(bleed.temporalCoherence);
    bleed.fragmentation = clamp(bleed.fragmentation, 0, 0.6);
    bleed.contamination = clamp(bleed.contamination, 0, 0.7);

    const echo: WorldEcho = dominant
      ? {
          partner: dominant.from,
          strength: clamp(dominant.strength, 0, 1),
          charge: dominant.charge,
        }
      : ZERO_ECHO;

    out[to] = { worldId: to, bleed, echo };
  }

  return out;
}

export function applyBleed(climate: WorldClimate, bleed: WorldClimateBleed): WorldClimate {
  const c01 = (n: number) => clamp(n, 0, 1);
  const cs = (n: number) => clamp(n, -1, 1);
  return {
    luminosity: c01(climate.luminosity + bleed.luminosity),
    atmosphericDensity: c01(climate.atmosphericDensity + bleed.atmosphericDensity),
    motionIntensity: c01(climate.motionIntensity + bleed.motionIntensity),
    harmonicStability: c01(climate.harmonicStability + bleed.harmonicStability),
    particleActivity: c01(climate.particleActivity + bleed.particleActivity),
    resonance: c01(climate.resonance + bleed.resonance),
    emotionalTemperature: cs(climate.emotionalTemperature + bleed.emotionalTemperature),
    temporalCoherence: c01(climate.temporalCoherence + bleed.temporalCoherence),
  };
}