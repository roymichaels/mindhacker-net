/**
 * Cache Buster — Forces clients to refresh stale app bundles safely.
 * - Prevents infinite reload loops (URL guard + version checks)
 * - Clears caches + unregisters service workers
 * - Triggers a one-time hard reload when needed
 */

const CACHE_BUST_VERSION = '2026-03-25-v6';
const CACHE_BUST_KEY = 'mindos-cache-bust-version';
const CACHE_BUST_PARAM = 'cbv';

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
  } catch {
    // ignore storage access failures
  }
}

function toComparableVersion(version: string | null): number {
  if (!version) return 0;
  const digits = version.replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCurrentUrl(): URL {
  return new URL(window.location.href);
}

export async function bustOldCaches(): Promise<boolean> {
  const url = getCurrentUrl();
  const reloadedWithBust = url.searchParams.get(CACHE_BUST_PARAM) === CACHE_BUST_VERSION;

  // URL guard: if we already reloaded with this version, stop and clean query param.
  if (reloadedWithBust) {
    url.searchParams.delete(CACHE_BUST_PARAM);
    window.history.replaceState({}, '', url.toString());
    safeSet(localStorage, CACHE_BUST_KEY, CACHE_BUST_VERSION);
    return false;
  }

  const lastBustVersion = safeGet(localStorage, CACHE_BUST_KEY);
  const currentVersionNum = toComparableVersion(CACHE_BUST_VERSION);
  const lastVersionNum = toComparableVersion(lastBustVersion);

  // If this browser has already busted this or a newer bundle, do nothing.
  if (lastVersionNum >= currentVersionNum) {
    return false;
  }

  // Mark early to avoid loops if the process is interrupted.
  safeSet(localStorage, CACHE_BUST_KEY, CACHE_BUST_VERSION);

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch (err) {
    console.error('[CacheBuster] Failed to clear cache safely:', err);
  }

  // Force exactly one reload using URL guard.
  const reloadUrl = getCurrentUrl();
  reloadUrl.searchParams.set(CACHE_BUST_PARAM, CACHE_BUST_VERSION);
  window.location.replace(reloadUrl.toString());
  return true;
}
