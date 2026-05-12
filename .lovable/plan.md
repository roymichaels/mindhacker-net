# Fix Realtime Channel Collisions Across Aurora Hooks

Same root cause as the previous fix, now surfacing in `useDashboard.tsx` (`aurora-identity-elements-realtime`). Multiple hooks reuse static channel names; when an effect re-runs or two consumers mount, Supabase reuses the existing channel and `.on()` runs after `.subscribe()`, throwing the boundary.

## Files to fix
Apply the unique-suffix pattern (`${user.id}-${crypto.randomUUID()}`) and stabilize effect deps:

- `src/hooks/aurora/useDashboard.tsx` (3 channels: identity-elements, life-visions, commitments)
- `src/hooks/aurora/useOnboardingProgress.tsx` (1 channel)
- `src/hooks/aurora/useChecklistsData.tsx` (2 channels)
- `src/hooks/aurora/useAuroraReminders.tsx` (1 channel)
- `src/hooks/aurora/useDailyHabits.tsx` (1 channel)

For each: rename `'X'` → `` `X-${user.id}-${suffix}` ``, drop `refetch*`/callback deps from the effect dep array.

Other channels (`useUserNotifications`, `useAdminNotifications`, `useMissionsRoadmap`, `useUserPurchases`) are left as-is unless they trigger the boundary — they're typically singleton mounts.

## Out of scope
Pink button styling (already shipped), unrelated TS noise.
