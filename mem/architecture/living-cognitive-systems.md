---
name: Living Cognitive Systems
description: Phase 5B.7 — every world interaction mutates a persistent world state, evolves the shared graph, and shifts AION's continuity awareness over time
type: architecture
---
# Living Cognitive Systems

Worlds are no longer static scenes. Every verb tap is a `MutationEvent`
that flows through `useGraphMutator` → `worldStateStore` (Zustand,
localStorage-persisted) and `graphMutationBus`, and is mirrored to the
existing `memory-writer` edge function with `source: 'world'`.

## State per world

`WorldState`: `activeNodes`, `dormantNodeIds`, `recurringPatterns`,
`unresolvedTensions`, `momentum`, `climate`, `confidence`,
`interactionCount`, `reinforcement`, `contradictions`. Computed inside
`worldStateStore.applyMutation` after every event and decayed on a
30s tick by `useWorldEvolution` using per-world rules in
`WORLD_EVOLUTION` (Habits decays fastest, Memory slowest).

## AION continuity

`useAionContinuity` aggregates across worlds → `recurringThemes`,
`dominantClimate`, `unresolvedLoops`, `avoidedWorlds`, `highEnergyNodes`,
`identityDrift`. `useWorldAion` blends these signals into the line so
AION sounds aware (e.g. "I notice you keep returning to…", climate
colorings). `useContinuityStore` persists per-world visit history.

## Files

- `src/worlds/state/{worldStateTypes.ts,worldStateStore.ts,useWorldState.ts}`
- `src/worlds/graph/{graphMutationTypes.ts,graphMutationBus.ts,useGraphMutator.ts}`
- `src/worlds/continuity/{aionMemoryTypes.ts,continuityStore.ts,useAionContinuity.ts}`
- `src/worlds/evolution/{worldEvolution.ts,useWorldEvolution.ts}`
- `WorldComposer` calls `mutate()`; `WorldShell` mounts `useWorldEvolution`.
- `useHabitsProjection` reads from `worldState.activeNodes` (DEMO falls back only on cold start).
- `ScaffoldScene` consumes climate + continuity for living atmosphere.

## Rules

- **Single mutation entry point.** Never write to `worldStateStore` directly — always go through `useGraphMutator` so the bus + memory-writer fire.
- **Verbs map to graph kinds** via `inferKindFromVerb`. New verbs added to a world's grammar should also be mapped there.
- **No new tables / no edge-function changes.** Persistence is local + the existing `memory-writer` typed-graph pipeline.
- **Decay is non-destructive.** Nodes drop into `dormantNodeIds` at weight < 0.08 but are never deleted, so revival is possible.
