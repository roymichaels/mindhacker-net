import { useWorldClimateStore } from './worldClimateStore';
import { DEFAULT_CLIMATE, type WorldClimate } from './types';
import type { CognitiveWorldId } from '../types';

export function useWorldClimate(worldId: CognitiveWorldId): WorldClimate {
  return useWorldClimateStore((s) => s.climates[worldId] ?? DEFAULT_CLIMATE);
}

export function useAllWorldClimates() {
  return useWorldClimateStore((s) => s.climates);
}