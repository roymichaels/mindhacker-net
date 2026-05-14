import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CognitiveWorldId } from '../types';

interface ContinuityRecord {
  lastVisitedAt: number;
  visits: number;
}

interface ContinuityState {
  visits: Partial<Record<CognitiveWorldId, ContinuityRecord>>;
  identityRevision: number;
  registerVisit: (worldId: CognitiveWorldId) => void;
  bumpIdentityRevision: () => void;
}

export const useContinuityStore = create<ContinuityState>()(
  persist(
    (set) => ({
      visits: {},
      identityRevision: 0,
      registerVisit: (worldId) => set((s) => {
        const prev = s.visits[worldId];
        return {
          visits: {
            ...s.visits,
            [worldId]: {
              lastVisitedAt: Date.now(),
              visits: (prev?.visits ?? 0) + 1,
            },
          },
        };
      }),
      bumpIdentityRevision: () => set((s) => ({ identityRevision: s.identityRevision + 1 })),
    }),
    { name: 'mindos.continuity.v1', version: 1 },
  ),
);