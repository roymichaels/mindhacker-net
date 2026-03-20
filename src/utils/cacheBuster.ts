/**
 * Cache Buster — Forces clients to refresh stale app bundles safely.
 * - Backward-compatible across version mismatches (prevents old-bundle reload loops)
 * - Clears caches + unregisters service workers
 * - Triggers a one-time hard reload when needed
 */

const CACHE_BUST_VERSION = '2026-03-20-v4';
const CACHE_BUST_KEY = 'mindos-cache-bust-version';
const CACHE_BUST_LAST_RUN_KEY = 'mindos-cache-bust-last-run';
const CACHE_BUST_COOLDOWN_MS = 2 * 60 * 1000;

function toComparableVersion(version: string | null): number {
  if (!version) return 0;
  const digits = version.replace(/\D/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function bustOldCaches(): Promise<boolean> {
  const now = Date.now();
  const lastRun = Number(localStorage.getItem(CACHE_BUST_LAST_RUN_KEY) ?? '0');

  // Loop guard: if this ran moments ago, skip to prevent infinite reload cycles.
  if (Number.isFinite(lastRun) && now - lastRun < CACHE_BUST_COOLDOWN_MS) {
    return false;
  }

  const lastBustVersion = localStorage.getItem(CACHE_BUST_KEY);
  const currentVersionNum = toComparableVersion(CACHE_BUST_VERSION);
  const lastVersionNum = toComparableVersion(lastBustVersion);

  // Backward compatibility:
  // if an older bundle is running but localStorage has newer version, do not bust again.
  if (lastVersionNum >= currentVersionNum) {
    return false;
  }

  // Mark first to avoid loops if reload happens before async operations complete.
  localStorage.setItem(CACHE_BUST_KEY, CACHE_BUST_VERSION);
  localStorage.setItem(CACHE_BUST_LAST_RUN_KEY, String(now));

  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }

    window.location.reload();
    return true;
  } catch (err) {
    console.error('[CacheBuster] Failed to clear cache safely:', err);
    return false;
  }
}
