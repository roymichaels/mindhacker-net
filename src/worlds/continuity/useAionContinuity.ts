import { useMemo } from 'react';
import { COGNITIVE_WORLDS } from '../registry';
import { useAllWorldStates } from '../state/useWorldState';
import { useContinuityStore } from './continuityStore';
import { emptyContinuity, type ContinuitySignals } from './aionMemoryTypes';
import type { CognitiveWorldId } from '../types';
import type { Climate, WorldState } from '../state/worldStateTypes';

const AVOIDED_AFTER_DAYS = 14;

export function useAionContinuity(): ContinuitySignals {
  const allStates = useAllWorldStates();
  const visits = useContinuityStore((s) => s.visits);

  return useMemo<ContinuitySignals>(() => {
    const states = Object.values(allStates).filter(Boolean) as WorldState[];
    if (!states.length) return emptyContinuity();

    const themeMap = new Map<string, { count: number; worlds: Set<CognitiveWorldId> }>();
    for (const ws of states) {
      for (const p of ws.recurringPatterns) {
        const key = p.label.toLowerCase();
        const entry = themeMap.get(key) ?? { count: 0, worlds: new Set<CognitiveWorldId>() };
        entry.count += p.occurrences;
        entry.worlds.add(ws.worldId);
        themeMap.set(key, entry);
      }
    }
    const recurringThemes = Array.from(themeMap.entries())
      .map(([label, v]) => ({ label, count: v.count, worlds: Array.from(v.worlds) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const climateScore: Record<Climate, number> = {
      calm: 0, charged: 0, heavy: 0, open: 0, turbulent: 0, still: 0,
    };
    for (const ws of states) {
      climateScore[ws.climate] += Math.max(1, ws.interactionCount);
    }
    const dominantClimate = (Object.entries(climateScore)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'still') as Climate;

    const unresolvedLoops = states
      .filter((ws) => ws.unresolvedTensions.length > 0)
      .map((ws) => ({ worldId: ws.worldId, count: ws.unresolvedTensions.length }))
      .sort((a, b) => b.count - a.count);

    const now = Date.now();
    const avoidedWorlds = COGNITIVE_WORLDS
      .filter((w) => {
        const v = visits[w.id];
        if (!v) return true;
        return now - v.lastVisitedAt > AVOIDED_AFTER_DAYS * 86_400_000;
      })
      .map((w) => w.id);

    const highEnergyNodes = states
      .flatMap((ws) =>
        Object.values(ws.activeNodes).map((n) => ({ ...n, worldId: ws.worldId })),
      )
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map((n) => ({ id: n.id, label: n.label, weight: n.weight, worldId: n.worldId }));

    const totalReinforce = states.reduce((s, ws) => s + ws.reinforcement, 0);
    const totalContradict = states.reduce((s, ws) => s + ws.contradictions, 0);
    const identityDrift = Math.max(0, Math.min(1,
      totalContradict / Math.max(1, totalReinforce + totalContradict),
    ));

    return {
      recurringThemes,
      dominantClimate,
      unresolvedLoops,
      avoidedWorlds,
      highEnergyNodes,
      identityDrift,
    };
  }, [allStates, visits]);
}