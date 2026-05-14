import { useEffect } from 'react';
import { useWorldStateStore } from '../state/worldStateStore';
import { useContinuityStore } from '../continuity/continuityStore';
import { WORLD_EVOLUTION } from './worldEvolution';
import type { CognitiveWorldId } from '../types';

const TICK_MS = 30_000;

export function useWorldEvolution(worldId: CognitiveWorldId) {
  const decayWorld = useWorldStateStore((s) => s.decayWorld);
  const registerVisit = useContinuityStore((s) => s.registerVisit);

  useEffect(() => {
    registerVisit(worldId);
    const rule = WORLD_EVOLUTION[worldId];
    if (!rule) return;
    const id = window.setInterval(() => {
      decayWorld(worldId, rule.decay);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [worldId, decayWorld, registerVisit]);
}