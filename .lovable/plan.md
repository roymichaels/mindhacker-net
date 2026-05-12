## Orchestrator Brain — always-on AION decision layer

Foundation slice for the AION-centered direction. Adds a backend that continuously watches the user, decides what AION should do, and exposes those decisions globally — without yet rewriting any UI. Later slices (orb states, mode engine, intent bar) plug into this single source of truth.

### Mental model

```text
signals → brain → decision → realtime → useAionDecision() → (future UI layers react)
```

- **Signals**: lightweight events the app already emits or can cheaply emit (route change, composer focus, AI streamed message, action completed, session done, idle, time-of-day, recent tone).
- **Brain**: Deno edge function `aion-brain` that fuses signals + existing `buildContext` and asks Lovable AI for one structured Decision.
- **Decision**: a single current-state row per user — `mode`, `tone`, `density`, `focus_target`, `suggestion`, `expires_at`, `reasoning`. Always overwritten (we keep one live decision; history archived).
- **Distribution**: `aion_decisions` realtime → `useAionDecision` hook → `AionDecisionContext`. UI just reads.

### 1. Database (`supabase--migration`)

**New table `aion_signals`** — append-only event log, retention 7 days.
- Columns: `user_id`, `kind` (`route_change|composer_focus|ai_message|action_completed|session_completed|journal_saved|idle|tone_signal`), `payload jsonb`, `client_at timestamptz`, `created_at`.
- RLS: user can insert + select own. Index on `(user_id, created_at desc)`.

**New table `aion_decisions`** — one live row per user (upsert by `user_id`).
- Columns: `user_id` (PK), `mode` (`flow|focus|recovery|overwhelmed|hypnosis|calm|neutral`), `tone` (`grounded|energizing|gentle|direct`), `density` (`minimal|standard|rich`), `focus_target jsonb` (e.g. `{ type:'mission', id:'…' }`), `suggestion jsonb` (e.g. `{ label, action, hub }`), `reasoning text`, `signals_snapshot jsonb`, `expires_at timestamptz`, `updated_at`.
- RLS: user reads own; only service role writes.
- Add to `supabase_realtime` publication.

**New table `aion_decision_history`** — same shape as `aion_decisions` minus PK constraint, append-only, for audit/learning. Insert via trigger on update of live row.

### 2. Edge function `aion-brain`

`supabase/functions/aion-brain/index.ts`. CORS, JWT validated in code (Lovable Cloud default).

Inputs (POST body, all optional):
- `force: boolean` — bypass debounce.
- `trigger: string` — what caused this call (for debugging).

Steps:
1. Resolve userId from JWT.
2. Debounce: if `aion_decisions.updated_at` < 60s ago and `!force`, return current row.
3. Pull last 50 signals (`aion_signals`) + reuse `buildContext` from `_shared/contextBuilder.ts` for canonical user context (active mission, streak, energy, recent chat tone, etc.).
4. Compose prompt with two parts: (a) static system describing AION's job and the Decision schema, (b) compact user state JSON.
5. Call Lovable AI Gateway, model `google/gemini-3-flash-preview`, with a single tool `emit_decision` whose JSON Schema mirrors the `aion_decisions` columns. `tool_choice` forces the call.
6. Upsert `aion_decisions` for user with returned values + `expires_at = now() + 10m`. Trigger writes previous row to `aion_decision_history`.
7. Return decision JSON.

Errors: 429/402 surfaced cleanly; on AI failure, keep last decision and return it with `stale: true`.

### 3. Cron + invocation paths

- **Cron** (pg_cron + pg_net): every 5 minutes, call `aion-brain` for users active in the last 30 minutes (filtered server-side inside the function via a `select_active_users` SQL call). Single batched invocation that loops users.
- **Event hooks** (client side): thin helper `recordSignal(kind, payload)` writes into `aion_signals`. After key bursts (3+ signals in 30s, or `session_completed`, or `journal_saved`), debounced call to `aion-brain`.
- **Explicit**: `useAionDecision().refresh()` for places that need immediate re-evaluation.

### 4. Client surface (no UI rewrite yet)

- `src/services/aionSignals.ts` — `recordSignal(kind, payload)` (insert into `aion_signals`).
- `src/hooks/aion/useAionDecision.ts` — fetches initial decision + subscribes to realtime updates of own row + exposes `refresh()`.
- `src/contexts/AionDecisionContext.tsx` — provider mounted inside `ProtectedAppShell` wrapping the same tree as `HubModalProvider`. Exposes `{ decision, refresh, recordSignal }`.
- Wire **only two** initial signal sources to prove the loop end-to-end:
  - route changes (in `ProtectedAppShell` via `useLocation`)
  - AI message completions (in `aurora-chat` client invoker)
- Everything else (orb states, mode-driven density, intent bar) is left to follow-up slices that just consume `useAionDecision()`.

### 5. Out of scope this slice

- No visible UI changes. The orb still pulses on its current logic; nav still shows; hub modals stay as-is.
- No model fine-tuning or learning loop yet — `aion_decision_history` exists but isn't analyzed.
- No tone analysis pipeline beyond what `buildContext` already provides.
- No new pricing/tier logic.

### 6. Files

- new migration: `aion_signals`, `aion_decisions`, `aion_decision_history`, RLS, realtime publication, history trigger.
- new edge fn: `supabase/functions/aion-brain/index.ts`
- new cron entry (via `supabase--insert`, not migration, since it embeds project URL + anon key).
- new client: `src/services/aionSignals.ts`, `src/hooks/aion/useAionDecision.ts`, `src/contexts/AionDecisionContext.tsx`.
- edits: `src/components/layout/ProtectedAppShell.tsx` to mount provider; one signal call in `aurora-chat` client invoker; one in shell route effect.

### Result

After this slice ships, AION has a real, always-on decision pulse. Every surface in the app can subscribe to `useAionDecision()` and react — which is the prerequisite for the next slices (Reactive Orb States, Adaptive Environments, Intent Bar) without further backend work.
