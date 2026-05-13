# Brain → Consciousness Map (architecture proposal)

Reframes `/brain` from a single force-graph into a **two-level navigable map**: a global atlas of rooms, each containing its own internal graph. AION continuously writes into one canonical graph table; the UI just slices it.

The good news: ~80% of the data plumbing is already in place. We don't add a parallel system — we **finish wiring the one we have**.

---

## 1. Conceptual model

```text
                 ┌────────────────────────────────────────────┐
                 │   GLOBAL CONSCIOUSNESS MAP   (atlas view)  │
                 │  rooms = clusters · cross-room edges       │
                 │  unknown areas = fog                       │
                 └──────────────┬─────────────────────────────┘
                                │ click cluster
                                ▼
                 ┌────────────────────────────────────────────┐
                 │   ROOM VIEW   (one consciousness system)   │
                 │  internal force graph of nodes + edges     │
                 │  AION whisper · suggestions · gaps         │
                 └──────────────┬─────────────────────────────┘
                                │ click node
                                ▼
                 ┌────────────────────────────────────────────┐
                 │   NODE DETAIL SHEET                         │
                 │  what AION knows · evidence · sources       │
                 │  confidence · related · contradictions      │
                 │  user actions: confirm / correct / explore  │
                 └────────────────────────────────────────────┘
```

Three views, **one underlying graph**.

---

## 2. Rooms (8)

The hallway already defines 6 rooms. We extend `RoomId` and the registry to 8:

| Room | Already exists | Needs adding |
|---|---|---|
| beliefs · emotions · parts · time · identity · body | yes (`src/hallway/rooms.ts`) | — |
| **dreams** (Dreams / Symbols) | no | new room def |
| **beyond** (Beyond / Higher Self) | no | new room def |

Each room declaration drives ambience + AION mode + which `aurora_memory_graph.room` value it owns. No new route — rooms reachable both at `/hallway/:slug` (immersive) **and** as a layer inside `/brain` (atlas drill-down).

---

## 3. Data model — reuse what exists

We keep one canonical node table and one edge table. No new graph storage.

### Existing (keep, finish populating)
- `aurora_memory_graph` — 405 rows, the node SSOT. Already has `node_type`, `content`, `pillar`, `room`, `layer`, `confidence`, `strength`, `emotional_charge`, `reference_count`, `related_node_ids`, `user_confirmed`, `metadata`. The `room` column is currently NULL on every row → backfill required.
- `brain_edges` — 0 rows, relations enum: `causes · contradicts · reinforces · avoids · derives_from · manifests_as · belongs_to_pillar`. We extend the enum to add: `triggers · blocks · heals · belongs_to_room · evolved_from · originated_from`.
- `brain_evidence` — already tracks `source_kind`, `source_ref`, `delta_confidence`, `delta_strength`, `summary`. This is our provenance log.
- `pillar_confidence` (740 rows) — drives per-pillar coverage rings on the atlas.
- `aurora_contradictions`, `aurora_identity_elements` (247), `aurora_behavioral_patterns`, `aurora_life_visions`, `aurora_life_direction` — feeders.

### New columns / migrations
1. `aurora_memory_graph.room text` → already exists, just backfill + add CHECK against the 8 room ids; index `(user_id, room)`.
2. Extend `brain_edges_relation_check` to include the 6 new relation types above.
3. `aurora_memory_graph.coverage numeric` (0–1, derived) — per-room visualization weight.
4. (Optional) `brain_room_state` view: per-user, per-room aggregates: node_count, avg_confidence, last_evidence_at, gaps[], contradictions[]. Used by atlas tiles.

### Node-type → room mapping (canonical)
| node_type | room |
|---|---|
| belief, value | beliefs |
| pattern, blocker (emotional), insight (emotional) | emotions |
| identity, role | identity |
| pillar_marker | (cross-room, no single home) |
| habit, goal | identity (default) — refined by pillar |
| desire, strength | identity |
| memory (new) | time |
| symbol, dream (new) | dreams |
| transcendent (new) | beyond |
| somatic (new) | body |

(All "new" types are `aurora_memory_graph.node_type` values our writers already emit-or-can-emit; no schema change.)

---

## 4. Route structure

Keep one route, add view state via search params (no extra page reloads):

```text
/brain                          → atlas view (default)
/brain?view=room&room=beliefs   → room view
/brain?node=<uuid>              → opens node detail sheet over current view
/brain?view=unknown             → fog / "still exploring" inventory
/hallway/:slug                  → immersive room (existing — links into /brain?room=)
```

Deep-linking, back-button, and shareability come for free.

---

## 5. Component architecture

