## Problem

Tapping the header orb on `/dashboard` or `/aurora` does nothing. Runtime error in the preview:

```
TypeError: Importing a module script failed.
URL: /node_modules/.vite/deps/chunk-VJA5E53X.js
```

## Root cause

`src/components/aion/InteractiveAIONHost.tsx` currently does a **synchronous** top-level `import InteractiveAION from './InteractiveAION'`. `InteractiveAION` pulls a heavy dependency tree (PersonalizedOrb / WebGL, voice mode hook, GlobalChatInput, ChatHistorySheet → Supabase realtime, ArtifactLayer, HypnosisLayer). When Vite's pre-bundled chunk for one of those deps fails to fetch (stale `.vite/deps` cache after recent edits to model defaults / sanitizer), the host module itself fails to evaluate. Result: the `aion:open-interactive` event listener is **never registered**, and `openInteractiveAION()` from the header dispatches an event that nobody hears → "nothing happens".

We changed the host away from `lazy()` in an earlier phase to fix a different "failed module import" symptom; that just moved the failure earlier in the boot sequence.

## Fix

In `src/components/aion/InteractiveAIONHost.tsx`:

1. Convert the host's own import of `InteractiveAION` back to **lazy + Suspense**, but use the project's `lazyWithRetry` helper (`src/lib/lazyWithRetry.ts`) instead of bare `React.lazy`. `lazyWithRetry` already handles the "Importing a module script failed" case by busting the cache and retrying — that is exactly the error we are seeing.
2. Keep the event listener, edge-swipe listener, and Escape handler at the **top level of the host component**, completely independent of whether `InteractiveAION` has loaded. This guarantees `openInteractiveAION()` is always heard, even if the immersive surface chunk is briefly unavailable.
3. While `open === true` and the lazy chunk is still loading, render a small Suspense fallback (full-screen `bg-background/95 backdrop-blur-md` with a tiny "טוען…" line) so the user gets immediate feedback on tap.
4. If the lazy import rejects again after `lazyWithRetry` exhausted retries, catch it via a tiny inline error boundary that closes the overlay and shows a one-line toast ("מצב AION לא זמין כרגע — נסה שוב"). Use the existing `sonner` toast (`import { toast } from 'sonner'`).

No other files need to change. Header wiring (`onClick={openInteractiveAION}`) and global mount in `src/App.tsx` (inside `OverlayProvider`) stay as-is.

### Verification

1. Hard reload preview on `/dashboard`.
2. Tap the header orb — overlay opens (with brief fallback if needed), close (X / Escape) works.
3. Repeat on `/aurora`.
4. Confirm no `Importing a module script failed` toast in console after reload.

## Out of scope

- No changes to `InteractiveAION.tsx`, `ChatHistorySheet.tsx`, `Header.tsx`, or `App.tsx`.
- No backend / model / sanitizer changes.
