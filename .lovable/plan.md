
# Phase 5B.7 — Living Cognitive Systems

Goal: every world interaction captures meaning, mutates a shared graph, accumulates continuity, and changes how AION responds over time. No new pages — extend the worlds layer already shipped in 5B.5.

## Architecture additions

```text
src/worlds/
├── state/
│   ├── worldStateTypes.ts        ← per-world state shape (momentum, climate, tensions…)
│   ├── useWorldState.ts          ← read+subscribe hook
│   └── worldStateStore.ts        ← Zustand store, persisted to localStorage
├── graph/
│   ├── graphMutationTypes.ts     ← MutationEvent union (create/reinforce/weaken/connect/contradict)
│   ├── useGraphMutator.ts        ← single entry point: mutate(event)
│   └── graphMutationBus.ts       ← emits events to memory-writer + state reducers
├── continuity/
│   ├── aionMemoryTypes.ts        ← recurring themes, dominant climate, avoided worlds…
│   ├── useAionContinuity.ts      ← derives signals from graph + world state
│   └── continuityStore.ts        ← persisted, hydrates on app boot
├── evolution/
│   ├── worldEvolution.ts         ← rules per world (decay curves, momentum gravity…)
│   └── useWorldEvolution.ts      ← runs reducers when state/projection changes
└── aion/useWorldAion.ts          ← extended to consume continuity signals
```

## Behaviour contract

1. **Mutation pipeline.** Every world verb / interaction calls `mutate({worldId, kind, payload})` from `useGraphMutator`. The mutator:
   - updates local `worldStateStore` (optimistic),
   - emits to `graphMutationBus`,
   - fires the existing `memory-writer` edge function with `source: 'world'` and the world id, so the persistent graph grows the same way chat/journal already do.
2. **World state.** Each world reduces mutation events into a typed `WorldState` with: `activeNodes`, `dormantNodes`, `recurringPatterns`, `unresolvedTensions`, `momentum`, `climate`, `confidence`, `contradictions`, `reinforcement`. Persisted per-user key.
3. **Graph evolution.** `worldEvolution.ts` defines per-world rules (Habits = momentum + decay, Beliefs = contradiction detection, Emotions = climate history, Memory = era clustering, Relationships = attachment weight, Archetypes = dominance/shadow, Creative = idea lineage, Higher = alignment drift). Runs on a debounced tick + on every mutation.
4. **AION continuity.** `useAionContinuity` aggregates across worlds → `{ recurringThemes, dominantClimate, unresolvedLoops, avoidedWorlds, highEnergyNodes, identityDrift }`. `useWorldAion` blends it into the line/verbs so AION sounds aware ("you keep returning to…", "this loop is gaining gravity…").
5. **Visual evolution.** Scenes read `useWorldState(worldId)` and adjust:
   - RitualOrbits: orbits tighten with momentum, decay drifts outward, streak gravity pulses.
   - ScaffoldScene becomes `LivingScaffoldScene` — even unbuilt worlds show climate/tension haze derived from cross-world signals.
   - BandStack picks up subtle highlights for bands with high recent activity.

## Concrete file changes

- **New (11):** the 11 files listed in the tree above.
- **Edit:**
  - `src/worlds/scene/WorldComposer.tsx` → buttons call `mutate()` instead of being display-only.
  - `src/worlds/scene/scenes/RitualOrbitsScene.tsx` → drive radius/opacity/pulse from `useWorldState('habits')` instead of demo array.
  - `src/worlds/scene/scenes/ScaffoldScene.tsx` → consume continuity to render an evolving haze + "AION is forming this world" hint.
  - `src/worlds/aion/useWorldAion.ts` → blend continuity signals into `line`.
  - `src/worlds/data/useHabitsProjection.ts` → projection now derives from `worldState.activeNodes` (falls back to demo only on cold start).
  - `src/worlds/scene/WorldShell.tsx` → mount a `<WorldEvolutionTicker worldId={…} />` invisible component.
  - `mem/architecture/cognitive-worlds-system.md` → add "Living Cognitive Systems" section + reference new files.
  - `mem/index.md` → add memory entry.

## Persistence strategy

- Local first: `worldStateStore` + `continuityStore` use Zustand `persist` middleware keyed by `user_id`. Survives reloads, lets evolution feel real immediately.
- Server side: every mutation also dispatches to existing `memory-writer` edge function — no schema change required (it already accepts arbitrary `source` + `context` and writes typed nodes via `graphUpsert`). Future phase can add a typed `world_state` table; not in scope here.

## Explicitly NOT in scope

- No new edge functions, no DB migration, no new tables.
- No 3D scene upgrades, no new world routes, no triad changes.
- Composer verbs remain the same labels — only their behaviour upgrades from display to mutation.
- Scaffold worlds stay scaffolded; they just gain living atmosphere from continuity.

## Success check

- Tapping a verb in any live world updates persistent state, immediately re-renders the scene, and is reflected in AION's next line.
- After multiple sessions, AION's `useWorldAion` line changes to reference recurring themes / dominant climate.
- Refreshing the app preserves momentum/decay/climate (localStorage hydration).
- Build passes; no regressions to SelfWorld band-stack or existing routes.
