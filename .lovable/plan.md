
# Phase 3: State-Space First — Graph as the Operating System

You are right. The hallway turned into a homepage of cards because we still have a "landing page" mental model. We need to delete that mental model entirely. There is no homepage. There is only **AION presence + a living graph + spatial lenses into it**.

## Guiding principles (locked)

1. **No homepages, ever.** No grid of cards, no dashboard, no "choose a section."
2. **State-space first.** The user enters into a *state* (presence with AION), not a page.
3. **Graph is the OS.** Every interaction (chat, journal, hypnosis, mission, scan) writes nodes/edges. The graph is the canonical truth; rooms and missions are *projections* of it.
4. **AION orchestrates.** The user almost never manually categorizes, updates stats, or fills dashboards. AION infers from conversation and writes to the graph.
5. **Rooms are lenses, not destinations.** A room is a filtered view of the graph + an ambience + an AION mode. It is not a feature container.

## The new shell (replaces /index, /dashboard, /hallway-as-grid)

```text
┌─────────────────────────────────────────────┐
│                                             │
│           AION orb (always present)         │
│         (emotional state = orb state)       │
│                                             │
│         [ ambient room name + tone ]        │
│                                             │
│   ╭───────────── chat dock ─────────────╮   │
│   │  speak / type to AION               │   │
│   ╰─────────────────────────────────────╯   │
│                                             │
│   swipe ←/→  : traverse rooms (lenses)      │
│   swipe ↑    : zoom into graph (3 layers)   │
│   swipe ↓    : surface artifacts (mission,  │
│                journal, hypnosis, scans)    │
│                                             │
└─────────────────────────────────────────────┘
```

No tab bar. No card grid. No "Open feature." Navigation is **gestural traversal of one continuous space**.

## Step-by-step plan

### 1. Delete the homepage mental model
- `/index` and `/dashboard` redirect to `/` which renders **PresenceShell** (orb + chat dock + ambient room context). No cards. No "rooms grid."
- Remove `HallwayShell.tsx` door grid. Replace with `PresenceShell` as the single shell.
- Rooms become *swipeable lenses* around presence, not a list you pick from.

### 2. Build the Graph as the actual data layer
New tables (migration):
- `graph_nodes` — `id, user_id, kind (belief|emotion|part|memory|identity|body_signal|mission|relationship|pattern|archetype), label, layer (surface|mid|deep), weight, valence, last_touched_at, metadata jsonb`
- `graph_edges` — `id, user_id, from_node, to_node, relation (causes|correlates|triggers|reinforces|conflicts|belongs_to), strength, last_touched_at`
- `graph_events` — append-only log of every write (source: chat turn id, journal id, hypnosis session id, mission id) for auditability and replay.

RLS: user can only read/write their own rows. All writes go through `MemoryWriter` (single edge function) — no direct client inserts.

### 3. MemoryWriter as the only graph mutator
One edge function `memory-writer` that:
- Accepts a structured "observation" (from `aurora-chat` post-processing, journal save, hypnosis end, mission complete, scan result).
- Uses an LLM pass to extract candidate nodes/edges with `layer`, `valence`, `weight` deltas.
- Upserts into `graph_nodes` / `graph_edges`, decays old weights, strengthens repeated patterns.
- Emits a realtime event so PresenceShell can react (orb state, room ambience, surfaced artifact).

### 4. Wire `aurora-chat` → MemoryWriter
- After every assistant turn (and every user turn worth interpreting), `aurora-chat` posts a sanitized observation to `memory-writer`.
- This is the moment "I feel drained" becomes: emotion node + vitality trend + sleep correlation candidate + mission suggestion. **The user did nothing but talk.**

### 5. Rooms become lens projections
Each room (`beliefs`, `emotions`, `parts`, `time`, `identity`, `body`) is now defined by:
- A **graph filter** (which `kind` + `layer` it surfaces)
- An **ambience** (already done)
- An **AION mode** (already done)
- A **default artifact slot** (e.g. body → hypnosis, time → timeline, identity → DNA)

Swiping left/right between rooms re-queries the graph with a different filter. Same data, different lens. No separate "feature pages."

### 6. Three-layer graph zoom (swipe up)
A single `GraphCanvas` component (Three.js / r3f) that renders the user's nodes:
- **Surface layer**: today's missions, active emotions, recent memories.
- **Mid layer**: weekly patterns, habits, emotional clusters.
- **Deep layer**: beliefs, identity nodes, archetypes, long-term memories.

Pinch / scroll = zoom between layers. Tap a node = AION speaks about it ("This belief about money has been thickening for 3 weeks…"). Long-press = inspect/edit.

This replaces every "stats page," "insights page," and "patterns page" we have.

### 7. Artifacts dock (swipe down)
A bottom sheet that surfaces *contextual* artifacts AION has prepared: today's mission, a hypnosis recommendation, a journal prompt, a scan result. Not a menu — a feed of what's *currently relevant* based on graph state.

### 8. Migrate, then delete
After the shell + graph + writer are live:
- Redirect `/play`, `/strategy`, `/work`, `/hub`, `/dashboard`, `/hallway` → `/`.
- Existing pillars/missions/journal/hypnosis remain as **artifacts** rendered inside PresenceShell or the artifacts dock — not as standalone pages.
- Quietly delete the legacy hub/dashboard files in a follow-up cleanup pass.

### What we are NOT touching
- DNA SSOT, identity model, AION naming gate
- Gamification economy, XP RPCs
- TTS cache, Web3Auth, subscription tiers
- Existing pillar logic (it stays — we just stop rendering it as a homepage)

### Risks / open questions
- **Performance**: 3-layer graph render on 402px mobile. Mitigation: r3f with instanced points, cap visible nodes per layer, LOD.
- **Cold start**: a brand-new user has an empty graph. Mitigation: AION's onboarding chat seeds initial nodes via MemoryWriter from the first 3–5 turns; presence shell shows "AION is listening" state until first nodes exist.
- **Discoverability**: gestural nav has no menu. Mitigation: first-run coach marks + AION verbally guiding ("swipe up to see your inner map").
- **Backwards links**: external links / SEO to `/dashboard` etc. Mitigation: redirects, not 404s.

## Decisions I need from you before building

1. **Order of attack**: do we build (a) PresenceShell + gesture nav first with rooms as lenses against *existing* data, then add graph tables; or (b) graph tables + MemoryWriter first, then shell? I recommend **(a)** — ship the felt experience fast, then deepen the substrate underneath.
2. **Graph render**: r3f 3D galaxy (immersive, heavier) vs. 2D force-directed canvas (faster, still alive). I recommend **2D force-directed for v1**, upgrade to 3D once node counts and perf are proven.
3. **Should `/index` immediately redirect to `/` PresenceShell this phase**, or keep `/index` alive one more iteration as a fallback while we migrate? I recommend **immediate redirect** — the homepage is the disease.

Answer those three and I'll start Phase 3 with PresenceShell + gesture nav + lens-based rooms.