```text
src/features/brain/
├── BrainPage.tsx                    (existing — becomes shell with view switcher)
├── BrainErrorBoundary.tsx           (existing)
│
├── atlas/
│   ├── ConsciousnessAtlas.tsx       NEW — global zoomable map
│   ├── RoomCluster.tsx              NEW — one room as a cluster node
│   ├── CrossRoomEdges.tsx           NEW — edges between rooms
│   ├── FogLayer.tsx                 NEW — unknown / low-coverage zones
│   └── AtlasLegend.tsx              NEW — confidence + coverage legend
│
├── room/
│   ├── RoomView.tsx                 NEW — single-room internal graph
│   ├── RoomHeader.tsx               NEW — title, AION whisper, room-level CTAs
│   ├── RoomGraph.tsx                NEW — force layout (reuses useForceLayout)
│   ├── RoomGapsPanel.tsx            NEW — "AION is still exploring…"
│   └── RoomSuggestionsPanel.tsx     NEW — "ask me about X", "explore Y"
│
├── node/
│   ├── BrainNodeSheet.tsx           (existing — extend)
│   ├── NodeEvidenceList.tsx         NEW — sourced from brain_evidence
│   ├── NodeRelations.tsx            NEW — graph of neighbors
│   └── NodeContradictions.tsx       NEW — paired contradictions
│
├── data/
│   ├── useBrainAtlas.ts             NEW — calls brain_get_atlas RPC
│   ├── useBrainRoom.ts              NEW — calls brain_get_room RPC
│   ├── useBrainNode.ts              NEW — single node + evidence + neighbors
│   ├── useBrainOverview.ts          (existing — keep for legacy fallback)
│   └── useAionSuggestions.ts        NEW — proactive prompts per room
│
├── lib/
│   ├── nodeToRoom.ts                NEW — deterministic mapping rules
│   ├── coverage.ts                  NEW — gap + confidence calc
│   └── brainNodeStyle.ts            (existing)
│
└── types.ts                         (existing — extend)
```

Atlas and Room both reuse the existing `useForceLayout` hook with different inputs (rooms-as-nodes vs. nodes-in-room). Sheet reuses what's there.

---

## 6. Server-side: RPCs and edge functions

### New RPCs (Postgres functions, security definer with `auth.uid()` check)
- `brain_get_atlas(p_user_id uuid)` → returns `{ rooms: [{ id, slug, node_count, avg_confidence, coverage, gaps_count, contradictions_count, last_evidence_at }], cross_edges: [{ from_room, to_room, weight }] }`. One round-trip for the atlas view.
- `brain_get_room(p_user_id uuid, p_room text)` → returns `{ nodes, edges, gaps, suggestions, room_meta }` scoped to one room.
- `brain_get_node(p_user_id uuid, p_node_id uuid)` → node + 8 most-recent evidence rows + first-degree neighbors + contradictions involving it.
- Existing `brain_get_overview` stays as a fallback for legacy callers.

### Edge functions
- **`brain-backfill`** (exists) — extend to:
  1. Set `room` on every node where currently NULL using the node-type mapping table above + pillar hint.
  2. Import legacy data into `aurora_memory_graph` if not already represented:
     - `aurora_identity_elements` → `identity` room
     - `aurora_behavioral_patterns` → `emotions` (if energy-tagged) else `identity`
     - `aurora_life_visions`, `aurora_life_direction` → cross-room (`identity` + `time`)
     - Pillar assessment results (legacy `pillar_*_results` tables) → `pillar_marker` nodes with strong belongs_to_pillar edges
     - `journal_entries` → not nodes themselves, but emit evidence rows for the nodes they touched (link via `source_ref`)
     - `life_plans`, `action_items` → emit `manifests_as` edges from goal/value nodes to plan/action ids (plan/action stays in its own table; edge points across)
  3. Generate `brain_edges` for `related_node_ids` arrays already on existing nodes (one-time densification).

- **`aion-brain`** (exists) — extend to **continuously write** during every chat turn:
  1. After each user/assistant turn, call an extractor that emits zero or more `{ node_upsert, edge_upsert, evidence }` triples.
  2. Use `brain_upsert_node` (exists) for nodes; insert into `brain_edges` with `last_seen_at = now()`; insert into `brain_evidence` with `source_kind='aurora_chat'` and `source_ref` = conversation/message id.
  3. Recompute `confidence` via a small server-side rule: `min(100, confidence + delta_confidence)`; decay nodes not seen in 30/60/90 days.
  4. Detect contradictions: when an upserted node carries opposite polarity to a neighbor in the same room, write to `aurora_contradictions` and emit a `contradicts` edge.
  5. Detect gaps: nodes with `confidence < 30` and `reference_count < 2` become room-level "AION is still exploring" candidates.

- **Other writers we must hook the same way** so the brain is fed from everywhere:
  - `aurora-capture-journal` → already running on journals; add evidence emission.
  - `onboarding-chat`, `plan-chat`, `work-chat` → wrap their LLM call result with the same extractor.
  - `aurora-recalibrate` → on pillar assessment completion, write/refresh `pillar_marker` nodes + edges.
  - Hypnosis sessions and mission completions → `evidence` rows tied to identity/belief nodes.

