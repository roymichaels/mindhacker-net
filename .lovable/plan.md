## Phase 5B.5 — Cognitive Worlds Architecture

Reframe every major hub from "page" into **world** — a spatial, living, semantically-typed layer of consciousness. The graph stops being analytics and becomes the substrate of the OS. AION threads through every world as the same presence.

This phase lays the **architectural primitives** for the worlds system. It does NOT build all the worlds. The first concrete world is wired so the contract is real, not theoretical.

### Core mental model

```text
                    ┌──── AION presence (canonical, shared) ────┐
                    │                                            │
   SelfWorld ──┐    │    each world has:                         │
   Habits     ─┤    │     · spatial scene (its visual language)  │
   Emotions   ─┤    │     · ontology (node/edge kinds)           │
   Beliefs    ─┼──► │     · interaction grammar (verbs)          │
   Memory     ─┤    │     · AION role per world                  │
   Relations  ─┤    │     · graph projection (shared substrate)  │
   Archetypes ─┤    │                                            │
   Creative   ─┤    └────────────────────────────────────────────┘
   Higher     ─┘
        │
        └──► all worlds project into ONE semantic graph
```

A "world" is **not** a route. A world is a typed slice of the user's semantic graph rendered with its own spatial scene and interaction grammar.

### Architectural primitives (this phase ships these)

#### 1. World contract (`src/worlds/types.ts`)

```ts
type CognitiveWorldId =
  | 'self' | 'habits' | 'emotions' | 'beliefs' | 'memory'
  | 'relationships' | 'archetypes' | 'creative' | 'higher';

interface CognitiveWorld {
  id: CognitiveWorldId;
  labelHe: string; labelEn: string;
  // semantic ontology this world owns
  nodeKinds: WorldNodeKind[];      // e.g. for habits: ritual, loop, momentum
  edgeKinds: WorldEdgeKind[];      // e.g. triggers, reinforces, decays
  // spatial language
  scene: WorldSceneSpec;           // metaphor + motion + palette tokens
  interaction: WorldInteractionSpec; // verbs available in this world
  // AION's role inside the world
  aionRole: 'guide' | 'interpreter' | 'orchestrator' | 'observer';
  status: 'live' | 'scaffold' | 'coming';
}
```

Each world declares its **ontology** (node/edge kinds it owns), **scene** (metaphor — constellation, weather, root system, timeline, galaxy…), and **interaction grammar** (verbs the user can perform inside it: traverse, resonate, interrogate, inhabit, etc).

#### 2. World registry (`src/worlds/registry.ts`)

Single source of truth listing all 9 worlds with their ontology + scene + AION role. Most ship as `status: 'scaffold'` (shell + ontology defined, scene stub) or `'coming'` (registered only). One ships as `'live'`.

This **replaces** `src/selfworld/layerRegistry.ts` for the inner-system layers — those layers were a placeholder for what now becomes the worlds registry. SelfWorld becomes one world among many, not a parent of them.

#### 3. Shared semantic graph layer (`src/worlds/graph/`)

- `worldGraphTypes.ts` — `WorldNode`, `WorldEdge`, `WorldKind`, `WorldProjection`.
- `useWorldProjection(worldId)` — selects the user's graph slice owned by a world (filters by node/edge kinds). All worlds read from the **same** underlying graph; each just projects its slice. This preserves graph interoperability — a "belief" node can be referenced by the Beliefs world and the Memory world simultaneously.
- For now, projections read from the existing `useBrainAtlas` / `useBrainOverview` data and tag nodes by inferred kind. No backend changes — pure client-side projection. Backend kind columns come in a later phase.

#### 4. World scene primitives (`src/worlds/scene/`)

Reusable spatial building blocks so each world stays unique without each one rebuilding from scratch:

- `<WorldShell>` — full-bleed container, ambient atmosphere, AION presence anchor (top), exit affordance, world title band.
- `<WorldStage>` — scene mount point. Accepts a `SceneRenderer` from the registry.
- `<WorldComposer>` — bottom AION input scoped to the current world's grammar (verbs become quick prompts).
- Scene renderer types: `Constellation`, `Weather`, `RootSystem`, `Timeline`, `Galaxy`, `EntityCircle`, `Ecosystem`, `Dreamspace`, `BandStack` (the SelfWorld v1 metaphor).

Each scene renderer takes `(projection, presence) => ReactNode`. Scenes are pure renderers; data comes from `useWorldProjection`.

#### 5. AION-in-world contract (`src/worlds/aion/`)

Same canonical AION model everywhere, but AION's **role and copy** vary per world. A `useWorldAion(worldId)` hook exposes:

- presence-aware copy ("AION is reading the weather of your emotions")
- world-scoped quick verbs ("interpret", "trace origin", "find pattern")
- scoped suggestions feed (later phases)

Visual orb stays canonical. Voice stays canonical. Only the *framing* shifts.

#### 6. Routing & navigation

