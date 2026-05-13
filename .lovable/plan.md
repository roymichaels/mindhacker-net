## Goal

ShellV2 is the only authenticated shell for `/`, `/aurora`, `/brain`, `/outer-world`. Brain backfill already reads from every required source — surface its counts as a debug panel and prove it. No new features, no visual redesign.

## Current state (audited)

| Route | Active shell today | Status |
|---|---|---|
| `/` | `SmartRoot` → `ShellV2` (when `ff_shell_v2 != '0'`) | ✅ already ShellV2 by default |
| `/aurora` | `ProtectedAppShellV2` → `ShellV2` | ✅ |
| `/brain` | `BrainPage` → inline `ShellV2` | ✅ |
| `/outer-world` | Mounted under legacy `ProtectedAppShell` (`DashboardLayout` + `HubModalHost` + `MindOSSheet`) | ❌ leaks legacy chrome |

Brain backfill (`supabase/functions/brain-backfill/index.ts`) already queries: profiles, aurora_identity_elements, action_items, aurora_behavioral_patterns, pillar_confidence, journal_entries, aurora_onboarding_progress, launchpad_progress, launchpad_summaries, life_plans, presence_scans, life_domains, questionnaire_completions, orb_profiles, avatar_customizations, life_plan_milestones. Returns `source_counts` + `detailed_source_counts` + `errors`. **No backend changes required.**

## Changes

### 1. Move `/outer-world` onto ShellV2

- In `src/App.tsx`: lift `<Route path="/outer-world" element={<OuterWorldHub />} />` out of the `<ProtectedAppShell>` block and into the existing `<Route element={<ProtectedAppShellV2 />}>` block (next to `/aurora`).
- Remove no-op `aurora:onboarding` triggers if any leak from OuterWorldHub (verified clean — pure tile grid, only `navigate(to)` calls).
- `OuterWorldHub` already uses `ShellHeader`, no internal redesign.

### 2. Force ShellV2 default at `/`

- In `src/lib/clientFlags.ts`: keep `useShellV2Enabled` default-true (already true). No-op confirm.
- `SmartRoot` already routes authed users to `<ShellV2 />` directly; the legacy `Navigate to="/aurora"` fallback only fires if a user manually flipped `ff_shell_v2=0`. Leave as escape hatch.

### 3. Brain debug panel (dev-only output)

Add a collapsed `<details>` block inside `BrainView.tsx` that renders the latest `useBackfillBrain` mutation result. It already returns `source_counts`, `detailed_source_counts`, `totals { inserted, updated, skipped }`, `by_source`, and `errors`. Render as:

```
Sources found: 12
Rows read per source: profiles 1 · journals 47 · action_items 23 · …
Nodes created (inserted): 38
Reinforced (updated): 12
Skipped duplicates: 9
Errors: journals: row 7 invalid jsonb
```

- New file: `src/features/brain/BrainBackfillDebug.tsx` — pure presentation, takes `result` prop.
- `BrainView.tsx` shows it under the CTA after a successful backfill (also in empty state once `backfill.data` exists).
- No new mutations, no new hooks. Reads `backfill.data` from existing `useBackfillBrain()`.

### 4. Acceptance audit output

After the edits, run a shell read-only audit and print the proof table the user requested:

- Route → active shell (grep imports per route file)
- ShellV2MountDebug already exists (`src/shellv2/dev/ShellV2MountDebug.tsx`) — it logs mounted composer / overlay roots; quote its current console output mechanism.
- Brain source counts → call `useBackfillBrain` once via the UI manually (user-driven), or query DB row counts via `psql` for: `aurora_memory_graph`, `aurora_identity_elements`, `journal_entries`, `action_items`, `life_plans`, `aurora_onboarding_progress`, `launchpad_progress` for the active user.
- Legacy components still active: list grep results for `MindOSSheet`, `HubModalHost`, `DashboardLayout` references that still render — confirm all live mounts are now isolated to non-core routes (Coaches, FM, Strategy, Learn, etc. still use legacy until later phases).

## Out of scope (per consolidation contract)

- No migration of remaining legacy routes (`/coaches`, `/fm`, `/strategy/*`, etc.) — those keep `ProtectedAppShell` for now and are addressed in a later consolidation pass.
- No visual polish, no new artifacts, no new tools, no DB migrations, no edge function changes.
- No deletion of `MindOSSheet` / `HubModalHost` / `DashboardLayout` — they remain mounted only on legacy routes that still depend on them.

## Files touched

1. `src/App.tsx` — move `/outer-world` route block.
2. `src/features/brain/BrainBackfillDebug.tsx` — new, ~40 lines.
3. `src/features/brain/BrainView.tsx` — render `<BrainBackfillDebug result={backfill.data} />`.

## Acceptance deliverable (printed at end of build step)

A markdown table:

```
Route          | Shell                 | Legacy chrome leak
/              | ShellV2 (SmartRoot)   | none
/aurora        | ShellV2 (AppShellV2)  | none
/brain         | ShellV2 (inline)      | none
/outer-world   | ShellV2 (AppShellV2)  | none
```

Plus brain backfill counts (post-run), mounted composer count (1, from `ComposerLayer`), overlay roots (`OverlayLayer` + `UnifiedOverlayHost`), and a list of legacy components still mounted on non-core routes.
