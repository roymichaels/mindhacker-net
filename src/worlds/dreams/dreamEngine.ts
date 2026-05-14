/**
 * Dream engine — slow subconscious tick.
 *
 * Reads the resonance history summaries + live climates and decides
 * whether any world has crossed a symbolic emergence threshold. When
 * it does, a `DreamEvent` is scheduled into the field with a low
 * intensity and short lifespan. The atmosphere reads active events
 * and renders a subtle visual layer.
 *
 * Cadence: every ~12s while visible. The infrequency is deliberate —
 * the universe should feel like it dreams, not perform.
 */
import { useEffect } from 'react';
import { useWorldClimateStore } from '@/worlds/runtime/worldClimateStore';
import { useWorldHistoryStore } from '@/worlds/resonance/worldStateHistory';
import { ATMOSPHERE_PRESETS } from '@/worlds/atmosphere/atmospherePresets';
import type { CognitiveWorldId } from '../types';
import { useSubconsciousFieldStore } from './subconsciousField';
import { detectMotif, buildMotif } from './symbolicPatterns';
import {
  computeArchetypeTargets,
  dominantArchetypeFor,
} from './archetypeEmergence';
import type { DreamEvent } from './types';

const ALL_WORLDS = Object.keys(ATMOSPHERE_PRESETS) as CognitiveWorldId[];

const TICK_MS = 12000;
const ARCHETYPE_SMOOTH = 0.05; // very slow EMA

/** Convert a motif weight into a scheduled dream event. */
function scheduleEvent(
  worldId: CognitiveWorldId,
  motif: ReturnType<typeof buildMotif>,
  now: number,
): DreamEvent {
  // Intensity capped low — dreams are subtle.
  const intensity = Math.min(0.45, 0.18 + motif.weight * 0.35);
  // Lifespan scales with weight; 18s minimum, ~70s maximum.
  const lifespanMs = 18000 + motif.weight * 50000;
  return {
    id: `${motif.id}:${now}`,
    worldId,
    kind: motif.kind,
    archetype: motif.archetype,
    intensity,
    startedAt: now,
    lifespanMs,
  };
}

function dreamTick(lastTickAt: number) {
  const now = Date.now();
  const dt = now - lastTickAt;

  const climates = useWorldClimateStore.getState().climates;
  const summaries = useWorldHistoryStore.getState().summaries;

  const fieldState = useSubconsciousFieldStore.getState();
  const {
    reinforceMotif,
    decay,
    setArchetype,
    pushEvent,
    pruneEvents,
    bumpResidue,
    bumpReinforcement,
    archetypes,
    residue,
    reinforcement,
    events,
  } = fieldState;

  // 1. Decay long-term memory before adding new energy.
  if (dt > 0) decay(dt);

  // 2. Update residue/reinforcement counters from current climate.
  for (const worldId of ALL_WORLDS) {
    const c = climates[worldId];
    if (!c) continue;
    const dark = Math.max(0, (1 - c.harmonicStability) * 0.04 - c.luminosity * 0.02);
    const light = Math.max(0, c.luminosity * 0.04 + c.resonance * 0.02);
    if (dark > 0) bumpResidue(worldId, dark);
    if (light > 0) bumpReinforcement(worldId, light);
  }

  // 3. Refresh archetype affinities (slow EMA toward fresh targets).
  const fields: Parameters<typeof computeArchetypeTargets>[0] = {};
  for (const worldId of ALL_WORLDS) {
    const c = climates[worldId];
    const h = summaries[worldId];
    if (!c || !h) continue;
    fields[worldId] = {
      climate: c,
      history: h,
      residue: residue[worldId] ?? 0,
      reinforcement: reinforcement[worldId] ?? 0,
    };
  }
  const targets = computeArchetypeTargets(fields);
  const refreshedAffinities = { ...archetypes } as typeof archetypes;
  for (const id of Object.keys(targets) as Array<keyof typeof targets>) {
    const prev = archetypes[id]?.affinity ?? 0;
    const next = prev + (targets[id] - prev) * ARCHETYPE_SMOOTH;
    setArchetype(id, next);
    refreshedAffinities[id] = { id, affinity: next, lastUpdated: now };
  }

  // Snapshot of current affinity values for downstream selection.
  const affinityMap = Object.fromEntries(
    Object.entries(refreshedAffinities).map(([k, v]) => [k, v.affinity]),
  ) as Record<keyof typeof targets, number>;

  // 4. Detect motifs per world. Probability of emergence is low; gated
  //    by both a base coin flip and an absence-of-recent-event check.
  for (const worldId of ALL_WORLDS) {
    const f = fields[worldId];
    if (!f) continue;
    const candidate = detectMotif({ worldId, ...f });
    if (!candidate) continue;
    // Already an active event for this kind in this world? Skip.
    const hasActive = events.some(
      (e) => e.worldId === worldId && e.kind === candidate.kind,
    );
    if (hasActive) continue;

    // Base emergence probability: rare. Scales with weight.
    const p = 0.04 + candidate.weight * 0.18;
    if (Math.random() > p) continue;

    const archetype = dominantArchetypeFor(worldId, affinityMap, f.climate, f.residue);
    const motif = buildMotif(worldId, candidate, archetype, now);
    reinforceMotif(motif);
    pushEvent(scheduleEvent(worldId, motif, now));
  }

  // 5. Prune expired events.
  pruneEvents(now);
}

/** Hidden runtime — mounted once via `<DreamRuntime />`. */
export function DreamRuntime() {
  useEffect(() => {
    let last = Date.now();
    let stopped = false;

    // Initial decay-only tick using stored timestamps would require
    // persisting `lastTickAt`; we simply start fresh each session and
    // let decay accumulate per actual elapsed runtime.
    const interval = window.setInterval(() => {
      if (stopped || document.hidden) return;
      dreamTick(last);
      last = Date.now();
    }, TICK_MS);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, []);

  return null;
}