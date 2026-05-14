/**
 * Internal store for live `WorldClimate` per world. The ONLY writer is
 * `useWorldReactivity()`. Consumers read via `useWorldClimate(worldId)`.
 */
import { create } from 'zustand';
import type { CognitiveWorldId } from '../types';
import { DEFAULT_CLIMATE, type WorldClimate } from './types';

interface ClimateState {
  climates: Partial<Record<CognitiveWorldId, WorldClimate>>;
  set: (worldId: CognitiveWorldId, climate: WorldClimate) => void;
  get: (worldId: CognitiveWorldId) => WorldClimate;
}

export const useWorldClimateStore = create<ClimateState>((set, get) => ({
  climates: {},
  set: (worldId, climate) =>
    set((s) => ({ climates: { ...s.climates, [worldId]: climate } })),
  get: (worldId) => get().climates[worldId] ?? DEFAULT_CLIMATE,
}));