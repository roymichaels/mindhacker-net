

## Root Cause Analysis

After tracing through the component hierarchy, the reason 100+ attempts failed is that **the orb element itself has hardcoded `minWidth` and `minHeight` inline styles** (in `WebGLOrb.tsx`, line 742-746):

```
style={{
  width: size,
  height: size,
  minWidth: size,    // <-- THIS prevents shrinking
  minHeight: size,   // <-- THIS prevents shrinking
  ...
}}
```

No amount of `overflow: hidden`, `min-h-0`, `max-h-full`, `grid-rows-1`, or `flex` constraints on parent containers can override a child's explicit `minWidth`/`minHeight`. The 280px orb physically forces the HUD column to be at least 280px tall, causing the overflow you see.

## Fix Plan

### Step 1: Remove rigid min-size from WebGLOrb

In `src/components/orb/WebGLOrb.tsx`, remove `minWidth: size` and `minHeight: size` from the container's inline style. Keep `width` and `height` so it renders at the desired size, but allow CSS parents to clip/constrain it.

### Step 2: Contain the orb on desktop in MobileHeroGrid

In `src/components/dashboard/MobileHeroGrid.tsx`, wrap the desktop orb in a container with `overflow-hidden` and `max-h-full` so it clips gracefully if the grid row is shorter than 280px. The orb will render at full size but the container will visually crop it to fit.

### Step 3: Clean up accumulated workarounds

Remove the inline `style={{ overflow: 'hidden', minHeight: 0 }}` and `style={{ flex: '1 1 0', minHeight: 0 }}` hacks that were added in previous attempts, replacing them with clean Tailwind classes now that the root cause is fixed.

## Technical Details

- `WebGLOrb.tsx` line 745-746: delete `minWidth: size` and `minHeight: size`
- `MobileHeroGrid.tsx` line 104: clean up inline styles, use `md:overflow-hidden md:min-h-0`
- `MobileHeroGrid.tsx` line 166: use `overflow-hidden min-h-0 flex-1` without inline styles
