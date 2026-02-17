

## Fix Two-Column Height Alignment on Tablet/Desktop

The problem is that the left HUD column (with the orb) and the right plan column have mismatched heights. The HUD column stretches tall while the plan content ends shorter, creating an asymmetrical layout.

### Root Cause

The plan column (COL 2) has `md:flex-none` which prevents it from stretching to fill its grid cell. Meanwhile the HUD column grows freely with the orb. Both columns need to fill their grid cell equally.

### Changes

**File: `src/components/dashboard/MobileHeroGrid.tsx`**

1. **Plan column (line 208)**: Replace `md:flex-none` with `md:h-full` so it stretches to match the HUD column height within the grid cell.

2. **Grid wrapper (line 116)**: Keep `md:auto-rows-fr` (already correct) to ensure equal row heights, and add `md:items-stretch` to force both columns to fill the full grid cell height.

3. **Plan column inner content**: Add `flex-1` to the collapsible rows wrapper area so the plan cards distribute evenly within the stretched column.

This will make both columns visually match in height on tablet and desktop screens.

