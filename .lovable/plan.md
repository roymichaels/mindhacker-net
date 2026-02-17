
## Fix Grid Column Height Alignment

### Problem
From the screenshots, the two-column grid on desktop and tablet has mismatched heights -- the orb/HUD column (left) is shorter than the plan column (right), leaving empty space. The columns need to stretch equally so both fill the available viewport height.

### Solution

**File: `src/components/dashboard/MobileHeroGrid.tsx`**

1. **Grid container**: Change from `md:auto-rows-min md:items-start` to `md:grid-rows-[1fr]` (single row that fills available height) and `md:items-stretch` so both columns stretch to the same height.

2. **HUD column (orb + stats)**: Remove `md:sticky md:top-0`. Add `md:overflow-y-auto` so if content exceeds the column height it scrolls internally. Use `md:flex md:flex-col md:justify-center` to vertically center the orb content within the full-height column.

3. **Plan column**: Keep `md:overflow-y-auto` for internal scrolling. Both columns will now share the same height, determined by the grid row which fills the remaining viewport space.

4. **Mobile**: No changes -- mobile remains a single-column stacked layout with natural scrolling.

### Technical Details

```text
Grid Container Changes:
  REMOVE: md:auto-rows-min md:items-start
  ADD:    md:grid-rows-[1fr] md:items-stretch

HUD Column Changes:
  REMOVE: md:sticky md:top-0
  ADD:    md:overflow-y-auto md:justify-center

Plan Column:
  Keep existing md:overflow-y-auto (already has it)
```

This ensures both columns always match the viewport-available height on desktop and tablet, with internal scrolling when content overflows.
