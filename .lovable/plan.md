## Problem

The Free Market / Community / Study hub modals (`HubModalHost`) render at `z-[70]`, but the AION floating widget (`z-[88]`) and AION chat panel/overlay (`z-[79]` / `z-[81]`) sit *above* the modal. That's why the screenshot shows chat bubbles, suggestion chips, and the bottom dock bleeding through the Free Market modal — the modal background itself is already opaque (`bg-background`), it just isn't covering the AION layer.

## Fix

Raise the hub modal above the AION layer so the opaque `bg-background` actually covers everything beneath it.

### `src/components/navigation/HubModalHost.tsx`

- Change the outer wrapper from `z-[70]` → `z-[95]` (above AION widget `z-88`, AION chat `z-81`, and AION overlay `z-79`; still below toasts `z-100` and global gates `z-9999`).
- Update the inline `style={{ zIndex: 70 }}` to `95` to match.
- Keep `bg-background` and the explicit `backgroundColor: 'hsl(var(--background))'` — that already guarantees 100% opacity.
- Header bar already uses `bg-background` (opaque). No change needed.
- Body wrapper already uses `bg-background`. No change needed.

No other files are touched. AION continues to function normally; it is simply visually occluded while a hub modal is open, which matches the user's expectation that the modal owns the screen.

## Out of scope

- AION widget / chat panel z-indexes (left as-is so they stay above normal page content elsewhere).
- `WalletModal`, `FMOnboarding`, `AuroraDock`, `LessonFocusSession` — already at `z-[100]` or higher, so they're already opaque over AION.
- Strategy / Hypnosis routes — those are full pages, not modals, and already render under standard chrome.

## Validation

1. Open side menu → Free Market. Modal fully covers AION widget and any open AION chat.
2. Close hub. AION widget reappears in place.
3. Repeat for Community and Study.
4. Toasts still render above the modal.