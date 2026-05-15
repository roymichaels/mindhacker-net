
# Phase 5E + 5F — Universe Unification

Two sequential, low-risk passes. No new features. No new visuals. Pure consolidation toward a single living universe substrate.

The audit identified concrete violations:
- 8 orb implementations
- 4 atmosphere systems
- 5 concurrent shells (ShellV2 canonical, others still mounted)
- Double-mounted WebGL stages (`SharedOrbStage` + `PersistentWorldOrb`) — violates single-canvas rule
- 21 root context providers, 2 idle RAF loops
- Dead route `/dashboard` redirect in `Index.tsx`

Goal: collapse all of this into one canonical substrate, with zero user-visible regression.

---

## Phase 5E — Frozen Module Eviction (do first, ~1 pass)

Pure deletion / unmounting pass. No replacements. Anything not reachable from the canonical shell (`ShellV2`) and the live worlds (`self`, `habits`, `emotions`, `mythic`, plus `body` as optional) gets evicted.

### 5E.1 — Inventory & confirm
- Grep `App.tsx` route table → produce a one-time list of "live", "legacy", "dead" routes.
- Cross-reference each legacy route against last 30 days of traffic (`analytics--read_project_analytics`) to confirm zero usage before eviction.
- Output: `/mnt/documents/5E_eviction_list.md` (human-readable kill list for your sign-off inside the same session).

### 5E.2 — Remove dead routing
- Delete `/dashboard` redirect in `Index.tsx`.
- Remove orphan routes that point to deleted pages.
- Drop legacy shell mounts from `App.tsx` (e.g. `DashboardLayout`, `HallwayShell`) — keep their files for now, just stop mounting them. (File deletion happens in 5E.4.)

### 5E.3 — Provider audit
- Walk the 21 root context providers. Any provider whose hook is referenced 0 times after 5E.2 → unmount from root.
- Stop the two idle RAF loops (`WorldsRuntime`, `DreamRuntime`) when no consumer is mounted (gate behind `useSyncExternalStore` subscriber count).

### 5E.4 — Hard delete
- Delete the now-unreachable shell + page files. Update `tsconfig` paths if any alias points at deleted dirs.

**Success criteria:** routing surface drops from 116 → ~60. Build passes. Console clean. Visiting every live route renders identically. `ShellV2` is the only mounted shell.

---

## Phase 5F — Atmosphere + Orb Unification (the sacred pass)

The single-canvas rule becomes enforced architecture, not memory.

### 5F.1 — Canonical primitives (already exist, promote them)
- `universe/depth/CosmosLayer` + `HazeLayer` + `zindex.ts` → declared the **only** atmosphere stack.
- `OrbView` (per `mem://architecture/unified-orb-stage-v4`) → declared the **only** orb entry point. All orb consumers route through it.

### 5F.2 — Single shared WebGL canvas
- One `<UniverseStage>` component mounted exactly once inside `ShellV2`, owning the only `<Canvas>` in the app.
- Inside it: one persistent `OrbScene` + one atmosphere driver. Worlds register as scene children via a `useUniverseSlot()` hook (portal-style), not by mounting their own canvases.
- Delete `SharedOrbStage` and `PersistentWorldOrb` after migrating consumers to `OrbView`/`useUniverseSlot`.

### 5F.3 — Collapse the four atmosphere systems
- Identify the four (audit listed them as concurrent). Merge their state into a single `useUniverseAtmosphere()` store driven by `WorldClimate` + `RESONANCE_GRAPH` (already canonical).
- All `WorldAtmosphere`, `BackgroundLayer`, ad-hoc gradients route through this store. Remove the parallel implementations.

### 5F.4 — Collapse the eight orb implementations
- Audit each. For each: replace with `OrbView` + props, or delete if redundant.
- Anything visual (header chip, drawer, hero, world halo, AION widget) renders the same `CanonicalAionModel` through the shared canvas. The flat brand mark `AionRingMark` stays as the only non-WebGL exception.

### 5F.5 — Runtime verification
- Add a dev-only assertion: `if (canvasMountCount > 1) console.error(...)`.
- Add a dev-only HUD (toggle via `?debug=universe`) showing: active climate, resonance edges, mounted orb consumers, FPS. Removed before merge or hidden behind flag.

**Success criteria:**
- Exactly one `<Canvas>` element in the DOM at all times.
- Exactly one atmosphere store, one orb scene, one climate runtime.
- All chrome orbs render through `OrbView`.
- Memory rule `mem://architecture/unified-orb-stage-v4` no longer violated.
- Zero user-visible regression on `/outer-world`, `/aion`, `/profile`, every world route.

---

## What this phase explicitly does NOT do

- No homepage / whitepaper rewrite (that's a later strategic pass).
- No world consolidation (5G).
- No new visuals or features.
- No ontology changes (5K).
- No promotion of `emotions` / `mythic` to live (5J).

---

## Technical map (for the implementer)

```text
ShellV2
└── UniverseStage              ← only <Canvas> in app
    ├── AtmosphereDriver        ← reads useUniverseAtmosphere()
    ├── OrbScene                ← hosts CanonicalAionModel
    └── WorldSlot[]             ← portaled by useUniverseSlot()
```

```text
OrbView (only public orb API)
  ├─ presence variant
  ├─ chip variant
  ├─ avatar variant
  └─ halo variant
       → all draw into the shared OrbScene
```

```text
useUniverseAtmosphere() (only atmosphere store)
  ← WorldClimate
  ← RESONANCE_GRAPH (cross-world influence)
  → CosmosLayer / HazeLayer / WorldAtmosphere
```

## Order of operations within the session
1. 5E.1 inventory (read-only, produces kill list).
2. 5E.2–5E.4 evictions (each verified by build + route smoke).
3. 5F.1 declare canonical primitives in memory + code comments.
4. 5F.4 collapse orbs first (highest leverage, reduces canvas pressure).
5. 5F.3 collapse atmospheres.
6. 5F.2 collapse to single `<Canvas>` (last, because it depends on 4 and 3).
7. 5F.5 add assertion + ship.

## Rollback strategy
Each sub-step is an independent commit. If 5F.2 destabilizes WebGL on any device, revert that single step — 5F.3 and 5F.4 still hold value standalone.
