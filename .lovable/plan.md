## Brain data audit: current state

### What `/brain` currently reads from
**Files / hooks**
- `src/pages/BrainPage.tsx` — mounts `BrainView` inside ShellV2
- `src/features/brain/BrainView.tsx` — drives the page state and empty state
- `src/features/brain/useBrainOverview.ts` — calls the backend overview RPC
- `src/features/brain/BrainGraphCanvas.tsx` — renders graph from `nodes` + `edges`
- `src/features/brain/BrainSections.tsx` — renders grouped node sections from `overview.nodes`
- `src/features/brain/BrainNodeSheet.tsx` — reads node evidence from `brain_evidence`

**Actual data path today**
- `/brain` does **not** read old tables directly
- It reads only `supabase.rpc("brain_get_overview")`
- `brain_get_overview` returns:
  - `aurora_memory_graph` → nodes
  - `brain_edges` → edges
  - `pillar_confidence` → pillar stats
  - `aurora_contradictions` → contradictions if present
- It does **not** directly read:
  - `profiles`
  - `aurora_identity_elements`
  - `aurora_behavioral_patterns`
  - `journal_entries`
  - `action_items`
  - onboarding tables
  - assessments tables
  - presence tables
  - life plan tables

### What “Build my brain” currently does
**Button handler chain**
- `src/features/brain/BrainView.tsx` → `backfill.mutate()`
- `src/features/brain/useBackfill.ts` → `supabase.functions.invoke("brain-backfill", { body: {} })`
- `supabase/functions/brain-backfill/index.ts` → reads legacy tables and calls `brain_upsert_node`

**Payload sent**
- `{}`

**User identity used**
- Edge function reads the caller JWT and resolves `userId` via `supabase.auth.getUser()`

**Tables read today by backfill**
- `profiles`
- `aurora_identity_elements`
- `action_items`
- `aurora_behavioral_patterns`
- `pillar_confidence`
- `journal_entries`

**Tables written today by backfill**
- `aurora_memory_graph` via `brain_upsert_node`
- `brain_evidence` via `brain_upsert_node`
- It does **not** write `brain_edges`

**Errors / swallowing**
- Row-level failures inside `brain-backfill` are swallowed into `skipped++`
- UI shows success toast even when everything is skipped
- No per-source error details are surfaced to the page

### Tables checked in this audit
**Graph / brain tables**
- `aurora_memory_graph`
- `brain_edges`
- `brain_evidence`

**Legacy source tables checked**
- `profiles`
- `aurora_identity_elements`
- `aurora_behavioral_patterns`
- `pillar_confidence`
- `journal_entries`
- `action_items`
- `aurora_onboarding_progress`
- `aurora_conversation_memory`
- `life_plans`
- `life_plan_milestones`
- `presence_scans`
- `presence_scan_events`

**Assessment tables checked**
- `domain_assessments` — does not exist
- `user_domain_assessments` — does not exist

### Live findings from the current user data
- `profiles`: 1 row
- `aurora_identity_elements`: 14 rows
- `aurora_behavioral_patterns`: 0 rows
- `pillar_confidence`: 1 row
- `journal_entries`: 0 rows
- `action_items`: 79 rows
- `aurora_memory_graph`: 28 rows already exist
- `brain_edges`: 0 rows
- `aurora_onboarding_progress`: 1 row
- `aurora_conversation_memory`: 0 rows
- `life_plans`: 50 rows
- `life_plan_milestones`: 432 rows
- `presence_scans`: 6 rows
- `presence_scan_events`: 6 rows

## Why `/brain` is empty
There are **two real bugs**, not one:

1. **Overview RPC is broken**
- Network logs show `brain_get_overview` returns `400`
- Exact error: `column "pillar" does not exist`
- Cause: the RPC queries `pillar_confidence.pillar`, but the real column is `pillar_id`
- Result: `useBrainOverview` gets an error, `data` stays undefined, and `BrainView` falls into the empty state instead of showing an error

