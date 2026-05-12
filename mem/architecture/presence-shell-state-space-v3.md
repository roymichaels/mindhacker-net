---
name: Presence Shell State Space v3
description: Phase 3 — `/` is state-space (PresenceShell), not a homepage. Rooms are swipeable lenses, not pages. Graph is the OS.
type: feature
---
# Presence Shell — State-Space Root (Phase 3.1)

**The homepage is dead.** For authenticated users, `/` renders `src/presence/PresenceShell.tsx` — an ambient state-space, not a card grid. Unauthenticated visitors still see the public marketing `Index`.

## Locked rules
- **No homepage.** Never reintroduce a card grid, dashboard hub, or "choose a section" landing for authed users.
- **Rooms are lenses.** The 6 rooms (`beliefs`, `emotions`, `parts`, `time`, `identity`, `body`) are swipeable ambient states inside PresenceShell — not destinations. Do NOT add `<Route path="/hallway/*">` back.
- **Graph is the OS.** All meaningful state lives in `graph_nodes` / `graph_edges` (Phase 3.2+) and is mutated only via the `memory-writer` edge function. UI never inserts directly.
- **Gestures**: ←/→ rooms, ↑ Graph drawer, ↓ Artifacts drawer. Keyboard arrows mirror this.
- **AION presence is global.** The orb (`SharedOrbStage`) and `InteractiveAIONHost` mount at the app root. PresenceShell never re-mounts them.
- **Redirects**: `/index`, `/home`, `/dashboard`, `/hallway`, `/hallway/:slug` → `/`.

## What lives where
- `src/presence/SmartRoot.tsx` — gates `/` between Index and PresenceShell.
- `src/presence/PresenceShell.tsx` — ambient room state + gesture nav + drawers.
- `src/presence/GraphCanvas.tsx` — placeholder for the 3-layer subconscious atlas.
- `src/presence/ArtifactsDock.tsx` — contextual feed of orchestrator-prepared artifacts.
- `src/hallway/rooms.ts` — room registry (still SSOT for room ambience/AION mode).

## Out of scope for 3.1
- `graph_nodes` / `graph_edges` tables and `memory-writer` edge function (Phase 3.2–3.4).
- Force-directed canvas render (Phase 3.6, 2D first then r3f).
- Wiring legacy pillar pages as artifacts inside PresenceShell (Phase 3.7).