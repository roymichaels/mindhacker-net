import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorldStateStore } from '../state/worldStateStore';
import { graphMutationBus } from './graphMutationBus';
import type { MutationEvent } from './graphMutationTypes';

const VERB_TO_GRAPH_KIND: Record<string, MutationEvent['kind']> = {
  amplify: 'reinforce',
  follow: 'reinforce',
  reinforce: 'reinforce',
  interrupt: 'weaken',
  release: 'weaken',
  reset: 'weaken',
  reflect: 'observe',
  realign: 'reinforce',
  unearth: 'create',
  question: 'contradict',
  compose: 'connect',
  name: 'create',
  breathe: 'observe',
  trace: 'connect',
  revisit: 'reinforce',
  connect: 'connect',
  meet: 'create',
  inhabit: 'reinforce',
  integrate: 'connect',
  orbit: 'observe',
  soften: 'weaken',
};

export function inferKindFromVerb(verb?: string): MutationEvent['kind'] {
  if (!verb) return 'observe';
  return VERB_TO_GRAPH_KIND[verb] ?? 'observe';
}

export function useGraphMutator() {
  const apply = useWorldStateStore((s) => s.applyMutation);

  return useCallback((eventInput: MutationEvent) => {
    const event: MutationEvent = { at: Date.now(), ...eventInput };
    apply(event);
    graphMutationBus.emit(event);

    if (event.kind !== 'observe') {
      try {
        void supabase.functions
          .invoke('memory-writer', {
            body: {
              source: 'world',
              context: {
                worldId: event.worldId,
                verb: event.verb,
                kind: event.kind,
                meaning: event.meaning ?? event.label ?? event.verb ?? null,
                nodeId: event.nodeId ?? null,
                partnerId: event.partnerId ?? null,
                charge: event.charge ?? null,
              },
            },
          })
          .then?.(() => undefined, (e: unknown) => console.warn('[worlds.memory-writer]', e));
      } catch (e) {
        console.warn('[worlds.memory-writer.dispatch]', e);
      }
    }
    return event;
  }, [apply]);
}