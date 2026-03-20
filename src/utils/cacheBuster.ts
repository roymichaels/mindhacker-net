/**
 * Cache Buster — Forces all users to get the latest version.
 * Clears all caches, unregisters stale service workers, and reloads once.
 */

const CACHE_BUST_VERSION = '2026-03-20-v2'; // Bump this to force another bust
const CACHE_BUST_KEY = 'mindos-cache-bust-version';

export async function bustOldCaches() {
  const lastBust = localStorage.getItem(CACHE_BUST_KEY);
  if (lastBust === CACHE_BUST_VERSION) return; // already busted this version

  console.log('[CacheBuster] Clearing old caches...');

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

    // 3. Mark as busted so we don't loop
    localStorage.setItem(CACHE_BUST_KEY, CACHE_BUST_VERSION);

    // 4. Hard reload to get fresh assets
    console.log('[CacheBuster] Reloading...');
    window.location.reload();
  } catch (err) {
    console.error('[CacheBuster] Error:', err);
    // Still mark it so we don't loop on errors
    localStorage.setItem(CACHE_BUST_KEY, CACHE_BUST_VERSION);
  }
}
