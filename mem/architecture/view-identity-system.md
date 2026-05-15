---
name: View Identity System (Phase 5C.8)
description: Per-view consciousness modes — each main AION surface modulates the shared atmosphere/orb/motion layers via a declarative ViewIdentity. Same universe, different laws.
type: feature
---

# View Identity System

Phase 5C.8 — Main views (Chat, Brain, Journey, World, Profile,
Interactive) must feel like *different modes of consciousness* in one
AION universe. The mechanism is a single declarative registry; no new
UI surfaces, dashboards or cards.

## Contract

Each main route mounts `<ViewIdentityScope id="..." />`. The store
pushes/pops a stack so overlapping mounts (e.g. Profile modal over
Chat) resolve cleanly back to the prior mode on close.

`ViewIdentity` declares:

- `spatial`     — orb anchor (x, y, scale) + vignette intensity
- `atmosphere`  — cyan/violet/magenta multipliers, particle density, ambient
- `motion`      — drift speed multiplier, duration multiplier, temperament label
- `aion`        — intimacy 0..1, proactive flag
- `interaction` — primary verb advisory

## Tuning intent

| view        | feel                       | orb          | motion      | tone           |
|-------------|----------------------------|--------------|-------------|----------------|
| chat        | intimate communion         | heart-line   | breathing   | warm violet    |
| brain       | constellation              | high & small | flowing     | cool cyan      |
| journey     | forward momentum           | upper        | forward     | balanced warm  |
| world       | outward field              | high & small | expansive   | cooler, low    |
| profile     | descent into self          | mid-deep     | descending  | deep violet    |
| interactive | pure presence              | center large | near-still  | luminous       |

## Read sites

- `src/shellv2/layers/AtmosphereLayer.tsx` — multiplies presence tone
  with view atmosphere; modulates vignette, particle density, drift
  animation duration, ambient opacity. Also exposes CSS vars
  `--view-orb-x/y/scale` for any future orb anchor consumer.

## Files

- `src/viewIdentity/types.ts`
- `src/viewIdentity/registry.ts`
- `src/viewIdentity/viewIdentityStore.ts` (zustand stack)
- `src/viewIdentity/ViewIdentityScope.tsx`
- `src/viewIdentity/index.ts`

## Rules

- Never add a new view identity without a clear *psychological role*.
  The registry is the ontology; do not pollute it.
- AION presence (`aionPresence` state) remains the *pulse*. View
  identity is the *room*. They multiply, never replace each other.
- No view should override CSS for the chamber directly — always go
  through the registry so cross-view transitions stay coherent.