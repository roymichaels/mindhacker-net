# Phase 1.5 — Native Navigation + Idle Chamber Behavior

Frontend-only. No backend, no orchestration, no routes, no capabilities.

## Current state (verified)

- ShellV2 has **no persistent bottom tab bar** today. The 5 surfaces only live inside `ShellV2Drawer`.
- `AionNavDock` primitive exists but is **unmounted** anywhere.
- Composer has the right minimal pill but does not react to idle/streaming.
- Drawer (`ShellV2Drawer`) still feels like a classic admin sidebar (white-tinted card, "Account" label, hard divider, brand row "AION" caption).
- `ChatLayer` already pads top/bottom and has fade mask. Good.
- `ShellV2Header` mounts brand "About" sheet — keep, but it should stay calm.
- No persistent CTA captions under composer (already cleaned in Phase 1).

## Design intent (matches reference image)

```
ACTIVE CONVERSATION       IDLE CHAMBER         REVEAL ON SCROLL
┌──────────────────┐      ┌──────────────────┐  ┌──────────────────┐
│  ☰   AION    ◉   │      │  ☰   AION    ◉   │  │  ...messages...  │
│                  │      │                  │  │                  │
│  …messages…      │      │     ◉ orb        │  │  ──────────────  │
│                  │      │   "אני כאן…"     │  │  ◉  ✦  ⌖  ◯  ◌   │ ← ghost dock
│  [ 🎤  …    + ]  │      │  [ 🎤  …    + ]  │  │  [ 🎤  …    + ]  │
└──────────────────┘      └──────────────────┘  └──────────────────┘
   nav fully hidden        nav fully hidden       nav softly faded in
```

Nav rules:
- Default: **hidden** (opacity 0, pointer-events none).
- Reveal triggers (any one):
  - User scrolls **up** in the conversation (intent to navigate, not read).
  - User is **idle** > 6s with no streaming, no input focus, no recent send.
  - User taps a small grabber chevron above the composer.
  - User opens the drawer (drawer already covers nav use case).
- Hide triggers:
  - Composer focused.
  - AION is streaming.
  - User scrolls **down** (reading new content).
  - User sends a message.
  - Tapping anywhere in the chat surface.
- Transition: 320ms opacity + 8px translate-y, no spring.

## Files to change

| File | Change |
|------|--------|
| `src/shellv2/layers/NavLayer.tsx` *(new)* | Mounts `AionNavDock` with the 5 canonical surfaces; subscribes to a tiny `useChamberIdle()` hook for visibility. |
| `src/shellv2/hooks/useChamberIdle.ts` *(new)* | Tracks `isStreaming` (from `useAuroraChatContext`), composer focus, scroll direction in the chat scroller, last-activity timestamp. Returns `{ navVisible, isIdle }`. |
| `src/shellv2/ShellV2.tsx` | Mount `<NavLayer />` between Composer and Chrome. |
| `src/shellv2/zindex.ts` | Add `nav` slot just under composer (z=28). |
| `src/components/aion/ui/AionNavDock.tsx` | Add `visible` prop; when false → opacity 0 + translate-y-2 pointer-events-none. Tighten icon stroke to 1.5, label to 9px, hairline divider only when visible. Add a tiny grabber chevron at top center that flips the visibility. |
| `src/shellv2/layers/ChatLayer.tsx` | Forward scroll events to a chamber idle context (provider mounted in ShellV2). |
| `src/shellv2/ShellV2Drawer.tsx` | Reskin to AION portal: remove `bg-card`/ring stack, use `bg-background/70` + `backdrop-blur-2xl` + soft violet→cyan radial bloom on first paint; replace the "AION" caption with a small breathing orb + display name; soften "Account" header to a hairline label; replace `border-t` footer with a fade gradient; switch button surfaces to `aion-pill-surface` hover. No new items. |
| `src/components/dashboard/GlobalChatInput.tsx` | Idle visual: when `!input && !isStreaming && !isRecording`, dim placeholder to `text-foreground/30`, drop pill background to `foreground/[0.025]`. When streaming: replace send icon area with a static breathing dot (no spinner). Remove the `recordingError` paragraph from inside the form (toast it instead) so no caption sits under composer. |
| `src/components/aion/ui/AionComposerDock.tsx` | Add `data-composer-state` (idle/focus/streaming) attribute hook so the underglow can dim 60% when idle. |

## Idle chamber behavior

Source of truth: `useChamberIdle()` returns:
```ts
{ navVisible: boolean; isIdle: boolean; composerState: 'idle'|'focus'|'streaming' }
```
- `isIdle` becomes true after 6s of no `pointerdown`, no `keydown`, no scroll, no streaming.
- When `isIdle`: orb (existing `AionOrb` in header + background) keeps its current breathing; composer underglow dims; nav stays hidden unless the user opens it.
- When `streaming`: nav forced hidden; composer underglow softly pulses (existing CSS only — no new keyframes).

## Drawer changes (AION portal feel)

- Background: `bg-background/70 backdrop-blur-2xl` + radial violet→cyan bloom top-right (RTL: top-left).
- Header: small `AionOrb size="xs"` + display name in `aion-text-hero` instead of the uppercase "AION" caption.
- Section headers: 9px tracked label, no border.
- List buttons: rounded-2xl, hover `bg-foreground/[0.04]`, icon stroke 1.5, opacity 70.
- Footer: fade gradient instead of `border-t`; sign-out as ghost pill.
- No new items, no new routes.

## Mobile acceptance checklist

- iOS safe-area: nav uses `pb-[max(env(safe-area-inset-bottom),0.5rem)]`; composer keeps its existing safe-area; nav sits **below** composer in z (composer always tappable).
- When nav appears, composer stays at its bottom anchor — nav fades in **above** the home indicator but **behind** the composer dock visually (composer floats with underglow over the nav row → no double bottom controls).
- Drawer side respects `isRTL` (already correct).
- 402×716 viewport: nav row height 56px; composer height ~48px; total bottom stack ≤ 120px when nav is visible. No artifact occlusion (artifact stack is anchored 220px above bottom, already verified Phase 1).

## Out of scope (defer to Phase 2)

- Brain inner-map UX.
- Journey single-step view.
- Replacing legacy `FMBottomNav` / `DesktopSideNav` (they live on non-ShellV2 routes).
- Any backend, orchestration, or RPC.

## Risks

- Hiding nav by default means new users may not discover the 5 surfaces. Mitigation: drawer hamburger is always visible in the header, plus the grabber chevron. If discoverability is still weak we can auto-reveal once on first session.
- Scroll-direction detection on a short conversation can flicker. Mitigation: 80px scroll threshold + 250ms debounce.
- Drawer reskin risks regressing admin link visibility — keep `isAdmin` branch untouched.

## Return after implementation

1. Files changed
2. Nav idle rules (final thresholds)
3. Composer behavior changes
4. Drawer changes
5. 402×716 preview notes (idle / active / streaming / drawer open)
6. Remaining issues before Phase 2 Brain
