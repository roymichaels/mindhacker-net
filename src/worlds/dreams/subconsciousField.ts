/**
 * Persistent subconscious memory: motifs, archetypes, residue.
 * The store is write-restricted to the dream engine — UI consumers
 * only read via `useDreamState` selectors.
 *
 * Residue and motif weights decay slowly so the universe "forgets"
 * over months but retains echoes for weeks.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ArchetypeAffinity,
  ArchetypeId,
  DreamEvent,
  SymbolicMotif,
} from './types';
import { ARCHETYPE_IDS } from './types';
import type { CognitiveWorldId } from '../types';

interface FieldState {
  motifs: Record<string, SymbolicMotif>;
  archetypes: Record<ArchetypeId, ArchetypeAffinity>;
  events: DreamEvent[];
  /** per-world residue/reinforcement counters. */
  residue: Partial<Record<CognitiveWorldId, number>>;
  reinforcement: Partial<Record<CognitiveWorldId, number>>;

  // mutations (called only by dreamEngine)
  reinforceMotif: (m: SymbolicMotif) => void;
  decay: (dtMs: number) => void;
  setArchetype: (id: ArchetypeId, affinity: number) => void;
  pushEvent: (e: DreamEvent) => void;
  pruneEvents: (now: number) => void;
  bumpResidue: (worldId: CognitiveWorldId, delta: number) => void;
  bumpReinforcement: (worldId: CognitiveWorldId, delta: number) => void;
}

const seedArchetypes = (): Record<ArchetypeId, ArchetypeAffinity> => {
  const out = {} as Record<ArchetypeId, ArchetypeAffinity>;
  for (const id of ARCHETYPE_IDS) {
    out[id] = { id, affinity: 0, lastUpdated: 0 };
  }
  return out;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const useSubconsciousFieldStore = create<FieldState>()(
  persist(
    (set) => ({
      motifs: {},
      archetypes: seedArchetypes(),
      events: [],
      residue: {},
      reinforcement: {},

      reinforceMotif: (m) =>
        set((s) => {
          const prev = s.motifs[m.id];
          const merged: SymbolicMotif = prev
            ? {
                ...prev,
                weight: clamp01(prev.weight * 0.92 + m.weight * 0.18),
                occurrences: prev.occurrences + 1,
                lastSeen: m.lastSeen,
                archetype: m.archetype ?? prev.archetype,
              }
            : m;
          return { motifs: { ...s.motifs, [m.id]: merged } };
        }),

      decay: (dtMs) =>
        set((s) => {
          // Half-life ~ 7 days for motif weight; ~ 14 days for residue.
          const motifK = Math.exp(-dtMs / (7 * 24 * 3600 * 1000));
          const residueK = Math.exp(-dtMs / (14 * 24 * 3600 * 1000));
          const motifs: Record<string, SymbolicMotif> = {};
          for (const [k, v] of Object.entries(s.motifs)) {
            const w = v.weight * motifK;
            if (w > 0.02) motifs[k] = { ...v, weight: w };
          }
          const residue: Partial<Record<CognitiveWorldId, number>> = {};
          const reinforcement: Partial<Record<CognitiveWorldId, number>> = {};
          for (const [k, v] of Object.entries(s.residue)) {
            const x = (v ?? 0) * residueK;
            if (x > 0.01) residue[k as CognitiveWorldId] = x;
          }
          for (const [k, v] of Object.entries(s.reinforcement)) {
            const x = (v ?? 0) * residueK;
            if (x > 0.01) reinforcement[k as CognitiveWorldId] = x;
          }
          return { motifs, residue, reinforcement };
        }),

      setArchetype: (id, affinity) =>
        set((s) => ({
          archetypes: {
            ...s.archetypes,
            [id]: { id, affinity: clamp01(affinity), lastUpdated: Date.now() },
          },
        })),

      pushEvent: (e) =>
        set((s) => ({ events: [...s.events, e].slice(-24) })),

      pruneEvents: (now) =>
        set((s) => ({
          events: s.events.filter((e) => now - e.startedAt < e.lifespanMs),
        })),

      bumpResidue: (worldId, delta) =>
        set((s) => ({
          residue: {
            ...s.residue,
            [worldId]: clamp01((s.residue[worldId] ?? 0) + delta),
          },
        })),

      bumpReinforcement: (worldId, delta) =>
        set((s) => ({
          reinforcement: {
            ...s.reinforcement,
            [worldId]: clamp01((s.reinforcement[worldId] ?? 0) + delta),
          },
        })),
    }),
    {
      name: 'mindos.subconsciousField.v1',
      version: 1,
      partialize: (s) =>
        ({
          motifs: s.motifs,
          archetypes: s.archetypes,
          residue: s.residue,
          reinforcement: s.reinforcement,
          // events are transient — not persisted.
        }) as any,
    },
  ),
);