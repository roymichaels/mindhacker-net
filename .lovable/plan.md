
# Phase 5D.1 — Living Cognitive Universe (Depth Spine + Flagship World)

## Intent

Stop rendering "UI on top of atmosphere." Start rendering **a world that the
UI emerges from**. This phase lands two things together so neither drifts:

1. A **shared depth/atmosphere spine** every future surface inherits.
2. The **World surface** as the proof — turned from a centered orb + grid
   into a planetary cognitive terrain with glowing node anchors (matches
   reference image #2).

Other surfaces (Journey, Self, Chat, Mind) are explicitly out of scope; they
follow as 5D.2 → 5D.5 reusing the same primitives.

## Guardrails (do not violate)

- No new dashboards, no new cards, no new dock icons.
- AION orb keeps its single canonical render path (`SharedOrbStage` /
  `PersistentWorldOrb`). We add presence behaviour, not a second orb.
- Dream layer stays subliminal — no "subconscious detected" UI.
- ViewIdentity registry from 5C.8 is the only place that tunes per-view
  atmosphere. New depth layers read its CSS vars.
- All new colors via HSL semantic tokens; no raw hex in components.
- RTL-safe (logical props, `dir` honoured).

## What "depth spine" means

A formal 5-layer stack rendered behind every authenticated route:

```text
  z=10  CosmosLayer        — far stars, deep nebula, almost still
  z=11  HazeLayer          — environmental fog/atmospheric perspective
  z=12  EnergyFieldLayer   — slow drifting glow fields, light bridges
  z=13  StructureLayer     — per-route terrain / sacred geometry / river
  z=14  AnchorLayer        — interactive cognitive nodes (pins, milestones)
  z=15+ ChromeTraces       — minimal text whispers, nav ghost
```

Layers 10–12 are global and always mounted (`ShellV2`'s
`BackgroundLayer` + `AtmosphereLayer` already cover 10 and 12; we add
`HazeLayer` between them and let the existing AtmosphereLayer evolve into
the EnergyField role). Layers 13–14 are per-route — each surface
contributes its own scene component.

## Deliverable A — Shared depth primitives

New folder `src/universe/`:

- `depth/zindex.ts` — extends `shellv2/zindex.ts` with `cosmos`, `haze`,
  `energy`, `structure`, `anchor` tokens.
- `depth/CosmosLayer.tsx` — pure CSS deep-space backdrop: large-radius
  radial gradients + ultra-faint star noise, drift speed driven by
  `--view-drift`. Replaces the current flat `bg-background` paint role
  inside `BackgroundLayer`.
- `depth/HazeLayer.tsx` — atmospheric fog band: two large blurred
  gradients tinted by the active world's `primaryHsl` / `secondaryHsl`,
  modulated by `WorldClimate` (already live).
- `primitives/AnchorPin.tsx` — the canonical "glowing node on terrain":
  ring + halo + dropped-light cone + label that fades in via
  `motion/framer` with sacred easing. RTL-aware label placement.
- `primitives/EnergyPath.tsx` — animated SVG/CSS light-bridge between
  two coordinates (used to connect anchors and dissolve sections).
- `primitives/SacredEasings.ts` — exported easing curves: `breath`,
  `drift`, `dissolve`, `orbit`. All > 800ms, all `cubic-bezier` style.
- `primitives/usePresenceParallax.ts` — tiny parallax hook (pointer +
  device-orientation if available, gated by reduced-motion) returning
  a small offset vector consumed by anchors and structure layers.

These primitives are pure presentation — no data, no business logic.

## Deliverable B — AION presence upgrade (subtle pass)

Inside `src/aion/presence/`:

- `useOrbPresenceBehaviour.ts` — derives orb anchor (x, y, scale) over
  time from: ViewIdentity anchor (5C.8), pointer dwell, route entry,
  AION presence state. Output is a smoothed (lerp, tau≈1.2s) target
  consumed by `SharedOrbStage`'s existing position channel.
- Adds three behaviours: **anticipate** (drift 8% toward next likely
  anchor on dwell), **observe** (still + slow breath when idle >12s),
  **precede** (slide ahead on route change before content fades in).
- No new orb mount. No new geometry. Behaviour only.

## Deliverable C — Flagship World surface

Rewrite `src/pages/OuterWorldHub.tsx` from the current 37-line orb +
`AlignedRealities` layout into a single `WorldTerrainScene`:

- New folder `src/world/terrain/`:
  - `WorldTerrainScene.tsx` — full-bleed scene composing `CosmosLayer`,
    `HazeLayer`, a `PlanetHorizonLayer`, and an `AnchorField`.
  - `PlanetHorizonLayer.tsx` — large CSS-only curved horizon glow
    (one big radial gradient + rim light) anchored top-right, tinted
    via current ViewIdentity. No 3D, no asset.
  - `AnchorField.tsx` — positions 5–7 `AnchorPin`s using a deterministic
    layout function over the existing `AlignedRealities` data (people,
    opportunities, places, events, environmental influences). No new
    data sources.
  - `useWorldAnchors.ts` — adapts whatever `AlignedRealities` consumes
    today into the anchor data contract; falls back to seed anchors
    when empty so the place is never lifeless.
- Uses `EnergyPath` to draw subliminal light-bridges between connected
  anchors (e.g., a person tied to an opportunity).
- Tap on an anchor opens the existing detail flow (whatever
  `AlignedRealities` items currently link to). No new navigation.
- Header text becomes a single fading whisper ("העולם החיצוני /
  Outer World") that dissolves after ~4s, like `WorldShell`'s
  whisper. No card, no overall summary panel.

The legacy `AlignedRealities` component is **kept** but only rendered
behind a diagnostic flag for fallback during QA, not in the user path.

## Deliverable D — Chrome de-emphasis (scoped, World-only)

- On `/outer-world`, `NavLayer` opacity drops to ~0.55 with a 1.4s
  ease and lifts back to full on tap/dwell near the bottom edge.
  Implemented via a `useChromeDeemphasis(routeId)` hook reading
  ViewIdentity. No removal — only ambient.

## Deliverable E — Memory + docs

- New mem file `mem/architecture/living-cognitive-universe.md` with
  the depth-spine contract, the primitives list, and the rule:
  *every new surface must compose primitives, not invent backgrounds.*
- Update `mem/architecture/world-atmosphere-system.md` with the link
  to depth spine and the AnchorField pattern.

## Out of scope for 5D.1 (named so I don't drift)

- Journey "river of milestones" rewrite → 5D.2.
- Self/Profile "sacred chamber" rewrite → 5D.3.
- Chat "conversation inside a field" → 5D.4.
- Mind constellation upgrade → 5D.5.
- Per-cognitive-world physics expansion (Emotions weather, Beliefs
  cathedral, Memory fragments, etc.) → 5D.6 (builds on 5C.7 physics
  registry).
- WebGL terrain, generated textures, or any image asset.
- New nav model. The dock stays; it just dims.

## Technical notes

- All new layers are CSS / SVG / framer-motion only. No three.js
  beyond what `SharedOrbStage` already mounts.
- Performance budget: zero new continuous JS RAF loops. Drift comes
  from CSS animations whose `animationDuration` is read from
  `--view-drift` (already wired in `AtmosphereLayer`).
- Reduced-motion: parallax disabled, drifts pinned to base, energy
  paths stop pulsing but still render.
- Hebrew: all whispers / labels read `useTranslation`, RTL via `dir`
  on the scene root.

## Files touched (summary)

Added:
- `src/universe/depth/{zindex,CosmosLayer,HazeLayer}.tsx`
- `src/universe/primitives/{AnchorPin,EnergyPath,SacredEasings,usePresenceParallax}.{tsx,ts}`
- `src/aion/presence/useOrbPresenceBehaviour.ts`
- `src/world/terrain/{WorldTerrainScene,PlanetHorizonLayer,AnchorField,useWorldAnchors}.{tsx,ts}`
- `src/hooks/useChromeDeemphasis.ts`
- `mem/architecture/living-cognitive-universe.md`

Edited:
- `src/pages/OuterWorldHub.tsx` (rewrite to mount `WorldTerrainScene`)
- `src/shellv2/layers/BackgroundLayer.tsx` (add `CosmosLayer`)
- `src/shellv2/layers/AtmosphereLayer.tsx` (add `HazeLayer` slot)
- `src/shellv2/layers/NavLayer.tsx` (consume `useChromeDeemphasis`)
- `src/components/orb/v2/SharedOrbStage.tsx` (consume orb presence
  behaviour anchor — read-only)
- `mem/architecture/world-atmosphere-system.md`

Untouched: all data hooks, all routes other than `/outer-world`, all
other main views, all backend, all auth, all RPCs.

## Success criteria

- Opening `/outer-world` feels like walking onto a planetary terrain.
  Glowing pins float above a horizon; light bridges link related
  anchors; the orb drifts to anticipate.
- The dock fades back when you arrive and returns when you reach for it.
- No card frames, no list, no summary panel anywhere on the surface.
- Other routes (Chat, Brain, Journey, Profile) still work exactly as
  they did — they just inherit the new CosmosLayer in the background.
- Reduced-motion users get a calm, still version with the same
  composition.

After this lands and feels right, 5D.2 (Journey) can reuse
`AnchorPin`, `EnergyPath`, `SacredEasings` and the depth spine
directly — no new primitives needed.
