---
name: Hallway World-First Architecture
description: Phase 1 commitment — hallway/rooms replace tab-bar/dashboard mental model
type: feature
---
**Decision (Phase 1):** Tab bar does NOT survive. MindOS is a navigable consciousness architecture, not a feature-first app.

**Foundation (`src/hallway/`):**
- `types.ts` — RoomDefinition, RoomAionMode, RoomAmbience.
- `rooms.ts` — canonical 6-room registry: beliefs, emotions, parts, time, identity, body. Pure config; do NOT add a top-level Route per room.
- `HallwayShell.tsx` — door grid at `/hallway`. Rooms are states of consciousness, not screens.
- `RoomEnvironment.tsx` — room interior at `/hallway/:slug`. Reads room from registry, applies ambience, renders entry whisper, lists `surfaces` (stubs in Phase 1; real wiring in Phase 2).

**Rules:**
- Adding a room: extend `RoomId` in `types.ts` + append to `ROOM_REGISTRY`. Never add a sibling `<Route>` for a room.
- Rooms do not mount their own orb. Persistent AION presence is the root `SharedOrbStage` + `AIONPresenceButton` in the shell.
- Surfaces are room-internal sub-views, NOT routes — resolved by an upcoming surface registry.
- Ambience uses raw HSL room-local signals (deliberate); the rest of the app keeps semantic tokens.

**Phase ordering:** 1=chat-merge ✅ → 2=orb-unify (deprecation banners landed; full migration of legacy renderers pending) ✅ scaffolded → 3=room-registry ✅ → 4=hallway-shell ✅ → 5=graph meta overlay (later — depends on rooms + memory writer).
