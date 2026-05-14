import { useWorldInfluenceStore } from './worldPropagation';
import { ZERO_BLEED, ZERO_ECHO, type WorldInfluence } from './types';
import type { CognitiveWorldId } from '../types';

export function useCrossWorldInfluence(worldId: CognitiveWorldId): WorldInfluence {
  return useWorldInfluenceStore(
    (s) =>
      s.influences[worldId] ?? {
        worldId,
        bleed: ZERO_BLEED,
        echo: ZERO_ECHO,
      },
  );
}

export function useAllCrossWorldInfluences() {
  return useWorldInfluenceStore((s) => s.influences);
}