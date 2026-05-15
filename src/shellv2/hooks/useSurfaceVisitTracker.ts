/**
 * useSurfaceVisitTracker — Phase 5L.5.
 *
 * Records dwell time per canonical surface and ticks avoidance for
 * surfaces the user is ignoring. Mounted once at the shell level.
 *
 * No backend, no RAF — purely route-change driven plus a quiet 60s
 * interval to age avoidance.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';
import { recordVisit, tickAvoidance } from '@/worlds/resonance/worldResidue';

const ALL_IDS = CANONICAL_SURFACES.map((s) => s.id as string);

function surfaceIdForPath(pathname: string): string | null {
  // Exact match first.
  const exact = CANONICAL_SURFACES.find((s) => s.path === pathname);
  if (exact) return exact.id;
  // Prefix match for nested routes (`/brain/something` → `brain`).
  const prefix = CANONICAL_SURFACES.find((s) => s.path !== '/' && pathname.startsWith(s.path + '/'));
  if (prefix) return prefix.id;
  return null;
}

export function useSurfaceVisitTracker(): void {
  const location = useLocation();
  const enteredAt = useRef<number>(Date.now());
  const currentId = useRef<string | null>(surfaceIdForPath(location.pathname));

  useEffect(() => {
    const nextId = surfaceIdForPath(location.pathname);
    const now = Date.now();
    // Close out previous visit.
    if (currentId.current && currentId.current !== nextId) {
      recordVisit(currentId.current, now - enteredAt.current);
    }
    currentId.current = nextId;
    enteredAt.current = now;
  }, [location.pathname]);

  // Periodic avoidance tick + flush on unmount.
  useEffect(() => {
    const id = window.setInterval(() => tickAvoidance(ALL_IDS), 60_000);
    return () => {
      window.clearInterval(id);
      if (currentId.current) {
        recordVisit(currentId.current, Date.now() - enteredAt.current);
      }
    };
  }, []);
}

import type { FC } from 'react';
export const SurfaceVisitTrackerBridge: FC = () => {
  useSurfaceVisitTracker();
  return null;
};