/**
 * viewIdentityStore — Phase 5C.8.
 *
 * The active "mode of consciousness" the user is currently inside.
 * Read by AtmosphereLayer (and any future shared layer that wants
 * to react to the mode). Written by `<ViewIdentityScope />` mounted
 * inside each main route.
 */
import { create } from 'zustand';
import {
  DEFAULT_VIEW_IDENTITY,
  VIEW_IDENTITIES,
} from './registry';
import type { ViewIdentity, ViewIdentityId } from './types';

interface ViewIdentityState {
  /** Stack of currently-mounted view ids (top of stack = active). */
  stack: ViewIdentityId[];
  /** Resolved identity for the top of the stack. */
  active: ViewIdentity;
  push: (id: ViewIdentityId) => void;
  pop: (id: ViewIdentityId) => void;
}

export const useViewIdentityStore = create<ViewIdentityState>((set) => ({
  stack: [],
  active: DEFAULT_VIEW_IDENTITY,
  push: (id) =>
    set((s) => {
      const stack = [...s.stack, id];
      return { stack, active: VIEW_IDENTITIES[stack[stack.length - 1]!] };
    }),
  pop: (id) =>
    set((s) => {
      // Remove the most recent occurrence — supports overlapping mounts
      const idx = s.stack.lastIndexOf(id);
      if (idx < 0) return s;
      const stack = [...s.stack.slice(0, idx), ...s.stack.slice(idx + 1)];
      const top = stack[stack.length - 1];
      return {
        stack,
        active: top ? VIEW_IDENTITIES[top] : DEFAULT_VIEW_IDENTITY,
      };
    }),
}));

export function useActiveViewIdentity(): ViewIdentity {
  return useViewIdentityStore((s) => s.active);
}