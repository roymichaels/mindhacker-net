import { useEffect, useRef, useState } from 'react';
import { useWorldStateStore } from '@/worlds/state/worldStateStore';
import { useWorldClimate } from './useWorldClimate';
import type { CognitiveWorldId } from '../types';
import type { WorldMomentumSnapshot } from './types';

/**
 * Smoothed momentum snapshot per world. `short` tracks the live store value;
 * `long` is an EMA over a long window so depth/bloom can bias gently without
 * jitter.
 */
export function useWorldMomentum(worldId: CognitiveWorldId): WorldMomentumSnapshot {
  const liveMomentum = useWorldStateStore((s) => s.worlds[worldId]?.momentum ?? 0);
  const climate = useWorldClimate(worldId);
  const longRef = useRef<number>(liveMomentum);
  const [snap, setSnap] = useState<WorldMomentumSnapshot>({
    worldId,
    short: liveMomentum,
    long: liveMomentum,
  });

  useEffect(() => {
    const k = 0.04;
    longRef.current = longRef.current * (1 - k) + liveMomentum * k;
    setSnap({ worldId, short: liveMomentum, long: longRef.current });
  }, [worldId, liveMomentum, climate.luminosity]);

  return snap;
}