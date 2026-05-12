# Mobile-Friendly Avatar Wizard

## Problem
On mobile (≤402px), `AvatarConfiguratorUI` pins a fixed **304px right rail** (username card + 80px category column + 224px asset grid) over the avatar canvas. The avatar is nearly fully covered, the username card overlaps the categories, and the action buttons (randomize/download/save) sit at the bottom of the screen behind the system tab bar. Desktop layout works fine.

## Approach
Split the configurator into two layouts via a `useIsMobile()` breakpoint switch — keep the current desktop right-rail untouched, and add a mobile-native bottom-sheet layout that exposes **every existing feature** without covering the avatar.

## Mobile layout (new)

```text
┌──────────────────────────────┐
│  ⓧ                  👤 שם    │  ← floating top bar (close + username chip→opens sheet)
│                              │
│        [ AVATAR CANVAS ]     │  ← full screen, unobstructed
│                              │
│         🎲  ⬇  💾            │  ← floating action dock (randomize / download / save)
├──────────────────────────────┤
│ שיער פנים עיניים גבות אף ... │  ← horizontal scrolling category tabs
├──────────────────────────────┤
│ צבע: ● ● ● ● ● ● (h-scroll)  │  ← compact color row (when category has palette)
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐    │  ← 3-col asset grid, sheet ~38vh, drag-to-expand to ~70vh
│ │  │ │  │ │  │ │  │ │  │    │
│ └──┘ └──┘ └──┘ └──┘ └──┘    │
└──────────────────────────────┘
```

Behavior:
- **Bottom sheet** (Radix Sheet from `side="bottom"` already used elsewhere in shadcn ui) holds tabs + colors + asset grid; collapses to a 56-px handle when the user wants to inspect the avatar, expands by drag or by tapping a category chip.
- **Username** moves out of the rail into a small chip in the top bar; tapping it opens a small modal/sheet section with the existing input + helper text + save validation logic (unchanged).
- **Action dock** (randomize / download / save) becomes a floating pill above the bottom sheet handle — always reachable, never under iOS home indicator (`pb-[env(safe-area-inset-bottom)]`).
- **Category tabs** become a horizontally scrollable row (`overflow-x-auto`, snap, no scrollbar) so all 15 categories are reachable with a swipe instead of vertical scroll in an 80px column.
- **Asset grid** uses `grid-cols-3` on mobile (vs current 2) so more options are visible without scrolling — same tile component (`AssetTilePreview`).
- "None" removable tile, locked-group warning, and color palette all rendered identically — no feature dropped.

## Desktop layout
Untouched. Same right rail, same widths, same behavior at `sm` and above.

## Files to change
- `src/components/avatar/AvatarConfiguratorUI.tsx` — extract two render branches (`MobileLayout` / `DesktopLayout`) sharing the same store hooks; wire `useIsMobile()`.

No store/data changes; all behavior already lives in `useConfiguratorStore` + `useCommunityUsername`.

## Verification
On the 402×716 preview: avatar visible full-screen, all 15 categories reachable via horizontal scroll, color palette + asset grid expand from bottom, save/randomize/download accessible above the home indicator, username editable from the top chip.
