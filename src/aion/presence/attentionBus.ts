/**
 * attentionBus — Phase 5L.2.
 *
 * Tiny pub/sub describing what AION's orb is *attending to* right now.
 * Targets are symbolic — `world-node`, `artifact`, `memory`, etc — and
 * may carry a viewport-normalised focal point [0..1] used by the
 * presence bridge to add a small attentional tug to the orb.
 *
 * Pure client state. No backend.
 */
import { useEffect, useState } from 'react';

export type AttentionTarget =
  | 'user'
  | 'world-node'
  | 'artifact'
  | 'memory'
  | 'self'
  | 'idle';

export interface AttentionFrame {
  target: AttentionTarget;
  /** Optional viewport-normalised focal point, x/y in [0..1]. */
  focal: { x: number; y: number } | null;
  /** Auto-decay timestamp (ms). After this, attention falls back to 'idle'. */
  expiresAt: number;
}

const IDLE: AttentionFrame = { target: 'idle', focal: null, expiresAt: 0 };

let current: AttentionFrame = IDLE;
const listeners = new Set<(f: AttentionFrame) => void>();

function emit() {
  const snap = current;
  listeners.forEach((l) => {
    try { l(snap); } catch { /* swallow */ }
  });
}

function tickIfExpired() {
  if (current.target !== 'idle' && current.expiresAt && Date.now() > current.expiresAt) {
    current = IDLE;
    emit();
  }
}

export const attentionBus = {
  get(): AttentionFrame {
    tickIfExpired();
    return current;
  },
  /** Pull AION's attention to `target`. Auto-decays after `ttlMs`. */
  notice(target: AttentionTarget, focal: { x: number; y: number } | null, ttlMs = 900) {
    current = { target, focal, expiresAt: Date.now() + ttlMs };
    emit();
  },
  release() {
    current = IDLE;
    emit();
  },
  subscribe(fn: (f: AttentionFrame) => void): () => void {
    listeners.add(fn);
    fn(current);
    return () => listeners.delete(fn);
  },
};

/** React hook — subscribe to AION's current attention frame. */
export function useAttention(): AttentionFrame {
  const [f, setF] = useState<AttentionFrame>(attentionBus.get());
  useEffect(() => {
    const unsub = attentionBus.subscribe(setF);
    // Light decay poll — no RAF, just a quiet 500ms tick.
    const id = window.setInterval(() => {
      const next = attentionBus.get();
      setF((prev) => (prev === next ? prev : next));
    }, 500);
    return () => { unsub(); window.clearInterval(id); };
  }, []);
  return f;
}