/**
 * useActiveState — single source of truth for the active consciousness state.
 *
 * Phase 3.2. Rooms are no longer user-pickable; they are *states* AION (or
 * passive signals) move the user through. UI subscribes; nobody mutates this
 * directly except the orchestrator (`setActiveState`).
 *
 * Stored in-memory + localStorage so the state persists across reloads.
 * A Supabase `presence_state` row will back this in a later migration.
 */
import { useEffect, useState } from 'react';
import { ROOM_REGISTRY } from '@/hallway/rooms';
import type { RoomDefinition, RoomId } from '@/hallway/types';

export type TransitionSource = 'aion' | 'signal' | 'boot' | 'manual';

export interface ActiveState {
  roomId: RoomId;
  reason: string | null;
  source: TransitionSource;
  changedAt: number;
}

const STORAGE_KEY = 'mindos.presence.activeState.v1';
const DEFAULT_ROOM: RoomId = (ROOM_REGISTRY[0]?.id ?? 'beliefs') as RoomId;

function loadInitial(): ActiveState {
  if (typeof window === 'undefined') {
    return { roomId: DEFAULT_ROOM, reason: null, source: 'boot', changedAt: Date.now() };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActiveState;
      if (ROOM_REGISTRY.some((r) => r.id === parsed.roomId)) return parsed;
    }
  } catch {
    // ignore
  }
  return { roomId: DEFAULT_ROOM, reason: null, source: 'boot', changedAt: Date.now() };
}

let current: ActiveState = loadInitial();
const listeners = new Set<(s: ActiveState) => void>();

function persist(state: ActiveState) {
  current = state;
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l(state));
}

/**
 * Set the active state. Only AION orchestration, signal evaluators, or
 * a deliberate transition request should call this. Never wire to a menu.
 */
export function setActiveState(roomId: RoomId, source: TransitionSource, reason?: string) {
  if (!ROOM_REGISTRY.some((r) => r.id === roomId)) return;
  if (current.roomId === roomId && current.source === source) return;
  persist({ roomId, source, reason: reason ?? null, changedAt: Date.now() });
}

export function getActiveState(): ActiveState {
  return current;
}

export function getActiveRoom(): RoomDefinition {
  return (ROOM_REGISTRY.find((r) => r.id === current.roomId) ?? ROOM_REGISTRY[0]) as RoomDefinition;
}

export function useActiveState(): ActiveState {
  const [state, setState] = useState<ActiveState>(current);
  useEffect(() => {
    listeners.add(setState);
    setState(current);
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return state;
}

export function useActiveRoom(): RoomDefinition {
  const state = useActiveState();
  return (ROOM_REGISTRY.find((r) => r.id === state.roomId) ?? ROOM_REGISTRY[0]) as RoomDefinition;
}

/**
 * Global escape hatch so non-React surfaces (chat handlers, AION runtime
 * callbacks) can transition state without prop drilling. Mounted in
 * `PresenceShell` on mount.
 */
declare global {
  interface Window {
    __mindosTransitionState?: (roomId: RoomId, reason?: string, source?: TransitionSource) => void;
  }
}

export function installGlobalTransitionBridge() {
  if (typeof window === 'undefined') return;
  window.__mindosTransitionState = (roomId, reason, source = 'aion') => {
    setActiveState(roomId, source, reason);
  };
}