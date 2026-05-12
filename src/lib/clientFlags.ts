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

export type ClientFlag = 'interactive_mode' | 'shell_v2';

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

/**
 * Phase 6 of ShellV2 migration: ShellV2 is now the default for authenticated
 * surfaces. Opt out by visiting any page with `?ff_shell_v2=0` — that flips
 * the persistent flag to '0' and the legacy shell renders again.
 *
 * Read semantics: default TRUE; only '0' disables. Distinct from the raw
 * `useClientFlag('shell_v2')` which uses default-FALSE semantics.
 */
const OFF = '0';
function readShellV2Enabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(PREFIX + 'shell_v2') !== OFF;
}

export function useShellV2Enabled(): boolean {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('ff_shell_v2');
    if (v === '1') {
      window.localStorage.removeItem(PREFIX + 'shell_v2');
      emit();
    } else if (v === '0') {
      window.localStorage.setItem(PREFIX + 'shell_v2', OFF);
      emit();
    }
  }, []);

  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    readShellV2Enabled,
    () => true,
  );
}