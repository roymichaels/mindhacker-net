/**
 * aionPresenceState — Phase 5B foundation.
 *
 * Single state machine describing what AION is doing right now. Replaces
 * scattered `isLoading / isGenerating / isIdle` booleans across the app.
 * Atmosphere layer, orb shader, composer hint, and ambient lines all
 * subscribe to ONE source instead of inferring state per-component.
 *
 * Pure client state. No backend.
 *
 * States:
 *   listening    — AION is open to input (default ambient)
 *   noticing     — AION just observed a signal worth surfacing
 *   forming      — AION is composing a thought / response
 *   manifesting  — AION is summoning an artifact / capability
 *   resting      — Quiet moment, nothing pulling
 *   evolving     — Long-arc shift (relationship deepened, DNA changed)
 */

export type AionPresenceState =
  | 'listening'
  | 'noticing'
  | 'forming'
  | 'manifesting'
  | 'resting'
  | 'evolving';

type Listener = (state: AionPresenceState) => void;

let current: AionPresenceState = 'listening';
const listeners = new Set<Listener>();

function emit() {
  const snapshot = current;
  listeners.forEach((l) => {
    try { l(snapshot); } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[aionPresenceState] listener error', err);
    }
  });
}

export const aionPresenceBus = {
  get(): AionPresenceState {
    return current;
  },
  set(next: AionPresenceState) {
    if (next === current) return;
    current = next;
    emit();
  },
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    fn(current);
    return () => listeners.delete(fn);
  },
};

/** React hook — subscribe to AION's presence state. */
import { useEffect, useState } from 'react';

export function useAionPresence(): AionPresenceState {
  const [s, setS] = useState<AionPresenceState>(aionPresenceBus.get());
  useEffect(() => aionPresenceBus.subscribe(setS), []);
  return s;
}