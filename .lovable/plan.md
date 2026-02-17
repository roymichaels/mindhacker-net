

## Fix: Remove Forced Equal-Height Columns

### Problem
The last change (`md:items-stretch` + `md:justify-center`) forces both grid columns to fill the entire viewport height. Since the plan column content is shorter than the viewport, it creates a large empty card area below the actual content. The orb also gets pushed to the vertical center instead of sitting at the top.

### Solution

**File: `src/components/dashboard/MobileHeroGrid.tsx`**

Two class changes on existing elements:

1. **Grid container (line 101)**: Replace `md:items-stretch` with `md:items-start` so columns size to their content, not the viewport.

2. **HUD column (line 104)**: Remove `md:justify-center` so the orb sits at the top of its card naturally. Keep `md:overflow-y-auto` and `md:flex md:flex-col` for layout.

### Technical Details

```text
Line 101 (grid wrapper):
  CHANGE: md:items-stretch  -->  md:items-start

Line 104 (HUD column):
  REMOVE: md:justify-center
```

Both columns will now be independently sized to their content height, eliminating the empty space issue.
