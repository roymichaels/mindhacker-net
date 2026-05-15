/**
 * realmIntentBus — Phase 5M.
 *
 * Pub/sub for realm-anchor selection. Lays the groundwork for 5N
 * atmospheric route transitions by giving listeners the intent BEFORE
 * navigation completes.
 *
 * No backend, no persistence.
 */
import { useEffect, useState } from 'react';

export interface RealmIntent {
  /** Target realm id (canonical surface id). */
  target: string;
  /** Previous realm id (the surface user is leaving). */
  previous: string | null;
  /** When the intent was emitted. */
  timestamp: number;
  /** Residue energy of target realm at intent time, 0..1. */
  energy: number;
}

let last: RealmIntent | null = null;
const listeners = new Set<(i: RealmIntent) => void>();

export const realmIntentBus = {
  emit(intent: RealmIntent) {
    last = intent;
    listeners.forEach((l) => { try { l(intent); } catch { /* swallow */ } });
  },
  last(): RealmIntent | null {
    return last;
  },
  subscribe(fn: (i: RealmIntent) => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

/** React hook — last realm intent emitted. */
export function useLastRealmIntent(): RealmIntent | null {
  const [s, set] = useState<RealmIntent | null>(last);
  useEffect(() => realmIntentBus.subscribe(set), []);
  return s;
}
