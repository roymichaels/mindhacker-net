import { lazy, ComponentType } from "react";

/**
 * lazy() wrapper that retries a failed dynamic import once,
 * and on a second failure forces a hard reload to clear stale Vite chunks.
 * Fixes the common "Failed to fetch dynamically imported module" crash
 * that happens after a deploy / HMR while the user has the old shell open.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  key?: string
) {
  const storageKey = `lazyRetry:${key ?? factory.toString().slice(0, 80)}`;
  return lazy(async () => {
    try {
      const mod = await factory();
      sessionStorage.removeItem(storageKey);
      return mod;
    } catch (err) {
      const alreadyRetried = sessionStorage.getItem(storageKey) === "1";
      if (!alreadyRetried) {
        sessionStorage.setItem(storageKey, "1");
        // Small delay then retry once
        await new Promise((r) => setTimeout(r, 250));
        try {
          return await factory();
        } catch {
          // fall through to reload
        }
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }
      throw err;
    }
  });
}