/**
 * Graph mutation event contract — every world interaction emits one of
 * these via `useGraphMutator`. The mutator updates local world state
 * and forwards meaning to the persistent graph (memory-writer).
 */
import type { CognitiveWorldId } from '../types';

export type MutationKind =
  | 'create'        // new node materialized from an interaction
  | 'reinforce'     // existing node touched / strengthened
  | 'weaken'        // explicit release / interrupt
  | 'connect'       // edge formed between two nodes
  | 'contradict'    // contradictory belief / pattern recorded
  | 'observe';      // passive presence — no graph write, only state nudge

export interface MutationEvent {
  worldId: CognitiveWorldId;
  kind: MutationKind;
  /** Verb id from the world's interaction grammar (e.g. 'amplify'). */
  verb?: string;
  /** Optional node target — id may be synthetic if `create`. */
  nodeId?: string;
  nodeKind?: string;
  label?: string;
  /** -1..+1 emotional charge attached to this event. */
  charge?: number;
  /** Free-form meaning — sent to memory-writer as context. */
  meaning?: string;
  /** For `connect` / `contradict`. */
  partnerId?: string;
  /** ms since epoch; defaults to Date.now() in the mutator. */
  at?: number;
}

export type MutationListener = (event: MutationEvent) => void;
