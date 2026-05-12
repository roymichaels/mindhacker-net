# Fix: orbs leaking above modals + legacy header z-index

## Root cause

`src/components/orb/v2/SharedOrbStage.tsx` mounts the shared WebGL canvas with **`zIndex: 2147483000`** (the near-max int). Every orb in the app paints into that single canvas, so even when a modal/sheet/hub overlay opens, the orb pixels render *above* it — which is exactly what the screenshots show (the AION orb sitting on top of the Free Market grid, on top of the Strategy panel, etc.).

A second smaller issue: `src/components/dashboard/DashboardLayout.tsx` line 86 still has `sticky top-0 z-50` on its inline header (the global `Header.tsx` was already lowered to `z-30` in the previous pass, but this duplicate header was missed). On routes that mount `DashboardLayout`, the header therefore re-rises above modals at `z-[70]`.

The blue floating chips with Hebrew text ("כל הכבוד", "כן בטח", "חלומות") visible at the left edge in the screenshots are the **Lovable preview annotation overlay**, not in-app UI — they only appear in the design-mode preview and won't show in production. No app fix needed for those.

## Plan (two-line change)

1. **`src/components/orb/v2/SharedOrbStage.tsx`** — change the wrapper's `zIndex: 2147483000` → `zIndex: 45`. That keeps orbs above page chrome (header `z-30`, composer `z-40`) and chat content, but below the modal tier (`z-[70]`), the immersive layer (`z-[75–90]`), toasts (`z-[100]`), and the ceremony layer (`z-[9999]`). Result: opening any sheet/dialog/hub modal cleanly covers the orbs.

2. **`src/components/dashboard/DashboardLayout.tsx`** line 86 — change `sticky top-0 z-50 ...` → `sticky top-0 z-30 ...` so this header obeys the same scale as the global `Header.tsx`.

No other surfaces need to change; the z scale established in the previous pass (header 30 / composer 40 / hud 55 / modals 70 / immersive 75–90 / toasts 100 / ceremonies 9999) is correct — the orb stage was simply ignoring it.

## Acceptance

- Open Free Market hub modal → AION orbs from the chat below are no longer visible on top of the grid.
- Open Strategy hub modal → same.
- Header on dashboard routes no longer punches through opened sheets.
- Orbs still render correctly on the chat home (above background, above text, below the composer dock).
