# Fix the admin panel crash

## What I found
- `/admin-hub` currently renders inside the main authenticated shell, but it is **not wrapped with `AdminRoute`** even though that guard already exists.
- The blank/crash state is **not coming from `AdminHub.tsx` itself**. The browser is failing while loading shared lazy modules used around the admin page:
  - `src/components/dashboard/DashboardLayout.tsx`
  - `src/pages/ProfilePage.tsx`
  - `src/components/orb/AIONFloatingWidget.tsx`
- That means the admin screen is crashing through the **global shell / global overlays path**, not because the admin tab config is wrong.

## Plan
1. **Protect the admin route correctly**
   - Wrap `/admin-hub` with the existing `AdminRoute` so role/auth loading finishes before the admin shell renders.
   - Keep unauthorized users out of the admin UI instead of letting the page fall into a broken shared-shell state.

2. **Make the admin shell resilient to lazy-load failures**
   - Remove or reduce lazy loading for the critical admin path modules that are blanking the screen (`DashboardLayout`, and if needed the always-mounted global overlays).
   - For non-critical global UI like `ProfilePage` and `AIONFloatingWidget`, keep them from taking down the whole route if their import fails.

3. **Keep the admin page isolated from unrelated global chrome failures**
   - Ensure the admin hub can still render even if optional global overlays/widgets fail.
   - Preserve the existing admin content structure (`AdminLayoutWrapper` → `AdminHub`) without changing business logic.

4. **Validate the actual route**
   - Re-test `/admin-hub` in preview after the changes.
   - Confirm the page renders instead of showing the generic crash card.

## Files likely involved
- `src/App.tsx`
- `src/components/layout/ProtectedAppShell.tsx`
- `src/components/dashboard/DashboardLayout.tsx`
- `src/pages/ProfilePage.tsx`
- `src/components/orb/AIONFloatingWidget.tsx`

## Out of scope
- No redesign of the admin UI.
- No database or backend changes unless a new signal shows a data-layer error.