2. **Backfill is silently skipping almost everything**
- Live function response: `inserted: 0, updated: 0, skipped: 96`
- Main cause is schema mismatch between what the function writes and what the DB currently allows:
  - `brain-backfill` emits node types like `memory` and `pillar_marker`
  - current `aurora_memory_graph` constraint does **not** allow those node types
  - `brain-backfill` emits evidence `source_kind` values like `profile`, `identity_element`, `action_item`, `behavioral_pattern`, `pillar_confidence`, `journal_entry`
  - current `brain_evidence` constraint does **not** allow those source kinds
- Result: the function returns 200, but the useful writes are skipped and the reasons are hidden

## Fix plan

### 1) Repair the broken overview RPC
**Database migration**
- Update `brain_get_overview` to use `pillar_confidence.pillar_id` instead of `pillar`
- Keep the function tolerant of missing optional tables
- Return valid JSON even when some optional sources are absent

**Why**
- This unblocks `/brain` immediately because the page currently depends on this RPC for all rendering

### 2) Repair the backfill write path
**Database migration**
- Extend `aurora_memory_graph` allowed node types to include the types the UI/backfill already uses:
  - `memory`
  - `pillar_marker`
- Extend `brain_evidence.source_kind` allowed values to match emitted source labels, or normalize the function to a safe allowed set

**Edge function changes**
- Update `supabase/functions/brain-backfill/index.ts` so it:
  - logs each source being processed
  - returns per-source totals and per-source errors
  - does not report success as if the job worked when all writes failed
  - keeps idempotent upserts

### 3) Add the missing legacy sources to backfill
**Prefer B, as requested**
Extend `brain-backfill` to read and merge from existing data that currently is ignored:
- `aurora_onboarding_progress`
- `life_plans`
- `life_plan_milestones`
- `presence_scans`
- `presence_scan_events`
- `aurora_conversation_memory`
- plus the already-read sources:
  - `profiles`
  - `aurora_identity_elements`
  - `aurora_behavioral_patterns`
  - `journal_entries`
  - `action_items`
  - `pillar_confidence`

**Note**
- The assessment tables the request named are not currently present under those names, so the fix will use the real available legacy sources instead of assuming nonexistent tables

### 4) Add fallback so `/brain` is never empty when legacy data exists
**Frontend fallback**
- If `brain_get_overview` errors or returns zero nodes, query the old sources directly and synthesize a minimal `BrainOverview` client-side
- Minimum fallback coverage:
  - `profiles`
  - `aurora_identity_elements`
  - `action_items`
  - `journal_entries`
  - onboarding / life-plan / presence data when available
- This is a safety net only; canonical path remains graph-backed

### 5) Make errors visible instead of silent
**Frontend**
- Show overview RPC error state instead of empty-state copy when the backend returns a failure
- Show backfill result details when `skipped > 0` or `inserted + updated === 0`

**Backend**
- Include concrete skip reasons in `brain-backfill` response
- Add source counts to logs and response body

## Exact files to change
- `supabase/functions/brain-backfill/index.ts`
- `src/features/brain/useBackfill.ts`
- `src/features/brain/useBrainOverview.ts`
- `src/features/brain/BrainView.tsx`
- new migration file to fix:
  - `brain_get_overview`
  - `aurora_memory_graph` node-type constraint
  - `brain_evidence` source-kind constraint
- optional new fallback hook if needed:
  - `src/features/brain/useBrainFallback.ts`

## Expected result after implementation
- Clicking **Build my brain** reads real legacy data and writes/merges it into the graph tables
- `/brain` no longer goes empty when old data exists
- At minimum, profile / onboarding / action items / existing identity data appear
- `graph node count > 0`
- Logs and response show what sources were read and how many nodes were created or skipped
- Errors are visible instead of swallowed

## Acceptance mapping
- **Build click works** — fixed via repaired backfill + surfaced results
- **Profile/onboarding/journal/action_items data appears** — fixed via expanded backfill + fallback
- **Node count > 0** — fixed via repaired overview RPC and real writes
- **Not empty if old data exists** — fixed via fallback path
- **Logs show sources and counts** — fixed in edge function response/logging
- **Errors visible** — fixed in both UI and edge function