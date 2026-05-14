/**
 * useWorldProjection — selects a world's typed slice of the user's graph.
 *
 * For Phase 5B.5 this is a thin client-side adapter: live worlds register
 * their own projection hook (see `data/`); other worlds resolve to an
 * empty projection and let `ScaffoldScene` render the metaphor.
 *
 * Backend node-kind tagging arrives in a later phase — projections will
 * then be powered by typed graph queries instead of inference.
 */
import type { CognitiveWorldId } from '../types';
import { type WorldProjection, emptyProjection } from './worldGraphTypes';
import { useHabitsProjection } from '../data/useHabitsProjection';

export function useWorldProjection(worldId: CognitiveWorldId): WorldProjection {
  const habits = useHabitsProjection(worldId === 'habits');
  if (worldId === 'habits') return habits;
  return emptyProjection(worldId);
}
