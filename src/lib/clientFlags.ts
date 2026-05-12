/**
 * Lightweight client-side feature flags backed by localStorage.
 *
 * Distinct from `featureFlags.ts` (build-time env-driven) — `clientFlags`
 * are runtime, per-user, and toggleable without a redeploy. Used to gate
 * new surfaces behind opt-in until they become default.
 *
 * Visiting `?ff_<flag>=1` in the URL flips a flag on; `?ff_<flag>=0` flips
 * it off. Useful for QA and progressive rollout.
 */
import { useEffect, useSyncExternalStore } from 'react';

const PREFIX = 'aion.flag.';

export type ClientFlag = 'interactive_mode';

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

function read(flag: ClientFlag): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(PREFIX + flag) === '1';
}

export function setClientFlag(flag: ClientFlag, value: boolean) {
  if (typeof window === 'undefined') return;
  if (value) window.localStorage.setItem(PREFIX + flag, '1');
  else window.localStorage.removeItem(PREFIX + flag);
  emit();
}

export function useClientFlag(flag: ClientFlag): boolean {
  // Honour `?ff_<flag>=1|0` once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get(`ff_${flag}`);
    if (v === '1') setClientFlag(flag, true);
    else if (v === '0') setClientFlag(flag, false);
  }, [flag]);

  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => read(flag),
    () => false,
  );
}