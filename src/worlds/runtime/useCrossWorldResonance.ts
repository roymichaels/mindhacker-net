import { useMemo } from 'react';
import { useAllWorldClimates } from './useWorldClimate';
import type { CognitiveWorldId } from '../types';
import type { CrossWorldResonance } from './types';

const AFFINITY: Partial<Record<CognitiveWorldId, CognitiveWorldId[]>> = {
  emotions: ['relationships', 'memory'],
  relationships: ['emotions', 'self'],
  memory: ['emotions', 'self'],
  habits: ['higher', 'self'],
  higher: ['habits', 'self'],
  creative: ['memory', 'archetypes'],
  archetypes: ['creative', 'beliefs'],
  beliefs: ['archetypes', 'higher'],
  self: ['higher', 'memory'],
};

export function useCrossWorldResonance(worldId: CognitiveWorldId): CrossWorldResonance {
  const climates = useAllWorldClimates();
  return useMemo(() => {
    const partners = AFFINITY[worldId] ?? [];
    let best: { id: CognitiveWorldId; r: number } | null = null;
    const own = climates[worldId];
    for (const pid of partners) {
      const c = climates[pid];
      if (!c || !own) continue;
      const r =
        own.resonance * 0.5 +
        Math.min(own.luminosity, c.luminosity) * 0.3 +
        Math.min(own.harmonicStability, c.harmonicStability) * 0.2;
      if (!best || r > best.r) best = { id: pid, r };
    }
    return {
      worldId,
      resonance: best?.r ?? own?.resonance ?? 0,
      partner: best?.id ?? null,
    };
  }, [climates, worldId]);
}