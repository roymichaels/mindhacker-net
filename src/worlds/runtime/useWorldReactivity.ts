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

      const setInfluence = useWorldInfluenceStore.getState().setInfluence;
      const pushHistory = useWorldHistoryStore.getState().pushFrame;

      // Pass 1 — evolve each world's own climate.
      const evolved: Partial<Record<CognitiveWorldId, ReturnType<typeof evolveClimate>>> = {};
      for (const worldId of ALL_WORLDS) {
        if (active !== worldId && Math.random() < 0.4) continue;
        const sig = deriveWorldSignals(worldId, stateMap[worldId], now);
        const prev = climateMap[worldId] ?? DEFAULT_CLIMATE;
        evolved[worldId] = evolveClimate(prev, sig, dt, worldId);
      }

      // Pass 2 — emit a resonance signal for every world (use freshly
      // evolved climate when available, otherwise the prior committed one).
      const tNow = Date.now();
      const signalsOut: Partial<Record<CognitiveWorldId, WorldResonanceSignal>> = {};
      for (const worldId of ALL_WORLDS) {
        const c = evolved[worldId] ?? climateMap[worldId] ?? DEFAULT_CLIMATE;
        signalsOut[worldId] = emitResonanceSignal(worldId, c, tNow);
      }

      // Pass 3 — propagate cross-world influence (sources looked up from
      // history at each edge's delay).
      const influenceMap = propagateInfluence(signalsOut, tNow);

      // Pass 4 — apply bleed and commit.
      for (const worldId of ALL_WORLDS) {
        const evClimate = evolved[worldId];
        const inf = influenceMap[worldId];
        if (evClimate) {
          const finalClimate = inf ? applyBleed(evClimate, inf.bleed) : evClimate;
          setClimate(worldId, finalClimate);
          pushHistory(worldId, finalClimate, signalsOut[worldId]!);
        }
        if (inf) setInfluence(worldId, inf);
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