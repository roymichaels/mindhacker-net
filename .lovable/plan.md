## Goal

The `/brain` route is throwing into the global `ErrorBoundary` (the pink "משהו השתבש" card with `ERR-…` id). Without the actual stack we can't pinpoint a single line, but the route has several thin spots that can throw on real user data, and there is no local boundary — any one of them takes the whole page down.

## What I'll do

### 1. Add a local error boundary around the Brain surface
- Wrap `<BrainView />` inside `src/pages/BrainPage.tsx` with a small `BrainErrorBoundary` (new file `src/features/brain/BrainErrorBoundary.tsx`) that:
  - Catches render errors only inside Brain.
  - Shows a Hebrew/English fallback ("המוח לא נטען — נסה שוב") with a "Rebuild" button that calls `useBackfillBrain` and a "Reload" button.
  - Logs the real error + component stack via `debug.error` so the next reproduction surfaces in console with a real stack instead of the generic ErrorBoundary id.

### 2. Defensive fixes in the render path
These are the hot spots most likely to throw on partial data:

- **`src/features/brain/useBrainOverview.ts`**
  - The RPC sometimes returns `null` data on RLS-filtered users. Treat `null` like empty: return the same shape with empty arrays (today it already does, but only when the call resolves; if the JS client throws we still propagate). Wrap the body in a `try/catch` and rethrow a clean `Error("brain_get_overview failed: …")` so React Query stores a serializable error.
  - In `confirmBrainNode` / `rejectBrainNode`, swallow the network error into a toast instead of throwing into the click handler (a rejected promise from `onClick` currently bubbles to the page boundary because the handlers are `async` without try/catch).

- **`src/features/brain/BrainView.tsx`**
  - Coerce `data.pillars` to a plain object before `Object.values(...)` (RPC could theoretically return an array literal in a misconfigured row): `const pillarVals = data?.pillars && typeof data.pillars === 'object' && !Array.isArray(data.pillars) ? Object.values(data.pillars) : [];`
  - Guard `n.confidence` / `n.score` / `n.strength` numerics with `Number(... ?? 0)` before they reach math.
  - Make the ShellHeader subtitle a plain string instead of a JSX fragment (subtitle is typed `string`; the fragment we pass as `children` is fine but the inline `<span>`s read better as `children` only — keep one source of truth).

- **`src/features/brain/BrainGraphForce.tsx`**
  - Early-return a minimal placeholder when `nodes.length === 0` (today the SVG still mounts and the force-loop runs over 0 nodes; harmless but wastes a frame).
  - Clamp `r`, `cx`, `cy`, `x1/y1/x2/y2` to finite numbers (`Number.isFinite(v) ? v : 0`) so a stray `NaN` from `useForceLayout` cannot throw inside React's SVG attribute serializer in production.

- **`src/features/brain/useForceLayout.ts`**
  - Replace `Math.sqrt(n.score) / 3` with `Math.sqrt(Math.max(0, Number(n.score) || 0)) / 3` so a missing/negative `score` cannot produce `NaN` radii.
  - Initial coordinates: guard against `Math.cos(angle) * radius` being `NaN` when `nodes.length === 0`.

- **`src/features/brain/BrainSections.tsx`**
  - `arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))` — same numeric guard.
  - Guard `Object.entries(pillars)` the same way as in BrainView.

### 3. Verification
- Reload `/brain` logged-in (via the browser tool) and confirm:
  - No ErrorBoundary fallback on initial render.
  - Empty state still renders the "Build my brain" CTA.
  - A forced throw inside `BrainGraphForce` (temporary `throw new Error('test')`, then reverted) is caught by the new local boundary and shows the Brain-specific fallback, not the global one.
- Check console for the `[brain] overview RPC error` log path when RPC fails (force by passing an invalid uuid in dev).

## Files touched

- `src/pages/BrainPage.tsx` (wrap with boundary)
- `src/features/brain/BrainErrorBoundary.tsx` (new)
- `src/features/brain/BrainView.tsx`
- `src/features/brain/BrainGraphForce.tsx`
- `src/features/brain/useForceLayout.ts`
- `src/features/brain/BrainSections.tsx`
- `src/features/brain/useBrainOverview.ts`

No DB / edge-function / migration changes. UI + presentation only.
