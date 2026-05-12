# Fix: Admin panel white screen

## Diagnosis

Visiting `/panel` (or `/admin-hub`) renders blank. There are no captured runtime errors in this session, but the structure of `AdminHub` makes any sub-page throw take down the entire admin shell:

- `src/pages/AdminHub.tsx` renders `<AdminStatsBar />`, `<AdminInlineNav />`, then the active sub-page inside a single `<Suspense>` with **no error boundary**.
- If any lazy sub-page (Analytics, Users, Coaches, Newsletter, etc.) throws during render or its dynamic `import()` rejects (e.g. transient chunk-load failure after a deploy), React unwinds to the route root and the whole `/admin-hub` view blanks.
- `AdminLayoutWrapper` is also unprotected — same failure mode.

This matches the symptom: white screen on `/panel`, no error toast, no surviving chrome.

## Fix

1. **Add an admin-scoped ErrorBoundary** around the active sub-page render, so a crashing tab shows an inline error card instead of blanking the panel. The shell (stats bar + inline nav) stays usable so the user can switch tabs.
   - File: `src/pages/AdminHub.tsx`
   - Wrap the `<Suspense>{ActiveSubComponent && <ActiveSubComponent />}</Suspense>` block with `<ErrorBoundary>` (reuse `src/components/ErrorBoundary.tsx`).
   - Reset boundary key on `${activeTab}:${currentSubTab}` change so switching tabs clears the error state.
   - Fallback UI: small `Card` with title (he/en), the error message, and a "Reload" button that calls `window.location.reload()`.

2. **Guard the lazy import itself**: `AdminLayoutWrapper` already uses `lazyWithRetry` for itself but `AdminHub` is plain `lazy(...)`. Switch to `lazyWithRetry('AdminHub')` so a stale chunk after a publish auto-retries instead of throwing.
   - File: `src/components/admin/AdminLayoutWrapper.tsx`

3. **Verification**:
   - Open `/admin-hub` — chrome + Overview tab render.
   - Force a throw inside one sub-page temporarily to confirm the boundary catches it (then revert).
   - Confirm tab switching from a crashed tab back to a healthy tab clears the error.

## Out of scope

- No business-logic changes, no data/auth changes, no styling restructure.
- Not fixing any specific sub-page bug yet — boundary will surface the real error so we can target it next message if a specific tab still throws.

## Followup (if needed after deploy)

If the user reports the boundary now shows a real error message, fix the offending sub-page based on that message. Likely candidates to inspect first if needed: `pages/admin/Analytics.tsx` (heavy `recharts` + many queries) and `components/admin/AdminStatsBar.tsx` (queries `consciousness_leap_leads`, `orders`, `profiles`).
