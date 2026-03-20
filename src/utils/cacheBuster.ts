/**
 * Cache Buster — Forces all users to get the latest version.
 * Clears all caches, unregisters stale service workers, and reloads once.
 * Returns true if a reload was triggered (caller should abort rendering).
 */

const CACHE_BUST_VERSION = '2026-03-20-v3'; // Bump this to force another bust
const CACHE_BUST_KEY = 'mindos-cache-bust-version';

export async function bustOldCaches(): Promise<boolean> {
  const lastBust = localStorage.getItem(CACHE_BUST_KEY);
  if (lastBust === CACHE_BUST_VERSION) return false; // already busted this version

  console.log('[CacheBuster] Clearing old caches...');

  // Mark FIRST to prevent reload loops
  localStorage.setItem(CACHE_BUST_KEY, CACHE_BUST_VERSION);

  try {
    // 1. Delete ALL caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => {
        console.log('[CacheBuster] Deleting cache:', name);
        return caches.delete(name);
      }));
    }

    // 2. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => {
        console.log('[CacheBuster] Unregistering SW:', reg.scope);
        return reg.unregister();
      }));
    }

    // 3. Hard reload to get fresh assets
    console.log('[CacheBuster] Reloading...');
    window.location.reload();
    return true; // signal that we're reloading
  } catch (err) {
    console.error('[CacheBuster] Error:', err);
    return false;
  }
}
