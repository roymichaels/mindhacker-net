/**
 * worldResidue — Phase 5L.5.
 *
 * Emotional memory of *behaviour*, layered on top of climate history.
 * Records dwell time per world (engagement) and stretches of avoidance.
 * Worlds slowly warm with attention and dim when ignored.
 *
 * Persists to localStorage. No DB. Decays with real time so abandoning
 * a world for a week genuinely fades its residue, not just its visit
 * counter.
 */
const STORAGE_KEY = 'aion.world.residue.v1';
const DECAY_HALF_LIFE_MS = 1000 * 60 * 60 * 36; // 36h
const MAX_DWELL_MS = 1000 * 60 * 30;            // 30min cap per visit
const AVOID_THRESHOLD_MS = 1000 * 60 * 60 * 8;  // 8h with no visit = avoidance tick

interface ResidueRecord {
  /** Smoothed engagement score, 0..1. */
  engagement: number;
  /** Smoothed avoidance score, 0..1. */
  avoidance: number;
  /** Last write time (ms). */
  updatedAt: number;
  /** Last visit time (ms). */
  lastVisitAt: number;
}

/**
 * Residue is keyed by stable string id (cognitive world id, canonical
 * surface id, etc). The store is intentionally id-agnostic so behavioural
 * memory works for both worlds and surfaces without two parallel stores.
 */
type ResidueMap = Record<string, ResidueRecord>;

function load(): ResidueMap {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === 'object') ? (parsed as ResidueMap) : {};
  } catch {
    return {};
  }
}

function save(map: ResidueMap) {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch { /* quota */ }
}

function decay(value: number, sinceMs: number): number {
  if (sinceMs <= 0) return value;
  // Exponential half-life decay.
  const k = Math.pow(0.5, sinceMs / DECAY_HALF_LIFE_MS);
  return value * k;
}

function read(worldId: string): ResidueRecord {
  const map = load();
  const rec = map[worldId];
  const now = Date.now();
  if (!rec) return { engagement: 0, avoidance: 0, updatedAt: now, lastVisitAt: 0 };
  const since = now - rec.updatedAt;
  return {
    engagement: decay(rec.engagement, since),
    avoidance: decay(rec.avoidance, since),
    updatedAt: now,
    lastVisitAt: rec.lastVisitAt,
  };
}

function write(worldId: string, next: ResidueRecord) {
  const map = load();
  map[worldId] = next;
  save(map);
  listeners.forEach((l) => { try { l(); } catch { /* swallow */ } });
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Record a visit. `dwellMs` is clamped to `MAX_DWELL_MS`. */
export function recordVisit(worldId: string, dwellMs: number) {
  const cur = read(worldId);
  const dwell = Math.max(0, Math.min(MAX_DWELL_MS, dwellMs));
  const gain = dwell / MAX_DWELL_MS;          // 0..1
  write(worldId, {
    engagement: Math.min(1, cur.engagement * 0.85 + gain * 0.6),
    avoidance:  cur.avoidance * 0.5,           // visiting halves avoidance
    updatedAt:  Date.now(),
    lastVisitAt: Date.now(),
  });
}

/** Tick avoidance for any world the user has not visited recently. */
export function tickAvoidance(allWorlds: string[]) {
  const now = Date.now();
  const map = load();
  let changed = false;
  for (const id of allWorlds) {
    const cur = read(id);
    const sinceVisit = cur.lastVisitAt ? now - cur.lastVisitAt : Infinity;
    if (sinceVisit < AVOID_THRESHOLD_MS) continue;
    const next: ResidueRecord = {
      engagement: cur.engagement * 0.95,
      avoidance:  Math.min(1, cur.avoidance * 0.9 + 0.1),
      updatedAt:  now,
      lastVisitAt: cur.lastVisitAt,
    };
    map[id] = next;
    changed = true;
  }
  if (changed) save(map);
  if (changed) listeners.forEach((l) => { try { l(); } catch { /* swallow */ } });
}

/** Read the current (decayed) residue for a single world. */
export function getResidue(worldId: string): { engagement: number; avoidance: number } {
  const r = read(worldId);
  return { engagement: r.engagement, avoidance: r.avoidance };
}

/** Subscribe to residue changes. Coarse — fires once per write. */
export const worldResidueBus = { subscribe };

import { useEffect, useState } from 'react';

/** React hook: live residue for a single world. */
export function useWorldResidue(worldId: string) {
  const [r, setR] = useState(() => getResidue(worldId));
  useEffect(() => {
    setR(getResidue(worldId));
    return worldResidueBus.subscribe(() => setR(getResidue(worldId)));
  }, [worldId]);
  return r;
}