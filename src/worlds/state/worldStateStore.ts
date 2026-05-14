import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CognitiveWorldId } from '../types';
import {
  emptyWorldState,
  type ActiveNode,
  type Climate,
  type WorldState,
} from './worldStateTypes';
import type { MutationEvent } from '../graph/graphMutationTypes';

const DORMANT_THRESHOLD = 0.08;
const PATTERN_THRESHOLD = 3;
const MAX_TENSIONS = 12;
const MAX_PATTERNS = 16;

interface StoreState {
  worlds: Partial<Record<CognitiveWorldId, WorldState>>;
  applyMutation: (event: MutationEvent) => void;
  decayWorld: (worldId: CognitiveWorldId, factor?: number) => void;
  getOrInit: (worldId: CognitiveWorldId) => WorldState;
  reset: () => void;
}

const ensureNode = (
  state: WorldState,
  id: string,
  kind: string,
  label: string,
): ActiveNode => {
  const existing = state.activeNodes[id];
  if (existing) return existing;
  const created: ActiveNode = {
    id, kind, label,
    weight: 0.25,
    lastTouched: Date.now(),
    hits: 0,
    charge: 0,
  };
  state.activeNodes[id] = created;
  return created;
};

const recomputeAggregates = (state: WorldState) => {
  const nodes = Object.values(state.activeNodes);
  const total = nodes.reduce((s, n) => s + n.weight, 0);
  const avg = nodes.length ? total / nodes.length : 0;
  state.momentum = Math.max(0, Math.min(1, avg + Math.min(0.4, state.interactionCount / 80)));
  state.confidence = Math.max(0, Math.min(1, nodes.length / 12 + state.reinforcement / 40));
  const charges = nodes.map((n) => n.charge).filter((c) => Math.abs(c) > 0.05);
  const meanCharge = charges.length ? charges.reduce((s, c) => s + c, 0) / charges.length : 0;
  const tensionLoad = state.unresolvedTensions.length / 6;
  const climate: Climate =
    tensionLoad > 1 ? 'turbulent'
    : meanCharge > 0.35 ? 'open'
    : meanCharge < -0.35 ? 'heavy'
    : state.momentum > 0.55 ? 'charged'
    : state.interactionCount === 0 ? 'still'
    : 'calm';
  state.climate = climate;

  const dormant: string[] = [];
  for (const n of nodes) {
    if (n.weight < DORMANT_THRESHOLD) dormant.push(n.id);
  }
  state.dormantNodeIds = Array.from(new Set([...state.dormantNodeIds, ...dormant])).slice(-32);
};

export const useWorldStateStore = create<StoreState>()(
  persist(
    (set, get) => ({
      worlds: {},
      getOrInit: (worldId) => {
        const existing = get().worlds[worldId];
        if (existing) return existing;
        const fresh = emptyWorldState(worldId);
        set((s) => ({ worlds: { ...s.worlds, [worldId]: fresh } }));
        return fresh;
      },
      applyMutation: (event) => set((s) => {
        const prev = s.worlds[event.worldId] ?? emptyWorldState(event.worldId);
        const next: WorldState = {
          ...prev,
          activeNodes: { ...prev.activeNodes },
          dormantNodeIds: [...prev.dormantNodeIds],
          recurringPatterns: [...prev.recurringPatterns],
          unresolvedTensions: [...prev.unresolvedTensions],
          interactionCount: prev.interactionCount + (event.kind === 'observe' ? 0 : 1),
          lastInteractionAt: Date.now(),
        };
        const id = event.nodeId ?? `auto-${event.worldId}-${event.verb ?? 'x'}-${Math.floor(Date.now() / 60000)}`;
        const label = event.label ?? event.meaning ?? event.verb ?? 'signal';
        const kind = event.nodeKind ?? 'signal';

        switch (event.kind) {
          case 'create': {
            const n = ensureNode(next, id, kind, label);
            n.weight = Math.min(1, n.weight + 0.35);
            n.hits += 1;
            n.lastTouched = Date.now();
            if (typeof event.charge === 'number') n.charge = event.charge;
            next.reinforcement += 0.5;
            break;
          }
          case 'reinforce': {
            const n = ensureNode(next, id, kind, label);
            n.weight = Math.min(1, n.weight + 0.18);
            n.hits += 1;
            n.lastTouched = Date.now();
            if (typeof event.charge === 'number') n.charge = (n.charge * 0.7) + (event.charge * 0.3);
            next.reinforcement += 1;
            if (n.hits >= PATTERN_THRESHOLD) {
              const existing = next.recurringPatterns.find((p) => p.id === id);
              if (existing) {
                existing.occurrences += 1;
                existing.lastSeen = Date.now();
              } else {
                next.recurringPatterns = [
                  { id, label, occurrences: n.hits, lastSeen: Date.now() },
                  ...next.recurringPatterns,
                ].slice(0, MAX_PATTERNS);
              }
            }
            break;
          }
          case 'weaken': {
            const n = ensureNode(next, id, kind, label);
            n.weight = Math.max(0, n.weight - 0.25);
            n.lastTouched = Date.now();
            break;
          }
          case 'connect': {
            const a = ensureNode(next, id, kind, label);
            a.weight = Math.min(1, a.weight + 0.08);
            if (event.partnerId) {
              const b = ensureNode(next, event.partnerId, kind, event.partnerId);
              b.weight = Math.min(1, b.weight + 0.08);
            }
            next.reinforcement += 0.3;
            break;
          }
          case 'contradict': {
            const a = ensureNode(next, id, kind, label);
            const partnerId = event.partnerId ?? `${id}-counter`;
            ensureNode(next, partnerId, kind, partnerId);
            next.unresolvedTensions = [
              {
                id: `t-${id}-${partnerId}-${Date.now()}`,
                aId: id,
                bId: partnerId,
                intensity: Math.min(1, 0.4 + (a.weight ?? 0.25)),
                createdAt: Date.now(),
              },
              ...next.unresolvedTensions,
            ].slice(0, MAX_TENSIONS);
            next.contradictions += 1;
            break;
          }
          case 'observe':
          default:
            break;
        }
        recomputeAggregates(next);
        return { worlds: { ...s.worlds, [event.worldId]: next } };
      }),
      decayWorld: (worldId, factor = 0.985) => set((s) => {
        const prev = s.worlds[worldId];
        if (!prev) return s;
        const next: WorldState = {
          ...prev,
          activeNodes: Object.fromEntries(
            Object.entries(prev.activeNodes).map(([k, n]) => [k, { ...n, weight: n.weight * factor }]),
          ),
        };
        recomputeAggregates(next);
        return { worlds: { ...s.worlds, [worldId]: next } };
      }),
      reset: () => set({ worlds: {} }),
    }),
    {
      name: 'mindos.worldState.v1',
      version: 1,
    },
  ),
);