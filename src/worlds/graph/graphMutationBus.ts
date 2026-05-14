import type { MutationEvent, MutationListener } from './graphMutationTypes';

const listeners = new Set<MutationListener>();

export const graphMutationBus = {
  subscribe(listener: MutationListener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  emit(event: MutationEvent) {
    listeners.forEach((l) => {
      try { l(event); } catch (e) { console.warn('[graphMutationBus]', e); }
    });
  },
};