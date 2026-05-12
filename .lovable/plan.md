# Fix Realtime Crash + Tighten Pink Theme

## 1. Crash root cause
`src/hooks/aurora/useLifeModel.tsx` (lines 161-190) creates 5 realtime channels with **global static names** (`aurora-life-direction-realtime`, etc.). The effect's dependency array includes the React Query `refetch*` functions, whose identity changes across renders. When the effect re-runs (or the hook mounts in two trees simultaneously), Supabase reuses the existing channel by name and `.on('postgres_changes', …)` is called **after** `.subscribe()` — which throws the runtime error caught by ErrorBoundary.

**Fix:**
- Drop the `refetch*` functions from the effect deps (keep only `user?.id`); refetch refs from React Query are stable across renders for our purposes and pulling them in causes churn.
- Make channel names unique per user + instance: append `user.id` and a `crypto.randomUUID()` suffix so two mounts can't collide.

## 2. Color refinement
The current button uses `from-pink-400 to-fuchsia-500`, which renders pink→purple (visible blue/purple midpoint in the latest screenshot). User wants the cleaner solid pink from image 2.

**Fix in `src/components/ErrorBoundary.tsx`:**
- Primary button: switch to a tighter pink gradient `from-pink-300 to-pink-500` (no fuchsia/purple shift), keep black text and pink glow.
- Card border + glow stay pink (already correct).

## Out of scope
Other realtime hooks, story-world JSON warning, pre-existing TS noise.
