# User Brain — Unified Living Graph

Merge Profile, Assessments, Onboarding, Pillars, DNA, habits, emotions, identity, missions, and journal insights into **one** evolving graph. The profile page becomes a navigable visualization of that graph, and AION can read/write/explain it conversationally.

Builds on Phase 1 already shipped (`pillar_confidence`, extended `aurora_memory_graph.node_type`, `aurora_contradictions`, memory-writer v2). Existing tables stay — they become **evidence feeders**, not separate UIs.

---

## 1. Data model: the Brain

### 1a. Extend `aurora_memory_graph` (the spine)

Add nullable, backwards-compatible columns:

- `layer` text — `surface | pattern | deep` (derived from node_type via mapping; stored for fast filtering)
- `confidence` int 0–100 (default 50)
- `emotional_charge` int -100..+100 (default 0)
- `last_evidence_at` timestamptz
- `evidence_count` int default 1
- `user_confirmed` bool default false
- `user_corrected_at` timestamptz
- `superseded_by` uuid → self (corrections form a chain; original kept for history)
- `content_key` text — lowercased+stemmed hash for dedupe

Indexes: `(user_id, layer)`, `(user_id, pillar)`, `(user_id, confidence DESC)`, unique `(user_id, type, content_key)`.

### 1b. New table `brain_evidence`

Every signal that produced or reinforced a node:

- `id`, `user_id`, `node_id` → `aurora_memory_graph(id)` ON DELETE CASCADE
- `source_kind` — `conversation | onboarding | assessment | journal | hypnosis | mission | habit | pulse | dna | manual`
- `source_ref` jsonb — `{ table, id, message_id?, span? }`
- `delta_confidence` int, `delta_strength` int
- `summary` text (≤200 chars)
- `created_at`

RLS: owner only. Unique `(node_id, source_kind, source_ref)` for idempotency.

### 1c. New table `brain_edges`

Typed relations (current graph stores nodes only):

- `from_node`, `to_node`, `relation` (`causes | contradicts | reinforces | avoids | derives_from | manifests_as | belongs_to_pillar`)
- `weight` int default 1, `last_seen_at`
- Unique `(from_node, to_node, relation)`. RLS: owner only.

### 1d. RPC `brain_upsert_node`

`(user_id, type, layer, pillar, content, source_kind, source_ref, delta_conf, delta_strength, emotional_charge)` →
- finds existing node by `(user_id, type, content_key)`
- updates confidence/strength with diminishing returns (cap +30/event, decay above 70)
- inserts a `brain_evidence` row (idempotent)
- returns `{ node_id, created, new_confidence, new_strength }`

### 1e. RPC `brain_get_overview`

Returns ready-to-render JSON: nodes (filtered by layer/pillar/min_confidence), edges, pillar confidences, top contradictions, recent changes (≤14d), unknown areas (pillars with conf<20 or signal_count<3).

---

## 2. Evidence feeders (everything writes to the graph)

Shared module `supabase/functions/_shared/brainWriter.ts`. Wire it in:

| Source | Trigger | What gets written |
|---|---|---|
| `aurora-chat` (memory-writer v2) | already wired | beliefs, values, goals, fears, contradictions |
| Onboarding answers | on save | `value`, `goal`, `wound` (`source_kind='onboarding'`) |
| Pillar assessments | on submission | nodes per answer + bumps `pillar_confidence` |
| Journal entries | DB trigger → edge fn | `emotion`, `identity`, `loop` |
| Hypnosis sessions | on complete | `desire`, `archetype`, ego-state strength |
| Action items / missions | on done/skip | `habit`, `avoidance`, `strength` |
| Daily pulse | on insert | emotional_charge updates on active goals |
| DNA profile recompute | on update | `identity` nodes with high baseline confidence |

Append-only — feeders don't own UI state. Existing tables/screens keep working.

---

## 3. AION conversational interface to the brain

Extend `aurora-chat/orchestrator.ts`:

- **Brain lane**: when user says "why do I…", "what changed", "what pattern", "show me my…", "correct this", load `brain_get_overview` slice and inject as `BRAIN_CONTEXT` (top 20 relevant nodes + edges + recent changes).
- New structured tool intents the model emits:
  - `brain.explain(node_id)` → fetch evidence list, narrate
  - `brain.correct(node_id, new_content?, mark_false?)` → writes correction node + sets `superseded_by`
  - `brain.confirm(node_id)` → `user_confirmed=true`, +20 confidence
  - `brain.probe(pillar)` → existing curiosity probe
