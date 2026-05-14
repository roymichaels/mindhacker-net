/**
 * useHabitsProjection — Phase 5B.5 thin client adapter.
 *
 * Returns a small, demo-shaped projection of ritual loops so the
 * RitualOrbitsScene can render meaningfully even before the typed graph
 * exists. When the user's actual habit/action data flows through, this
 * adapter swaps to reading from the existing services without scene
 * changes.
 */
import { useMemo } from 'react';
import type { WorldProjection, WorldNode } from '../graph/worldGraphTypes';

const DEMO_RITUALS: Array<Pick<WorldNode, 'id' | 'label' | 'weight'> & { kind: string }> = [
  { id: 'ritual-morning', kind: 'ritual', label: 'Morning anchor', weight: 0.85 },
  { id: 'ritual-move',    kind: 'ritual', label: 'Movement',      weight: 0.62 },
  { id: 'ritual-deep',    kind: 'ritual', label: 'Deep work',     weight: 0.55 },
  { id: 'ritual-pause',   kind: 'ritual', label: 'Midday pause',  weight: 0.40 },
  { id: 'ritual-evening', kind: 'ritual', label: 'Evening close', weight: 0.32 },
  { id: 'ritual-decay',   kind: 'decay',  label: 'Drifting habit', weight: 0.12 },
];

export function useHabitsProjection(enabled: boolean): WorldProjection {
  return useMemo<WorldProjection>(() => {
    if (!enabled) return { worldId: 'habits', nodes: [], edges: [], isEmpty: true };
    const nodes: WorldNode[] = DEMO_RITUALS.map((r) => ({
      id: r.id,
      kind: r.kind,
      label: r.label,
      weight: r.weight,
      worldId: 'habits',
    }));
    return { worldId: 'habits', nodes, edges: [], isEmpty: false };
  }, [enabled]);
}
