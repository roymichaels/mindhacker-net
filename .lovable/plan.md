## Mobile avatar wizard fixes

Two visible problems in the current mobile layout (`src/components/avatar/AvatarConfiguratorUI.tsx`, mobile branch):

1. The floating Randomize / Download dock is positioned at `bottom-[calc(var(--sheet-h)+12px)]`, which lands directly on top of the asset thumbnails inside the sheet.
2. The expanded sheet takes `62vh`, plus the top username chip eats more space, leaving the avatar cropped (only the hat is visible).

### Changes (UI only, single file)

**`src/components/avatar/AvatarConfiguratorUI.tsx` — mobile branch only**

- Remove the floating action dock (Randomize / Download) that sits between the canvas and the sheet.
- Move Randomize and Download into the sheet header, inline with the drag handle:
  - Layout: `[Randomize]   ——drag handle——   [Download]` in a single `flex items-center justify-between` row.
  - Tapping the handle area still toggles expand/collapse; the two buttons stop propagation so taps on them don't toggle the sheet.
  - Use the same circular `bg-secondary/90` styling, smaller (h-9 w-9) so the header stays compact.
- Reduce default sheet height from `62vh` to `52vh` so more of the avatar is visible. Collapsed height stays `112px`.
- When collapsed, keep the same header row visible (handle + 2 buttons) so Randomize/Download remain reachable without expanding.
- Keep the top username chip + Save button row unchanged.
- Keep the asset grid (`grid-cols-3`), color row, and category tabs unchanged.

### Out of scope

- Desktop layout (untouched).
- Camera / canvas framing (not the cause — the sheet height is what's cropping the avatar).
- Store, data, save logic.

### Files changed

- `src/components/avatar/AvatarConfiguratorUI.tsx`
