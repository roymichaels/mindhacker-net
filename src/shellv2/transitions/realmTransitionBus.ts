/**
 * realmTransitionBus — Phase 5N.1.
 *
 * Tiny pub/sub describing AION's traversal between realms. Driven by
 * realmIntentBus; consumed by RealmTransitionLayer and the orb presence
 * runtime. No RAF — pure setTimeout state machine.
 */
import { useEffect, useState } from 'react';
import type { CanonicalSurfaceId } from '@/navigation/canonicalSurfaces';
import { realmIntentBus } from '@/aion/presence/realmIntentBus';

export type TransitionPhase = 'idle' | 'departing' | 'arriving';

export interface TransitionFrame {
  phase: TransitionPhase;
  from: CanonicalSurfaceId | null;
  to: CanonicalSurfaceId | null;
  energy: number;
  startedAt: number;
  durationMs: number;
}

const IDLE: TransitionFrame = {
  phase: 'idle',
  from: null,
  to: null,
  energy: 0,
  startedAt: 0,
  durationMs: 0,
};

let current: TransitionFrame = IDLE;
const listeners = new Set<(f: TransitionFrame) => void>();

function reduced(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function emit() {
  const snap = current;
  listeners.forEach((l) => { try { l(snap); } catch { /* swallow */ } });
}

export const realmTransitionBus = {
  get(): TransitionFrame { return current; },
  subscribe(fn: (f: TransitionFrame) => void): () => void {
    listeners.add(fn);
    fn(current);
    return () => listeners.delete(fn);
  },
};

let depTimer: ReturnType<typeof setTimeout> | null = null;
let endTimer: ReturnType<typeof setTimeout> | null = null;

// Auto-wire to realmIntentBus on first import.
realmIntentBus.subscribe((intent) => {
  if (depTimer) clearTimeout(depTimer);
  if (endTimer) clearTimeout(endTimer);
  const total = reduced() ? 0 : 520;
  current = {
    phase: total === 0 ? 'idle' : 'departing',
    from: (intent.previous as CanonicalSurfaceId | null) ?? null,
    to: intent.target as CanonicalSurfaceId,
    energy: intent.energy,
    startedAt: intent.timestamp,
    durationMs: total,
  };
  emit();
  if (total === 0) return;
  depTimer = setTimeout(() => {
    current = { ...current, phase: 'arriving' };
    emit();
  }, Math.round(total * 0.42));
  endTimer = setTimeout(() => {
    current = IDLE;
    emit();
  }, total);
});

export function useRealmTransition(): TransitionFrame {
  const [s, set] = useState<TransitionFrame>(realmTransitionBus.get());
  useEffect(() => realmTransitionBus.subscribe(set), []);
  return s;
}
