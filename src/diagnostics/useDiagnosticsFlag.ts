import { useEffect, useState } from 'react';

const KEY = 'mindos.diag';

/**
 * Diagnostics is visible only in dev OR when the user has explicitly opted
 * in via `localStorage['mindos.diag']='1'` or `?diag=1` in the URL. The URL
 * form latches the flag so subsequent reloads stay enabled until cleared
 * with `?diag=0`.
 */
export function useDiagnosticsFlag(): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => readFlag());

  useEffect(() => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('diag');
    if (q === '1') {
      try {
        localStorage.setItem(KEY, '1');
      } catch { /* ignore */ }
      setEnabled(true);
    } else if (q === '0') {
      try {
        localStorage.removeItem(KEY);
      } catch { /* ignore */ }
      setEnabled(import.meta.env.DEV);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setEnabled(readFlag());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return enabled;
}

function readFlag(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}