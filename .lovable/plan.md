

# Robustness Checklist: Make It "Just Work"

**STATUS: Parts A, B, C2 COMPLETE. C1 + C3 pending (dashboard snapshot RPC + channel consolidation).**

This is the boring infrastructure that prevents paying users from seeing glitches, duplicate rewards, or slow loads. Three layers: edge function reliability, data integrity, and performance.

---

## Part A: Edge Function Reliability

### A1. Idempotency Keys for Create/Award Actions

**Problem**: If a network retry or double-click fires `award_unified_xp` twice, the user gets double XP. Same for proactive nudge creation -- the 4-hour dedup window is time-based, not action-based.

**Solution**: Add an `idempotency_key` column to `xp_events` and `aurora_proactive_queue` with unique constraints. The `award_unified_xp` function will skip if a matching key already exists.

**Database changes**:
- Add `idempotency_key TEXT` to `xp_events` with a unique index (nullable for backwards compat)
- Modify `award_unified_xp` to accept optional `p_idempotency_key` -- if provided and already exists, return the previous result without awarding again
- Add `idempotency_key TEXT UNIQUE` to `aurora_proactive_queue`
- The `action_items` completion trigger will generate a deterministic key: `action_item:{item_id}:{date}`

### A2. Timeouts + Retries with Backoff

**Problem**: The `aurora-chat/index.ts` handler makes a single fetch to the AI gateway with no timeout. If the gateway hangs, the edge function hangs until Deno's 120s limit kills it.

**Solution**: Add an `AbortController` with a 90-second timeout to the AI gateway call. Add a retry wrapper (1 retry with 2s backoff) for non-streaming calls used in `aurora-proactive`.

**Files**: `supabase/functions/aurora-chat/index.ts`, `supabase/functions/aurora-proactive/index.ts`, new `supabase/functions/_shared/fetchWithRetry.ts`

### A3. Central Error Logging Table

**Problem**: Edge function errors vanish into Deno logs that rotate quickly. No way to query "how many errors happened this week?" or "which function fails most?"

**Solution**: Create an `edge_function_errors` table and a shared `logError()` utility.

**Database**:
```
edge_function_errors:
  id UUID PK
  function_name TEXT NOT NULL
  error_message TEXT NOT NULL
  error_stack TEXT
  user_id UUID (nullable)
  request_context JSONB (mode, action, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
```

**Shared utility** (`_shared/errorLogger.ts`): fire-and-forget insert on every `catch` block. All edge functions import this.

### A4. Circuit Breaker for AI Gateway

**Problem**: If the AI gateway is down, Aurora chat shows a generic error. The entire coaching experience breaks.

**Solution**: 
- In `aurora-chat/index.ts`: if AI gateway returns 5xx or times out, return a structured fallback response with the user's last context (overdue tasks, habits, plan status) formatted as a static coaching message
- Store last successful context hash in memory (per-request scope, so this is really about returning a useful degraded response rather than caching)
- Fallback message template: "I'm having trouble connecting right now, but here's what I see in your plan: [overdue tasks], [habits status]. I'll be back shortly."
- Add a `degraded: true` flag in the response so the frontend can show a subtle indicator

**Files**: `supabase/functions/aurora-chat/index.ts`, `supabase/functions/_shared/fallbackResponse.ts`

---

## Part B: Data Integrity

### B1. XP Ledger Immutability

**Problem**: `xp_events` is currently a simple append table with no protections. Rows can be updated or deleted, and the `profiles.experience` total can drift from the sum of events.

**Solution**:
- Add RLS policy blocking UPDATE and DELETE on `xp_events` (append-only ledger)
- Create a reconciliation function `reconcile_xp(p_user_id)` that recalculates `profiles.experience` from `SUM(xp_events.amount)` and corrects any drift
- Add a scheduled check (or manual RPC) that flags users where `profiles.experience != SUM(xp_events.amount)`

**Database changes**:
- `CREATE POLICY "xp_events_no_update" ON xp_events FOR UPDATE USING (false)`
- `CREATE POLICY "xp_events_no_delete" ON xp_events FOR DELETE USING (false)`
- New function: `reconcile_user_xp(p_user_id UUID)`
- New function: `check_xp_integrity()` returns users with drift

### B2. Unique Constraints for Streaks and Habit Logs

**Problem**: Nothing prevents duplicate streak records per user/day or duplicate habit completion logs.

**Solution**:
- Add unique index on `action_items` for habit completion: `UNIQUE(user_id, id, DATE(completed_at))` -- actually, since `completed_at` is on the row itself, the real risk is the completion trigger firing twice. The idempotency key from A1 handles this.
- Add a unique constraint on `xp_events(idempotency_key)` (from A1) to prevent duplicate awards at the DB level

### B3. Foreign Key Enforcement Audit

