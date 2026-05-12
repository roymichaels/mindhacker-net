
## Audit — why orbs are invisible right now

I traced every orb surface and the shared pipeline. Three concrete bugs explain the blank screen, plus structural cleanup we should do while we're here.

### Bug 1 — Z-stack occlusion (root cause of "nothing shows")

`SharedOrbStage` mounts a fixed full-viewport Canvas at **`z-[60]`**.
Overlays that host orbs render **above** it:

| Surface | z-index | Background |
|---|---|---|
| SharedOrbStage Canvas | `z-[60]` | transparent |
| InteractiveAION backdrop | `z-[75]` | `bg-black/40` |
| InteractiveAION panel | `z-[80]` | **opaque `bg-background`** |
| Various sheets/modals | `z-[90]+` | opaque |

drei's `<View track={ref}/>` doesn't render in-place — it renders into the **shared Canvas pixel coordinates** of the tracked rect. So when the panel slides over the canvas, the orb is painted *underneath the panel's opaque background* and disappears. That matches exactly what your screenshot shows: the panel chrome is visible, the orb spot is empty/dark.

Header orb on `/index` doesn't render either because `/index` renders the marketing `Index` page which has its own header path; `OrbView` is mounted but the surrounding layout never lays it out at a non-zero size in that route.

### Bug 2 — Lazy chunk import failure

Console shows:
```
TypeError: Importing a module script failed.
componentStack: Lazy → Suspense → Suspense
```
That's `lazyWithRetry(() => import('./InteractiveAION'))` failing — almost certainly a stale chunk after the v2 orb refactor changed the dependency graph. Hard reload would fix the symptom; we should also force a cache-bust.

### Bug 3 — Fragmentation still present

The "single orb identity" goal isn't done:

- `Orb.tsx` (legacy CSS/canvas) still rendered for `size < 80` via `PersonalizedOrb`
- `AuroraOrbIcon` still imported in `Header.tsx` even though `OrbView` replaced it
- `OrganicOrbCanvas`, `PersonalizedOrb` are now thin wrappers — keeping them adds two extra render layers and one extra wrapping `<div>` around every orb (interferes with `View`'s rect tracking)
- `OrbDebugOverlay` is positioned absolutely *next to* `OrbView`'s wrapper div, so it sits in the layout flow but the orb itself is painted in the canvas — debug labels can drift

---

## Plan

### Step 1 — Fix the z-stack so orbs always paint on top

Raise `SharedOrbStage` above every overlay and keep `pointer-events-none` so it never steals input.

```tsx
// SharedOrbStage.tsx
<div
  aria-hidden
  className="fixed inset-0 z-[2147483000] pointer-events-none"
  style={{ contain: 'strict' }}
>
  <Canvas ... />
</div>
```

Why a max-ish z: we have sheets, toasts, dialogs all using high z. The orb is a *visual layer*, not a UI surface, so it should sit above everything visually but be input-transparent. The View pixel coordinates already match the tracked rects, so an orb tracked inside a modal will visually appear inside that modal's frame.

### Step 2 — Force-flush stale chunks

Bump `cacheBuster` version so the SW/precache evicts the old `InteractiveAION` chunk that's failing to import. Also wrap `lazyWithRetry` for `InteractiveAION` with a one-time `location.reload()` on `ChunkLoadError` (it already has retry; add a final hard-reload fallback).

### Step 3 — Finish the unification

- **Delete `AuroraOrbIcon` import** from `Header.tsx` (already replaced by `OrbView`, the import is dead but adds chunk weight).
- **`PersonalizedOrb`**: collapse the WebGL branch into a direct `OrbView` render (drop the extra `<div className="relative">` wrapper — pass `className` to `OrbView` instead). For `size < 80`, also route to `OrbView` with `tier="presence"` instead of legacy `Orb`. Remove `renderer="css"` branch entirely.
- **`OrganicOrbCanvas`**: re-export `OrbView` directly (keep the file name for back-compat imports, but make it a one-line alias) — eliminates a render layer.
- **`OrbDebugOverlay`**: gate behind `import.meta.env.DEV` and render in a portal at the tracked rect, so it stays aligned with the canvas-painted orb.

### Step 4 — Quality pass on the Canvas

While we're in `SharedOrbStage`:
- Add `gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', premultipliedAlpha: true }}` (already mostly there).
- Re-enable a *light* bloom via `@react-three/postprocessing` (already in deps) but only when **at least one** `OrbView` is mounted at `tier !== 'presence'`. Use a context counter to toggle the `<EffectComposer>` mount, so header/presence orbs don't pay the cost. This was removed last round to fix visibility — with the z-stack fix it's safe to bring back.
- Keep `dpr` policy as-is (1.5 floor on mobile, cap 2.0).

### Step 5 — Verification

Manually verify on the user's preview:
1. Header orb visible on `/dashboard` (route with the standard shell).
2. Mobile presence orb visible above the bottom nav.
3. Open Interactive AION → orb visible *inside* the slide-in panel, breathing, no occlusion.
4. Open it during a sheet/modal → orb still paints.
5. No console "Importing a module script failed".
6. Performance: only one WebGL context (`document.querySelectorAll('canvas').length === 1`).

---

## Technical notes

**Why not a per-surface Canvas?**
We had that before — it blew through iOS's ~8-context limit and gave inconsistent DPR/bloom per surface. Single canvas + drei `View` is the right architecture; the only thing wrong was its z-index.

**Why z = 2,147,483,000 instead of 9999?**
Sonner toasts use `2147483647`. We sit just below that so toasts still float over the orb, but above all app overlays.

**Files touched**
- `src/components/orb/v2/SharedOrbStage.tsx` — z-index, optional bloom toggle
- `src/components/orb/v2/OrbView.tsx` — accept `className` cleanly, expose `useOrbStageDemand()` hook for cinematic counter
- `src/components/orb/PersonalizedOrb.tsx` — collapse to OrbView for all sizes, remove wrapper div
- `src/components/orb/OrganicOrbCanvas.tsx` — convert to alias re-export
- `src/components/Header.tsx` — drop `AuroraOrbIcon` import
- `src/components/orb/OrbDebugOverlay.tsx` — DEV-gate + portal alignment
- `src/utils/cacheBuster.ts` — bump version
- `src/components/aion/InteractiveAIONHost.tsx` — hard-reload fallback on chunk load error

No backend, no schema, no auth changes.