This is the "constantly updates from conversation, journals, assessments, missions, habits, hypnosis, profile, history" requirement — implemented as **one extractor, called from every writer**, all writing to one graph.

---

## 7. How global atlas connects to room graphs

- The atlas RPC returns rooms as super-nodes with their own (x, y) seeded by a stable ambience-hue layout (so beliefs is always top-left, body always bottom, etc.).
- `cross_edges` between rooms are computed from `brain_edges` whose `from_node.room ≠ to_node.room` — aggregated and weighted by edge count.
- Clicking a cluster pushes `?view=room&room=beliefs` into URL state. The atlas SVG transitions (zoom-in animation), then `RoomView` mounts and fetches `brain_get_room`.
- Cross-room edges remain visible at the room edge as faded "tendrils" labeled with the other room's name — so the user always sees the room's foreign relations.

---

## 8. Importing legacy data (one-time + ongoing)

Done by `brain-backfill` with idempotent UPSERT semantics:

| Source | Becomes |
|---|---|
| `aurora_identity_elements` | identity nodes (`node_type=identity`, `room=identity`) |
| `aurora_behavioral_patterns` | pattern nodes (`room=emotions` if energy-tagged else `identity`) |
| `aurora_life_visions` | goal nodes with `belongs_to_pillar` edges |
| `aurora_life_direction` | identity nodes + `derives_from` edges to values |
| Pillar assessment legacy tables | `pillar_marker` nodes, one per pillar, with confidence = pillar_confidence.confidence_score |
| `journal_entries` | brain_evidence rows referencing nodes mentioned in the entry |
| `life_plans`, `action_items` | not duplicated as nodes; instead `manifests_as` edges from existing goal/value nodes |
| Onboarding answers (in `aurora_onboarding_progress`) | belief/value/identity nodes with `source_kind='onboarding'` |
| `profiles` / DNA | one identity super-node per user with edges to every other identity node |

Idempotency via `aurora_memory_graph.content_key` (already in schema) — re-running the backfill never duplicates.

---

## 9. AION's continuous loop

```text
chat turn / journal save / mission complete / hypnosis end
        │
        ▼
extractor (LLM, called by aion-brain)
        │
        ├── nodes:    brain_upsert_node     (insert or strengthen)
        ├── edges:    brain_edges insert    (with last_seen_at)
        ├── evidence: brain_evidence insert (always — full audit trail)
        ├── decay:    nightly cron lowers confidence on stale nodes
        ├── contradiction detector → aurora_contradictions + contradicts edge
        └── gap detector → publishes "ask me about X" suggestions

UI subscribes to brain_get_atlas (refetch on focus + after chat turn finishes)
```

Realtime: enable Postgres realtime on `aurora_memory_graph` and `brain_edges` so the open atlas/room view animates new nodes the moment AION writes them.

---

## 10. UX rules (not decorative)

- Atlas: **dark canvas + thin neural lines**, room clusters are rings whose stroke = avg confidence, fill opacity = coverage. No drop-shadows, no gradients (per design memory).
- Room view: Obsidian-style force graph; node radius = `sqrt(reference_count)`, color = node_type, halo = confidence.
- Fog: literal alpha mask over zones with no/low data. Tap fog → "AION hasn't explored this — start a conversation about it" (deep-links to AION chat with a seeded prompt).
- Suggestions are **inline chips on the room header**, not a separate page.
- Mobile-first (the user is on 402px now): atlas pinch-zoom, room view falls back to a vertical "constellation list" under 480px width with a "force-graph" toggle.

---

## 11. What this plan does **not** do

- Doesn't drop `BrainView` / `BrainGraphForce` — they become the engine the new RoomView uses.
- Doesn't introduce a new graph DB or library. We stay on Postgres + the existing custom force layout.
- Doesn't move existing routes. `/brain` stays; new views are URL params.
- Doesn't ship anything yet — this is architecture only, pending your approval.

---

## 12. Implementation order (when approved)

1. **Migration** — extend edge relation enum, add atlas/room RPCs, add room CHECK + index.
2. **Backfill** — run the extended `brain-backfill` to populate `room` on 405 existing nodes and import legacy tables.
3. **Atlas view** — `ConsciousnessAtlas` + `useBrainAtlas` wired to the new RPC.
4. **Room view** — refactor existing graph into `RoomView` with header, gaps, suggestions.
5. **Node sheet upgrade** — evidence list, neighbors, contradictions.
6. **Continuous writer** — extractor utility + hook it into `aion-brain`, `aurora-capture-journal`, `plan-chat`, `work-chat`, `onboarding-chat`, `aurora-recalibrate`.
7. **Realtime + decay cron**.
8. **Add `dreams` and `beyond` rooms** to `rooms.ts` registry.

Each step is independently shippable.

---

Tell me which parts to refine before I start, or say "go" and I'll execute step 1.