**Problem**: `action_items` has proper FKs, but `xp_events` only has a FK to `profiles`. No FK from `ai_response_logs` to `profiles`.

**Solution**:
- Add `FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE` to `ai_response_logs`
- Verify all tables with `user_id` have proper FK constraints (audit query)

---

## Part C: Performance

### C1. Dashboard Query Audit

**Problem**: Loading the dashboard currently fires 15-20+ separate queries across 4+ hooks (`GameStateContext` 3 queries, `useLifeModel` 5 queries, `useDashboard` 3 queries, `useOnboardingProgress` 1 query, plus per-component queries in `NextActionBanner`, `TodaysHabitsCard`, `ChecklistsCard`, `GoalsCard`, `PlanProgressHero`). Plus 8+ realtime channels.

**Solution**: Create a single `get_dashboard_snapshot` RPC that returns all dashboard data in one round-trip.

**Database function**:
```sql
CREATE FUNCTION get_dashboard_snapshot(p_user_id UUID)
RETURNS JSONB AS $$
  -- Returns: { profile, action_items_summary, habits_status, 
  --            plan_progress, life_direction, identity_summary,
  --            gamification, onboarding_progress }
  -- Single query with lateral joins instead of 15 sequential ones
$$
```

**Frontend**: New `useDashboardSnapshot` hook that calls this RPC once, then distributes data to child components via props or context. Individual hooks remain for non-dashboard pages.

### C2. Context Builder N+1 Fix

**Problem**: In `contextBuilder.ts` (lines 217-228), checklist child counts are computed with a sequential loop -- 2 queries per parent task. If a user has 20 checklists, that's 40 extra queries on top of the initial 21.

**Solution**: Replace the sequential loop with a single aggregation query:
```sql
SELECT parent_id, 
  COUNT(*) as total, 
  COUNT(*) FILTER (WHERE status = 'done') as done
FROM action_items 
WHERE parent_id = ANY($1)
GROUP BY parent_id
```

Pass all parent IDs at once. This reduces 40 queries to 1.

**File**: `supabase/functions/_shared/contextBuilder.ts`

### C3. Reduce Realtime Channel Count

**Problem**: The dashboard opens 8+ realtime channels (5 from `useLifeModel`, 3 from `useDashboard`). Each channel is a persistent WebSocket subscription.

**Solution**: Consolidate into 1-2 channels that listen to multiple tables:
- Channel 1: `aurora-user-data` -- listens to `aurora_life_direction`, `aurora_energy_patterns`, `aurora_behavioral_patterns`, `aurora_focus_plans`, `aurora_daily_minimums`, `aurora_identity_elements`, `aurora_life_visions`, `aurora_commitments`
- On any change: invalidate the single `dashboard_snapshot` query key

This reduces 8 channels to 1, and 8 refetch callbacks to 1.

---

## Implementation Order

1. **A1** (Idempotency) + **B1** (XP ledger immutability) -- prevents money bugs
2. **C2** (N+1 fix in contextBuilder) -- quick win, biggest perf impact on edge functions
3. **A3** (Error logging table) -- enables visibility for everything after
4. **A2** (Timeouts + retries) -- prevents hangs
5. **A4** (Circuit breaker) -- graceful degradation
6. **C1** (Dashboard snapshot RPC) + **C3** (Channel consolidation) -- biggest frontend perf win
7. **B2** + **B3** (Constraint audit) -- cleanup

## Technical Summary

### Database Migrations
- Add `idempotency_key` to `xp_events` + unique index
- Add `idempotency_key` to `aurora_proactive_queue` + unique index  
- Modify `award_unified_xp` to check idempotency
- Create `edge_function_errors` table
- Add UPDATE/DELETE-blocking policies on `xp_events`
- Create `reconcile_user_xp` + `check_xp_integrity` functions
- Add FK on `ai_response_logs.user_id`
- Create `get_dashboard_snapshot` RPC
- Modify `action_items` completion trigger to pass idempotency key

### New Files
- `supabase/functions/_shared/fetchWithRetry.ts`
- `supabase/functions/_shared/errorLogger.ts`
- `supabase/functions/_shared/fallbackResponse.ts`
- `src/hooks/useDashboardSnapshot.ts`

### Modified Files
- `supabase/functions/_shared/contextBuilder.ts` (N+1 fix)
- `supabase/functions/aurora-chat/index.ts` (timeout, circuit breaker, error logging)
- `supabase/functions/aurora-proactive/index.ts` (retry, idempotency, error logging)
- `src/hooks/aurora/useLifeModel.tsx` (channel consolidation)
- `src/hooks/aurora/useDashboard.tsx` (channel consolidation)
- `src/components/dashboard/UnifiedDashboardView.tsx` (use snapshot hook)

