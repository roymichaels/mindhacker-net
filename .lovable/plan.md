# Brain MVP — make /brain useful now

Stop shell work. Use what's already there.

## What exists today

- Route `/brain` → `BrainPage` → `BrainView` + `BrainGraphCanvas` (2D SVG, layered rings, click → `BrainNodeSheet`). Already mounted, already styled.
- Tables: `aurora_memory_graph` (28 rows, full schema with layer/confidence/pillar/etc), `aurora_identity_elements` (223 rows), `aurora_behavioral_patterns` (0), `brain_edges` (0), `brain_evidence`, `pillar_confidence` (1 row), `aurora_conversation_memory` (2), `action_items` (127), `journal_entries` (0).
- RPC `brain_get_overview` already drives `BrainView`. RPC `brain_upsert_node` exists.
- Edge function `memory-writer` already runs after each chat turn (per `mem://architecture/brain-and-graph-foundation`).

The graph is sparse because **223 identity rows + 127 action_items + onboarding/assessment data never got written into `aurora_memory_graph`**. That's the whole problem.

## Plan

### 1. Backfill edge function — `brain-backfill` (new)

One endpoint, idempotent, safe to rerun. Reads the user's existing data and upserts into `aurora_memory_graph` via `brain_upsert_node` (or direct upsert keyed on `content_key`).

Sources mapped to graph node types:

| Source table | node_type | layer | pillar | confidence seed |
|---|---|---|---|---|
| `aurora_identity_elements` (element_type=identity/value/belief) | `identity` / `value` / `belief` | deep | from metadata.pillar | 70 |
| `aurora_identity_elements` (element_type=goal) | `goal` | pattern | metadata.pillar | 60 |
| `aurora_behavioral_patterns` | `pattern` | pattern | from row | 60 |
| `action_items` (active/recurring) | `habit` | surface | row.pillar | 40–70 by completion ratio |
| `journal_entries` (when seeded) | `memory` | surface | inferred | 35 |
| `pillar_confidence` rows | `pillar_marker` | pattern | the pillar | row.confidence |
| `profiles` core fields (name, job, focus) | `identity` | deep | null | 90 |
| Onboarding answers (existing flow_state / assessment tables) | `belief`/`goal` per answer | pattern | mapped pillar | 55 |

Dedupe: `content_key = lower(trim(content))[0..120]` already in schema → upsert by `(user_id, content_key)`. Bump `reference_count`, `last_evidence_at`, write a `brain_evidence` row with the source.

Returns `{ inserted, updated, skipped, by_source: {...} }`.

### 2. UI additions to `BrainView`

Keep the existing graph. Add a structured panel above/below it so the page is never empty:

```text
[ Build my brain ]  ← button, calls brain-backfill, shows progress toast
─────────────────────────────────────────
What AION knows about me
  • Identity     (chips from node_type=identity, deep layer)
  • Beliefs      (node_type=belief)
  • Goals        (node_type=goal)
  • Habits       (node_type=habit, from action_items)
  • Patterns     (node_type=pattern)
  • Emotions     (top emotional_charge nodes + aurora_energy_patterns)
  • Contradictions (from brain_get_overview.contradictions)
  • Recent memories (overview.recent)
  • Pillar confidence (bars from pillar_confidence + overview.pillars)
─────────────────────────────────────────
[ existing 2D graph canvas + filters ]
```

All sections read from the same `useBrainOverview` data — no extra queries needed except `pillar_confidence` and `aurora_energy_patterns` (one small hook each). Click any chip → opens existing `BrainNodeSheet`.

### 3. "Build my brain" button

- Button in `BrainView` header.
- Calls `supabase.functions.invoke('brain-backfill')`.
- Streams/polls progress (simple: show counts returned, `react-query` invalidate `brain-overview`).
- Disabled while running. Re-enabled after, safe to rerun.
- First-load empty state shows the button prominently with copy: "Pull your identity, goals, habits and history into the graph."

### 4. Memory-writer (already wired)

No code change required — `useAuroraChat` already invokes `memory-writer` after each assistant turn. Just confirm `BrainView` invalidates `brain-overview` query when the user returns to `/brain` (set `staleTime: 0` on focus, or invalidate on a `memory-graph-updated` event already emitted? if not present, simply rely on existing 30s staleTime + manual refresh button).

Add a small "Refresh" icon next to "Build my brain".

### 5. Out of scope (explicit)

- No shell/overlay changes.
- No new homepage.
- No 3D, no force-directed lib.
- No design system overhaul.
- No new tables — `brain_edges` and `aurora_behavioral_patterns` stay empty until memory-writer fills them.

## Acceptance

- `/brain` shows non-empty sections for any user with onboarding/identity/action_items.
- "Build my brain" pulls 223 identity + 127 action_items into graph nodes (deduped).
- Graph canvas renders dozens of nodes; click → detail sheet.
- New chat turn → next `/brain` visit shows the new node.
- Zero shell/route changes.

## Files

- **new** `supabase/functions/brain-backfill/index.ts` — JWT-validated, reads user tables, upserts via `brain_upsert_node`, writes `brain_evidence`.
- **edit** `src/features/brain/BrainView.tsx` — add structured sections + Build/Refresh buttons.
- **new** `src/features/brain/BrainSections.tsx` — pure presentation, reads from overview.
- **new** `src/features/brain/useBackfill.ts` — mutation hook wrapping the edge function.
- **new** `src/features/brain/usePillarConfidence.ts` — small read hook.

No migrations needed (schema already supports everything).
