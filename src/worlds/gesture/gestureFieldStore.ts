/**
 * Internal store for live `GestureEnergy` per world.
 *
 * Writers: `<WorldGestureField/>` (push) and `useWorldReactivity` (decay).
 * Readers: `worldSignals.ts`, atmosphere ripple layer.
 */
import { create } from 'zustand';
import type { CognitiveWorldId } from '../types';
import { ZERO_ENERGY, type GestureEnergy } from './types';

interface State {
  energy: Partial<Record<CognitiveWorldId, GestureEnergy>>;
  pushDwell: (worldId: CognitiveWorldId, intensity: number, focal?: { x: number; y: number }) => void;
  pushSwipe: (worldId: CognitiveWorldId, intensity: number, angle: number, focal?: { x: number; y: number }) => void;
  pushPulse: (worldId: CognitiveWorldId, intensity: number, focal?: { x: number; y: number }) => void;
  decayAll: (dtMs: number) => void;
  get: (worldId: CognitiveWorldId) => GestureEnergy;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const TAU_MS = { dwell: 1800, swipe: 2200, pulse: 1400 } as const;

export const useGestureFieldStore = create<State>((set, get) => ({
  energy: {},
  pushDwell: (worldId, intensity, focal) =>
    set((s) => {
      const prev = s.energy[worldId] ?? { ...ZERO_ENERGY };
      return {
        energy: {
          ...s.energy,
          [worldId]: {
            ...prev,
            dwell: clamp01(prev.dwell + intensity),
            focal: focal ?? prev.focal,
            lastAt: Date.now(),
          },
        },
      };
    }),
  pushSwipe: (worldId, intensity, angle, focal) =>
    set((s) => {
      const prev = s.energy[worldId] ?? { ...ZERO_ENERGY };
      return {
        energy: {
          ...s.energy,
          [worldId]: {
            ...prev,
            swipe: clamp01(prev.swipe + intensity),
            swipeAngle: angle,
            focal: focal ?? prev.focal,
            lastAt: Date.now(),
          },
        },
      };
    }),
  pushPulse: (worldId, intensity, focal) =>
    set((s) => {
      const prev = s.energy[worldId] ?? { ...ZERO_ENERGY };
      return {
        energy: {
          ...s.energy,
          [worldId]: {
            ...prev,
            pulse: clamp01(prev.pulse + intensity),
            focal: focal ?? prev.focal,
            lastAt: Date.now(),
          },
        },
      };
    }),
  decayAll: (dtMs) =>
    set((s) => {
      const dt = Math.max(1, dtMs);
      const out: Partial<Record<CognitiveWorldId, GestureEnergy>> = {};
      const kDwell = Math.exp(-dt / TAU_MS.dwell);
      const kSwipe = Math.exp(-dt / TAU_MS.swipe);
      const kPulse = Math.exp(-dt / TAU_MS.pulse);
      for (const [id, e] of Object.entries(s.energy)) {
        if (!e) continue;
        const next: GestureEnergy = {
          ...e,
          dwell: e.dwell * kDwell,
          swipe: e.swipe * kSwipe,
          pulse: e.pulse * kPulse,
        };
        // Forget focal when energy is essentially gone.
        if (next.dwell + next.swipe + next.pulse < 0.005) {
          next.focal = null;
          next.swipeAngle = null;
        }
        out[id as CognitiveWorldId] = next;
      }
      return { energy: out };
    }),
  get: (worldId) => get().energy[worldId] ?? ZERO_ENERGY,
}));

/** Plain selector hook for atmosphere/scene reads. */
export function useGestureEnergy(worldId: CognitiveWorldId): GestureEnergy {
  return useGestureFieldStore((s) => s.energy[worldId] ?? ZERO_ENERGY);
}