- New route shell `/worlds/:worldId` rendering `<WorldShell>` + the registered scene.
- SelfWorld migrates: `ProfilePage` continues to mount `SelfPanel`, but `SelfPanel` now mounts `<WorldShell worldId="self">` rendering the existing `BandStack` scene. The Phase 5B.4 SelfWorld becomes the reference implementation of the contract.
- The InnerSystemsBand inside SelfWorld now lists worlds (not layers). Tapping a `live`/`scaffold` world navigates to `/worlds/:id`. `coming` worlds reveal the same presence-aware "AION is preparing this world" line.

### First concrete world: Habits

Habits gets a real (minimal) scene so the contract is provable, not theoretical.

- **Ontology:** node kinds `ritual`, `loop`, `momentum`, `decay`; edge kinds `triggers`, `reinforces`, `interrupts`.
- **Scene metaphor:** *Ritual loops + behavioral gravity* — circular orbits where each habit ritual is a satellite whose radius represents momentum (smaller = closer = stronger gravity), pulse rate represents recent execution. Decaying habits drift outward.
- **Interaction grammar verbs:** *follow* (trace the loop), *interrupt*, *amplify*, *reset*.
- **AION role:** `orchestrator`. Copy: "AION is watching the rhythm of your loops."
- **Data source:** projection from existing action_items / habit signals via a thin client adapter `useHabitsProjection()`. No backend change — uses what exists, falls back to demo orbits if data is empty.

Other 7 worlds ship as `scaffold`: the route resolves, `<WorldShell>` mounts, scene renders a *registered placeholder* (a labeled empty state describing the world's metaphor and AION's role) instead of the generic "coming soon" lock. This makes the worlds **navigable and conceptually present** without faking deep functionality.

### What is explicitly NOT built

- No 3D WebGL scenes for worlds beyond what already exists (orbs, DNA helix). Habits scene is a 2D motion-driven SVG/Framer composition. WebGL upgrade per world is a later phase.
- No backend schema changes. No new tables, no edge functions. Node-kind tagging is client-side inference.
- No deep authoring/editing inside worlds yet — only spatial reading + AION verbs.
- No replacement of existing `BrainView` / `BrainGraphForce`. The brain graph stays as the cross-world substrate view; worlds are *projections* of it.
- No collapsing of the AION/DNA/Character triad — that contract is preserved.

### File inventory (planned)

**New**
- `src/worlds/types.ts`
- `src/worlds/registry.ts`
- `src/worlds/graph/worldGraphTypes.ts`
- `src/worlds/graph/useWorldProjection.ts`
- `src/worlds/scene/WorldShell.tsx`
- `src/worlds/scene/WorldStage.tsx`
- `src/worlds/scene/WorldComposer.tsx`
- `src/worlds/scene/scenes/BandStackScene.tsx` (extracted from current SelfWorldShell)
- `src/worlds/scene/scenes/RitualOrbitsScene.tsx` (Habits)
- `src/worlds/scene/scenes/ScaffoldScene.tsx` (placeholder used by `scaffold` worlds)
- `src/worlds/aion/useWorldAion.ts`
- `src/worlds/data/useHabitsProjection.ts`
- `src/pages/WorldRoute.tsx` (route wrapper for `/worlds/:worldId`)
- `mem/architecture/cognitive-worlds-system.md` + index entry

**Edited**
- `src/App.tsx` — add `/worlds/:worldId` route.
- `src/selfworld/SelfWorldShell.tsx` — internally swap to `<WorldShell worldId="self" scene={BandStackScene} />`. Public API unchanged so `SelfPanel` keeps working.
- `src/selfworld/layers/InnerSystemsBand.tsx` — source from worlds registry (not legacy layerRegistry); tap on non-coming worlds navigates to `/worlds/:id`.

**Removed (folded into worlds registry)**
- `src/selfworld/layerRegistry.ts` — superseded. Its labels/hints migrate into `src/worlds/registry.ts`.

### Long-term direction this enables

- Each world can independently upgrade its scene to WebGL/3D without touching the contract.
- Backend node-kind tagging arrives later — projections already accept typed nodes, so the migration is additive.
- Cross-world edges (a memory tied to a belief tied to a relationship) light up automatically since all worlds project from the same graph.
- Multiplayer / shared worlds, agent ecosystems, and persistent companion memory all hang off the same `CognitiveWorld` contract.

### Memory updates

Add `mem://architecture/cognitive-worlds-system` documenting:
- Worlds-as-projections rule (one graph, many spatial scenes).
- World contract (`ontology + scene + interaction grammar + aionRole`).
- AION-in-world rule (canonical orb, world-scoped framing).
- Phase 5B.4 SelfWorld is the reference implementation.

### Success criteria

- `/worlds/self`, `/worlds/habits`, `/worlds/emotions`, `/worlds/beliefs`, `/worlds/memory`, `/worlds/relationships`, `/worlds/archetypes`, `/worlds/creative`, `/worlds/higher` all resolve.
- SelfWorld and Habits render real scenes; the other 7 render their registered scaffold scene (named metaphor + AION role line), not a generic "coming soon" lock.
- Same canonical AION presence reads in every world; only its framing copy differs.
- Tapping an inner-systems entry from SelfWorld navigates into the corresponding world.
- No backend changes, no graph rewrite, no triad regression.
