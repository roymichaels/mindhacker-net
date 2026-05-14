/**
 * Read-only selectors over the subconscious field. UI components
 * should consume these — never write to the store directly.
 */
import { useMemo } from 'react';
import { useSubconsciousFieldStore } from './subconsciousField';
import type { CognitiveWorldId } from '../types';
import type {
  ArchetypeId,
  DreamEvent,
  SubconsciousFieldSnapshot,
  SymbolicMotif,
} from './types';

/** Active dream events scheduled into a given world (may be empty). */
export function useActiveDreamEvents(worldId: CognitiveWorldId): DreamEvent[] {
  const events = useSubconsciousFieldStore((s) => s.events);
  return useMemo(() => {
    const now = Date.now();
    return events.filter(
      (e) => e.worldId === worldId && now - e.startedAt < e.lifespanMs,
    );
  }, [events, worldId]);
}

/** Persistent motifs accumulated for a world. */
export function useWorldMotifs(worldId: CognitiveWorldId): SymbolicMotif[] {
  const motifs = useSubconsciousFieldStore((s) => s.motifs);
  return useMemo(
    () =>
      Object.values(motifs)
        .filter((m) => m.worldId === worldId)
        .sort((a, b) => b.weight - a.weight),
    [motifs, worldId],
  );
}

/** Whole-ecosystem snapshot for AION's quiet observations. */
export function useSubconsciousSnapshot(
  worldId: CognitiveWorldId,
): SubconsciousFieldSnapshot {
  const motifs = useSubconsciousFieldStore((s) => s.motifs);
  const archetypes = useSubconsciousFieldStore((s) => s.archetypes);
  const events = useSubconsciousFieldStore((s) => s.events);
  const residue = useSubconsciousFieldStore((s) => s.residue);
  const reinforcement = useSubconsciousFieldStore((s) => s.reinforcement);

  return useMemo(() => {
    const now = Date.now();
    return {
      motifs: Object.values(motifs).filter((m) => m.worldId === worldId),
      archetypes: Object.values(archetypes),
      events: events.filter(
        (e) => e.worldId === worldId && now - e.startedAt < e.lifespanMs,
      ),
      residue: residue[worldId] ?? 0,
      reinforcement: reinforcement[worldId] ?? 0,
    };
  }, [motifs, archetypes, events, residue, reinforcement, worldId]);
}

/** Dominant ecosystem archetype right now — for AION's witness lines. */
export function useDominantArchetype(): ArchetypeId | null {
  const archetypes = useSubconsciousFieldStore((s) => s.archetypes);
  return useMemo(() => {
    let best: ArchetypeId | null = null;
    let bestScore = 0.3;
    for (const v of Object.values(archetypes)) {
      if (v.affinity > bestScore) {
        bestScore = v.affinity;
        best = v.id;
      }
    }
    return best;
  }, [archetypes]);
}