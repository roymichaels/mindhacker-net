
# Fix Black Orb — Root Cause Analysis and Fix

## Root Causes Identified

1. **Shader brightness floor is broken**: The GLSL fallback at line 369 does `finalColor = max(finalColor, baseColor * 0.15)`, but if ALL gradient uniform colors are (0,0,0), then `baseColor` is also (0,0,0), and the floor does nothing. The orb stays black.

2. **`parseHslToThreeColor` fallback produces black**: When `normalizeHsl` fails to match a string, it passes through to `new THREE.Color(colorStr)`. For invalid strings like `"NaN 80% NaN%"`, THREE.Color may silently produce black or incorrect values.

3. **No NaN guard in `makeHSL`**: The `makeHSL` function in `visualDNA.ts` does `Math.round(h % 360)` — if `h` is NaN (from a division or arithmetic with undefined values), the output is `"NaN S% L%"`.

4. **All stored orb profiles have null visual DNA fields**: The DB `computed_from` column contains no `gradientStops`, `materialType`, etc. — the auto-save comparison only checks old fields (primaryColor, accentColor, etc.) so the new visual fields never trigger a save.

## Fixes (4 files)

### File 1: `src/components/orb/WebGLOrb.tsx`

**Fix A — Remove THREE.Color fallback entirely**: In `parseHslToThreeColor`, replace the `new THREE.Color(colorStr)` fallback with a direct return of `FALLBACK_RGB`. The manual `hslToRgbDirect` path handles all valid HSL strings; anything that doesn't match should get the blue fallback immediately.

**Fix B — Shader brightness floor uses constant**: Change the GLSL brightness floor from:
```
finalColor = max(finalColor, baseColor * 0.15);
```
to:
```
finalColor = vec3(0.15, 0.35, 0.55);
```
This ensures a visible blue even if ALL inputs are zero.

**Fix C — Guard `normalizeHsl` against NaN**: Add a check at the top of `normalizeHsl`: if the input contains `NaN`, return the fallback HSL string `"200 80% 50%"`.

### File 2: `src/lib/visualDNA.ts`

**Fix D — Guard `makeHSL` against NaN**: Add NaN checks for h, s, l parameters. If any is NaN, substitute safe defaults (h=200, s=70, l=50).

### File 3: `src/hooks/useOrbProfile.ts`

**Fix E — Trigger auto-save for new visual fields**: Add `gradientStops` length and `materialType` to the `needsUpdate` comparison so the new visual DNA gets persisted to DB.

**Fix F — Force re-save for profiles with null visual DNA**: If `storedProfile` exists but has no `gradientStops` (from before the visual DNA upgrade), trigger a save with the freshly computed profile.

### File 4: `src/lib/orbProfileGenerator.ts`

**Fix G — Validate gradient stops contain no NaN**: After `buildVisualDNA` returns, scan all gradient stop strings for "NaN" and replace any broken stops with the `VISUAL_DEFAULTS.gradientStops` entries.

## Files Summary

| File | Changes |
|------|---------|
| `src/components/orb/WebGLOrb.tsx` | Remove THREE.Color fallback, fix shader floor to constant, guard normalizeHsl against NaN |
| `src/lib/visualDNA.ts` | Guard makeHSL against NaN inputs |
| `src/hooks/useOrbProfile.ts` | Expand auto-save comparison to include new visual fields, force re-save for null visual DNA |
| `src/lib/orbProfileGenerator.ts` | Post-validation scan for NaN in gradient stops |
