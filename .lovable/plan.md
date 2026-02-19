

# Fix Black Orb Bug + Upgrade DNA Modal to Visual Resume

## Goal A: Fix Black Orb After Onboarding

### Root Cause
The `parseHslToThreeColor` function in `WebGLOrb.tsx` only handles specific HSL string formats, and applies an aggressive lightness adjustment (lines 63-66) that can crush colors to near-black. Additionally, when `gradientStops` contains values that fail parsing, the fallback is `new THREE.Color(colorStr)` which often produces black. There is also no safety net: if `emissiveIntensity` is low and the lighting path multiplies everything down, the orb goes dark.

### Fixes

**File: `src/components/orb/WebGLOrb.tsx`**
1. Rewrite `parseHslToThreeColor` to remove the aggressive lightness adjustment that crushes colors to dark values. Keep a simple, faithful HSL-to-RGB conversion.
2. Add a `normalizeHsl` helper that handles both `"hsl(210, 80%, 60%)"` and `"210 80% 60%"` formats, always outputting `"H S% L%"`.
3. Add a fallback in `parseHslToVec3`: if the parsed color is near-black (r+g+b < 0.1), substitute a known-good blue.
4. In the gradient color uniform builder, ensure `gradientStops.length >= 3` before building uniforms -- if fewer, pad with VISUAL_DEFAULTS stops.
5. Clamp `emissiveIntensity` to at least 0.05 for non-wire materials in the uniform setup, so the shader always has some light.

**File: `src/hooks/useOrbProfile.ts`**
6. In `rowToProfile()`, add a validation pass after building the profile: if `gradientStops` is empty or has fewer than 3 entries, replace with `VISUAL_DEFAULTS.gradientStops`. Same for `materialParams` fields (ensure emissiveIntensity >= 0.05).

**File: `src/lib/orbProfileGenerator.ts`**
7. After merging Visual DNA overrides (`{ ...baseProfile, ...visualDNA }`), validate the merged result: ensure `gradientStops.length >= 3`, `materialParams.emissiveIntensity >= 0.05`, and all HSL strings are in correct format.

## Goal B: Upgrade DNA Modal to Visual Resume

**File: `src/components/gamification/OrbDNACard.tsx`** (rewrite)

Replace the current 5-section layout (Archetype Blend, Hobbies, Behavioral Signature, Orb Stats, Color Palette) with a richer "Visual Resume" layout:

### New Sections

1. **Archetype Blend** (keep existing) -- archetype bars with percentages

2. **Visual Signature** (NEW)
   - Gradient stops swatches row (3-7 colored circles with "Stop 1..N" labels)
   - Material badge (metal/glass/plasma/iridescent/wire) with icon
   - Pattern badge (voronoi/cellular/fractal/shards/swirl/strata) with intensity meter bar
   - Rim light color swatch + core gradient 2-swatch display
   - Bloom strength + ChromaShift shown as small progress meters
   - If fields are defaults, show subtle "(defaults)" tag

3. **Motion Signature** (NEW)
   - Small meters for: morphIntensity, morphSpeed, pulseRate, smoothness
   - "Energy feel" label derived from these values (e.g., "Calm", "Sharp", "Chaotic", "Steady")

4. **Complexity** (NEW)
   - layerCount, geometryDetail, fractalOctaves as stat chips
   - Geometry family badge
   - particleEnabled status ("Particles: On/Off")

5. **Why You Look Like This** (NEW)
   - 4-8 bullets from `getVisualDNAExplanations()` (already implemented in visualDNA.ts)
   - Each bullet explains which intake variable drove which visual parameter
   - Hebrew translations for each bullet

6. **Color Palette** (keep existing but expand to show all gradientStops, not just primary/secondary/accent)

7. **Dev Debug** (conditional: only when `localStorage.ORB_DEBUG === 'true'`)
   - Collapsed raw profile JSON section
   - Shows gradientStops count, materialType, patternType, normalized HSL strings

### Hebrew Support
All new section headers and labels get Hebrew translations. The "why" bullets need bilingual versions (the current `getVisualDNAExplanations` returns English only -- add Hebrew support).

**File: `src/lib/visualDNA.ts`**
- Update `getVisualDNAExplanations` to accept a `language` parameter and return bilingual explanations.

## Files Summary

| File | Action |
|------|--------|
| `src/components/orb/WebGLOrb.tsx` | Fix HSL parsing, add validation, clamp emissive |
| `src/hooks/useOrbProfile.ts` | Add profile validation in rowToProfile |
| `src/lib/orbProfileGenerator.ts` | Validate merged profile after Visual DNA merge |
| `src/components/gamification/OrbDNACard.tsx` | Full upgrade to Visual Resume layout |
| `src/lib/visualDNA.ts` | Add Hebrew support to getVisualDNAExplanations |

