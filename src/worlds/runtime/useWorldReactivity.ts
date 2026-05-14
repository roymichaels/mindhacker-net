/**
 * Hidden runtime loop. Mounted ONCE at app shell level via `<WorldsRuntime/>`.
 *
 * Every ~250ms it gathers signals for every known world, evolves each
 * world's climate, and writes to `worldClimateStore`. Pauses while the tab
 * is hidden. The active world (matched from the URL) ticks every cycle;
 * background worlds tick less often to save work.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorldStateStore } from '@/worlds/state/worldStateStore';
import { useWorldClimateStore } from './worldClimateStore';
import { deriveWorldSignals } from './worldSignals';
import { evolveClimate } from './worldReactivity';
import { DEFAULT_CLIMATE } from './types';
import { ATMOSPHERE_PRESETS } from '@/worlds/atmosphere/atmospherePresets';
import { getWorld } from '@/worlds/registry';
import type { CognitiveWorldId } from '../types';

const ALL_WORLDS = Object.keys(ATMOSPHERE_PRESETS) as CognitiveWorldId[];

function activeWorldFromPath(pathname: string): CognitiveWorldId | null {
  const m = pathname.match(/^\/worlds\/([^/?#]+)/);
  if (!m) return null;
  const w = getWorld(m[1]);
  return w ? (w.id as CognitiveWorldId) : null;
}

export function useWorldReactivity() {
  const { pathname } = useLocation();
  const activeRef = useRef<CognitiveWorldId | null>(null);

  useEffect(() => {
    activeRef.current = activeWorldFromPath(pathname);
  }, [pathname]);

  useEffect(() => {
    let last = performance.now();
    let stopped = false;
    let pausedDueToHidden = false;

    // Seed initial climates so atmospheres don't pop in.
    {
      const setClimate = useWorldClimateStore.getState().set;
      const stateMap = useWorldStateStore.getState().worlds;
      const now = performance.now();
      for (const worldId of ALL_WORLDS) {
        const signals = deriveWorldSignals(worldId, stateMap[worldId], now);
        const seeded = evolveClimate(DEFAULT_CLIMATE, signals, 4000, worldId);
        setClimate(worldId, seeded);
      }
    }

    const tick = () => {
      if (stopped) return;
      if (document.hidden) {
        pausedDueToHidden = true;
        last = performance.now();
        return;
      }
      pausedDueToHidden = false;
      const now = performance.now();
      const dt = now - last;
      last = now;

      const stateMap = useWorldStateStore.getState().worlds;
      const setClimate = useWorldClimateStore.getState().set;
      const climateMap = useWorldClimateStore.getState().climates;
      const active = activeRef.current;

      for (const worldId of ALL_WORLDS) {
        if (active !== worldId && Math.random() < 0.4) continue;
        const signals = deriveWorldSignals(worldId, stateMap[worldId], now);
        const prev = climateMap[worldId] ?? DEFAULT_CLIMATE;
        const next = evolveClimate(prev, signals, dt, worldId);
        setClimate(worldId, next);
      }
    };

    const interval = window.setInterval(tick, 250);
    const onVis = () => {
      if (!document.hidden && pausedDueToHidden) {
        last = performance.now();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
}

/** Tiny mount component — drop once near the app root. */
export function WorldsRuntime() {
  useWorldReactivity();
  return null;
}