
# Fix: Aurora Proactive Nudges Not Reaching You

## Root Causes Found

1. **Your user has no `aurora_onboarding_progress` row** -- The cron job (`batch_analyze`) queries `aurora_onboarding_progress WHERE proactive_enabled = true AND last_active_at >= 7 days ago`. Your user ID (`bc1c0b6e-...`) has zero rows in this table, so the cron completely skips you. Other users (4 of them) DO get nudges because they have this row.

2. **No auto-creation of onboarding progress** -- When a user signs up or logs in, no trigger or code ensures an `aurora_onboarding_progress` row is created with `proactive_enabled = true`. Only users who went through a specific onboarding flow have it.

3. **Frontend fetch uses wrong auth header** -- `useProactiveAurora` sends the anon key as `Authorization: Bearer`, not the user's session JWT. This causes "Failed to fetch" errors and means even the on-demand polling never successfully retrieves pending items.

## Fix Plan

### Part 1: Auto-create onboarding progress for all users (Database)

Create a trigger on `auth.users` (or better, on `profiles`) that automatically inserts an `aurora_onboarding_progress` row with `proactive_enabled = true` when a new profile is created. Also, backfill all existing users who are missing this row.

**Migration SQL:**
- INSERT into `aurora_onboarding_progress` for all existing `profiles` users who don't have a row yet, with `proactive_enabled = true` and `last_active_at = now()`
- Create a trigger function on `profiles` table (AFTER INSERT) that auto-creates the onboarding progress row

### Part 2: Fix `useProactiveAurora` auth header (Frontend)

Update `useProactiveAurora.tsx` to use the user's actual session JWT token instead of the static anon key:

```
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Use token in Authorization header
Authorization: `Bearer ${token}`
```

This ensures the fetch calls actually succeed and don't throw "Failed to fetch" errors.

### Part 3: Update `last_active_at` on user activity (Frontend)

The cron filters by `last_active_at >= 7 days ago`, meaning inactive users stop getting nudges. Add a lightweight update to `last_active_at` whenever the user visits the dashboard or Aurora page, so the cron continues to generate coaching messages.

This can be done via a simple `useEffect` in `UnifiedDashboardView` or `AuroraLayout` that calls:
```
supabase.from('aurora_onboarding_progress')
  .update({ last_active_at: new Date().toISOString() })
  .eq('user_id', user.id)
```

## Technical Details

### Files to modify:
- `src/hooks/aurora/useProactiveAurora.tsx` -- Fix auth header to use session JWT
- `src/components/dashboard/UnifiedDashboardView.tsx` -- Add `last_active_at` ping on mount

### Database migration:
- Backfill `aurora_onboarding_progress` for all existing users missing rows
- Create trigger on `profiles` AFTER INSERT to auto-create the row
- Both with `proactive_enabled = true`

### Expected result after fix:
- All users (including you) will have `aurora_onboarding_progress` rows
- The cron job (every 3 hours) will pick up all active users and generate nudges
- The frontend hook will successfully fetch pending items using the correct auth token
- Dashboard visits will keep `last_active_at` fresh so the cron never skips you
