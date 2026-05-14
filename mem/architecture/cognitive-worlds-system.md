---
name: Cognitive Worlds System
description: Worlds-as-projections architecture; each hub is a typed slice of one shared semantic graph rendered with its own scene, ontology, interaction grammar, and AION role
type: feature
---
# Cognitive Worlds System

Hubs are not pages. Each major hub is a **cognitive world** — a typed projection of one shared semantic graph rendered with its own spatial scene, ontology, interaction grammar, and AION role.

## Contract

`src/worlds/types.ts` → `CognitiveWorld` declares:
- `nodeKinds` / `edgeKinds` — ontology this world owns.
- `scene: { kind, metaphorHe/En, accentHsl }` — visual language.
- `interaction.verbs` — verbs available inside the world.
- `aionRole: guide | interpreter | orchestrator | observer`.
- `status: live | scaffold | coming`.

## Rules

- **One graph, many scenes.** Worlds project from the same underlying graph via `useWorldProjection(worldId)`. Cross-world edges are first-class.
- **AION stays canonical.** `CanonicalAionModel` everywhere. Only AION's *framing* (role + line + verbs) changes per world via `useWorldAion(worldId)`.
- **Triad preserved.** AION (intelligence), DNA (consciousness), Character (embodiment) remain three distinct entities. SelfWorld is one world among many.
- **Worlds are routable.** `/worlds/:worldId` resolves all 9 worlds. SelfWorld also mounts inside Profile via the existing `SelfPanel → SelfWorldShell` path; the route version uses `BandStackScene`.

## Registry

`src/worlds/registry.ts` — single source of truth for the 9 worlds: self, habits, emotions, beliefs, memory, relationships, archetypes, creative, higher.

- `live`: self (band-stack), habits (ritual-orbits).
- `scaffold`: emotions, beliefs, memory, relationships, archetypes, creative, higher — render `ScaffoldScene` (named metaphor + AION role line, not a generic lock).

## Files

- `src/worlds/{types.ts, registry.ts}`
- `src/worlds/graph/{worldGraphTypes.ts, useWorldProjection.ts}`
- `src/worlds/data/useHabitsProjection.ts`
- `src/worlds/aion/useWorldAion.ts`
- `src/worlds/scene/{WorldShell.tsx, WorldStage.tsx, WorldComposer.tsx}`
- `src/worlds/scene/scenes/{BandStackScene, RitualOrbitsScene, ScaffoldScene}.tsx`
- `src/pages/WorldRoute.tsx` mounted at `/worlds/:worldId`.
- SelfWorld InnerSystemsBand sources from this registry; tapping a world navigates to `/worlds/:id`.

## Not built yet

- WebGL scenes per world (Habits ships as 2D motion). Scene contract supports upgrading any world independently.
- Backend node-kind tagging — projections are client-side adapters; later phases swap in typed graph queries without changing scenes.
- Composer verbs are display-only; piping into the AION composer comes later.