- Diagnostics Section 8 (Inference) gains "Brain writes" subsection: nodes touched + evidence created this turn.

---

## 4. Brain View (new profile page)

Replace `ProfilePage.tsx` body (keep route `/profile`) with a **single-screen graph**, no tabs:

```text
┌──────────────────────────────────────────────┐
│  Header: name · level · "Understanding 62%"  │
├──────────────────────────────────────────────┤
│        [ force-directed graph canvas ]       │
│   nodes colored by layer, sized by strength  │
│   ring opacity = confidence                  │
├──────────────────────────────────────────────┤
│  Layer toggle: Surface · Pattern · Deep      │
│  Pillar filter chips · Search                │
│  Side panel (on node tap):                   │
│   - content, type, pillar, confidence bar    │
│   - evidence list (last 5)                   │
│   - edges (causes/contradicts/…)             │
│   - actions: [Talk to AION] [Confirm]        │
│              [Correct] [Mark not me]         │
└──────────────────────────────────────────────┘
```

Implementation — new folder `src/features/brain/`:

- `BrainView.tsx` — page body
- `BrainGraphCanvas.tsx` — d3-force or `react-force-graph-2d` (mobile pinch/zoom, tap node)
- `BrainNodePanel.tsx` — bottom-sheet on mobile (current viewport 402px), right rail on desktop
- `BrainFilters.tsx`
- `useBrainOverview.ts` — React Query around RPC, 30s stale
- `useBrainNode.ts` — node detail + evidence
- `brainActions.ts` — confirm/correct/talk handlers (last opens AION with `BRAIN_CONTEXT.focus_node_id`)

`ProfilePage.tsx` becomes: hero strip (avatar/orb/level) + `<BrainView />`. No tabs. `CharacterProfileModal.tsx` (752 lines) gated behind a "Classic view" link in overflow — not deleted.

### Layers → node_type mapping
- **Surface**: `goal`, `habit`, `mission`, `emotion`
- **Pattern**: `loop`, `avoidance`, `strength`, `behavioral_pattern`
- **Deep**: `belief`, `value`, `wound`, `identity`, `archetype`, `desire`, `contradiction`

### Visual rules (per Core memory)
- Color by layer via semantic tokens (`--brain-surface/-pattern/-deep` in `index.css`).
- Confidence < 30 → dashed ring ("unknown area").
- `user_confirmed` → solid check ring.
- Recently changed (≤7d) → subtle pulse.
- `rounded-2xl`, backdrop-blur, **no gradients/shadows**.

---

## 5. Migration & rollout

**Phase A — Schema** (one migration):
- Add columns to `aurora_memory_graph`
- Create `brain_evidence`, `brain_edges`
- Create `brain_upsert_node`, `brain_get_overview` RPCs
- Backfill `layer` from `node_type`, `evidence_count=1`, `last_evidence_at=created_at`, `content_key`

**Phase B — Writers**: ship `_shared/brainWriter.ts`; wire memory-writer v2, journal trigger, hypnosis-session trigger, action-item-done trigger, onboarding & pillar-assessment edge functions.

**Phase C — Brain View UI**: build `BrainView`, ship behind `/profile`. Add "Classic profile" fallback link.

**Phase D — Conversational brain**: extend orchestrator with brain lane + tool intents. Diagnostics for brain writes/reads.

Each phase is independently shippable; A is required before B/C/D.

---

## Out of scope
- Deleting `CharacterProfileModal`, onboarding wizards, or pillar assessment screens (kept as evidence sources)
- Time-travel / snapshot timeline (data model already supports it via evidence rows)
- Public/shared brain views, multi-user "compare brains"

## Risks & mitigations
- **Graph noise** → only `confidence ≥ 25` or `user_confirmed` render by default; "Show weak signals" toggle.
- **Duplicate nodes** → `content_key` enforces dedupe in `brain_upsert_node`.
- **Mobile perf** → cap initial render to top 80 nodes by `strength*confidence`; lazy-expand on pan.
- **Conflicting corrections** → store as new node + `superseded_by` chain instead of mutating; keeps history.

## Acceptance signals
- New user after 5 chat turns: Brain View shows ≥ 8 nodes across ≥ 2 layers + ≥ 1 edge.
- Tapping a node shows evidence trail with originating message/journal/session.
- "Why do you think I avoid X" returns explanation citing evidence.
- "Correct this — I don't actually believe X" marks the node and confidence drops below 20 within 1 turn.
- Pillar with `confidence<20` appears as a dashed "unknown area" cluster.
