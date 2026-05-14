import { useWorldStateStore } from './worldStateStore';
import { emptyWorldState, type WorldState } from './worldStateTypes';
import type { CognitiveWorldId } from '../types';

export function useWorldState(worldId: CognitiveWorldId): WorldState {
  return useWorldStateStore((s) => s.worlds[worldId] ?? emptyWorldState(worldId));
}

export function useAllWorldStates(): Partial<Record<CognitiveWorldId, WorldState>> {
  return useWorldStateStore((s) => s.worlds);
}