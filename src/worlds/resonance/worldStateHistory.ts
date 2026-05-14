/**
 * Per-world ring buffer of recent climate + signal frames, plus an
 * EMA summary. Used by `worldPropagation` to look up delayed source
 * signals (echoes from minutes ago can still tint today).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CognitiveWorldId } from '../types';
import type {
  WorldHistoryFrame,
  WorldHistorySummary,
  WorldResonanceSignal,
} from './types';
import type { WorldClimate } from '@/worlds/runtime/types';

const MAX_FRAMES = 48;
const MIN_INTERVAL_MS = 1000;

interface HistoryState {
  frames: Partial<Record<CognitiveWorldId, WorldHistoryFrame[]>>;
  summaries: Partial<Record<CognitiveWorldId, WorldHistorySummary>>;
  pushFrame: (
    worldId: CognitiveWorldId,
    climate: WorldClimate,
    signal: WorldResonanceSignal,
  ) => void;
  reset: () => void;
}

const emptySummary = (worldId: CognitiveWorldId): WorldHistorySummary => ({
  worldId,
  emotionalDrift: 0,
  momentumTrend: 0,
  stabilityTrend: 0.5,
  recentSpikes: 0,
  longTermDrift: 0,
});

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const useWorldHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      frames: {},
      summaries: {},
      pushFrame: (worldId, climate, signal) =>
        set((s) => {
          const list = s.frames[worldId] ?? [];
          const last = list[list.length - 1];
          if (last && signal.t - last.t < MIN_INTERVAL_MS) return s;
          const frame: WorldHistoryFrame = {
            t: signal.t,
            climate: {
              luminosity: climate.luminosity,
              motionIntensity: climate.motionIntensity,
              harmonicStability: climate.harmonicStability,
              emotionalTemperature: climate.emotionalTemperature,
              temporalCoherence: climate.temporalCoherence,
              resonance: climate.resonance,
            },
            signal: {
              intensity: signal.intensity,
              stability: signal.stability,
              emotionalCharge: signal.emotionalCharge,
              coherence: signal.coherence,
            },
          };
          const next = [...list, frame].slice(-MAX_FRAMES);
          const prev = s.summaries[worldId] ?? emptySummary(worldId);
          const summary: WorldHistorySummary = {
            worldId,
            emotionalDrift: lerp(prev.emotionalDrift, signal.emotionalCharge, 0.08),
            momentumTrend: lerp(prev.momentumTrend, signal.intensity, 0.08),
            stabilityTrend: lerp(prev.stabilityTrend, signal.stability, 0.06),
            recentSpikes: next.filter((f) => f.signal.intensity > 0.7).length,
            longTermDrift: lerp(
              prev.longTermDrift,
              (signal.emotionalCharge + (signal.coherence - 0.5)) * 0.5,
              0.02,
            ),
          };
          return {
            frames: { ...s.frames, [worldId]: next },
            summaries: { ...s.summaries, [worldId]: summary },
          };
        }),
      reset: () => set({ frames: {}, summaries: {} }),
    }),
    {
      name: 'mindos.worldHistory.v1',
      version: 1,
      partialize: (s) => ({
        summaries: s.summaries,
        frames: Object.fromEntries(
          Object.entries(s.frames).map(([k, v]) => [k, (v ?? []).slice(-12)]),
        ),
      }) as any,
    },
  ),
);

export function useWorldHistorySummary(worldId: CognitiveWorldId): WorldHistorySummary {
  return useWorldHistoryStore(
    (s) => s.summaries[worldId] ?? emptySummary(worldId),
  );
}