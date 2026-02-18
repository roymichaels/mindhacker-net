

# Orb Visual Differentiation and Debugging Overhaul

## Root Cause Analysis

The orb looks nearly identical for all users because of several compounding issues:

1. **No per-user seed**: Two users with similar (or empty) data get the exact same geometry, colors, and motion. There is no user_id-based randomization.
2. **Silent fallback to defaults**: When data is missing (no launchpad progress, no summaries), `generateOrbProfile` quietly returns the same `DEFAULT_ORB_PROFILE` for everyone with no indication anything is wrong.
3. **Conservative parameter ranges**: morphIntensity (0.3-0.8), motionSpeed (~1.0), pulseRate (~1.0) -- too narrow to produce visible differences.
4. **Geometry locked to palette ID**: `getGeometryForPalette()` maps only 6 palette strings to geometry combos. The profile's archetype blend computes custom colors but the palette ID used for geometry selection often falls through to 'custom' or 'theme', which defaults to `explorer` geometry every time.
5. **Stored profile loses data**: `rowToProfile()` hardcodes `motionSpeed: 1.0`, `pulseRate: 1.0`, `textureType: 'flowing'` -- discarding the computed values.
6. **No transition system**: Profile changes cause a full scene teardown/rebuild, not a smooth morph.

## Plan Overview

### Step A -- Debug Overlay and Logging

- Create `src/components/orb/OrbDebugOverlay.tsx`: a small floating panel rendered next to the Orb when debug mode is active.
- Debug mode activated via `localStorage.setItem('ORB_DEBUG', 'true')` -- no env variable needed, works in production too.
- The overlay displays: user_id, seed, dominant/secondary archetypes with weights, all 3 colors (with swatches), geometry family, textureType, particleCount, motionSpeed, pulseRate, morphIntensity, and a "Data Sources" section showing which fields are present vs missing (hobbies, traits, priorities, decisionStyle, conflictStyle, summaryData, gameState).
- Console logging (guarded by the same flag) at profile computation time showing the full input and output.
- Integrate overlay into `PersonalizedOrb.tsx` -- render it as an absolute-positioned child when debug is on.

### Step B -- Diagnostic Mode for Missing Data

- Add an optional `diagnosticState` field to `OrbProfile` (e.g., `'ok' | 'missing_data' | 'no_user'`).
- Add a `missedFields: string[]` array to track what is absent.
- In `useOrbProfile.ts`, after computing the profile, check: does the user have at least one real data source (launchpad_progress with step_2_profile_data, OR launchpad_summaries, OR game_state level > 1)? If not, mark `diagnosticState = 'missing_data'` and list what is missing.
- In `PersonalizedOrb.tsx`, when `diagnosticState === 'missing_data'`, apply a grayscale desaturated color override and reduce particles to 5. The debug overlay (always visible in diagnostic mode regardless of ORB_DEBUG flag) shows the missing fields list.

### Step C -- User-Scoped Data and Cache Correctness

- Audit `useOrbProfile`: queries already filter by `user?.id` -- this is correct.
- Fix `rowToProfile()` to preserve `motionSpeed`, `pulseRate`, `smoothness`, `textureType`, `textureIntensity` from `computed_from` JSON instead of hardcoding defaults.
- Fix `profileToRow()` to store all computed fields in `computed_from`.
- Add `orb_profile_version` to `computed_from` -- a hash of the input data. When version changes, trigger `interpolateOrbProfiles()` for smooth transition.
- Ensure `useMemo` dependencies include all relevant source objects (already mostly correct, but add summaryRow dependency explicitly).

### Step D -- Deterministic Per-User Seed

- Create `src/lib/orbSeed.ts` with a `hashUserId(userId: string): number` function (FNV-1a hash producing a stable 32-bit integer).
- Pass `seed` into `generateOrbProfile` and `computeAvatarDNA`.
- The seed drives:
  - **Geometry family rotation**: Within each archetype's allowed geometry set (2-3 options), `seed % options.length` picks which variant.
  - **Hue offset**: `(seed % 30) - 15` degrees added to blended archetype hue, creating subtle but visible color shifts between same-archetype users.
  - **Noise phase offset**: `(seed % 1000) / 1000` as an initial morphPhase, so animations start at different points.
  - **Particle drift direction**: seed-based angle for particle orbit pattern.

### Step E -- Wider Parameter Ranges and Structural Variance

- Modify `generateOrbProfile` / `dnaToOrbProfile` parameter calculations:
  - `morphIntensity`: range 0.15 -- 0.95 (currently ~0.3-0.7)
  - `motionSpeed`: range 0.5 -- 2.2 (currently ~0.7-1.4)
  - `pulseRate`: range 0.4 -- 2.8 (currently ~0.7-1.5)
  - `layerCount`: range 1 -- 5 (currently 1-4)
  - `particleCount`: range 0 -- 120 (currently 0-60, capped for performance)
  - `fractalOctaves`: range 2 -- 6 (already this range but clamped tighter in practice)
- Add seed-based geometry family selection to `OrbProfile` (new field `geometryFamily`): one of `'sphere' | 'torus' | 'dodeca' | 'icosa' | 'octa' | 'spiky'`.
- The seed + archetype together determine geometry, so two warriors with different user_ids can get different base shapes.

### Step F -- Renderer Support for New Variants

- In `WebGLOrb.tsx`:
  - Replace `getGeometryForPalette(paletteId)` with `getGeometryFromProfile(profile)` that reads the new `geometryFamily` field.
  - Add `textureType` influence on the noise function: different texture types use different fbm parameters (e.g., 'crystalline' uses sharper noise with higher frequency, 'ethereal' uses smoother with more octaves, 'electric' adds a step function for sparky edges).
  - Add particle style variation: the existing `ParticleSystem` gets a `style` parameter that adjusts particle size, opacity curve, and drift pattern based on profile data.
  - Support subdivision range 2-6 based on `geometryDetail` from profile (already partially supported).

### Step G -- Smooth Transitions

- In `PersonalizedOrb.tsx`, track `prevProfile` via `useRef`.
- When `profile` changes, run `interpolateOrbProfiles(prevProfile, newProfile, t)` over 800ms using `requestAnimationFrame`.
- Pass the interpolated profile to the Orb during transition.
- For geometry family changes (which require scene rebuild), cross-fade opacity between old and new canvas over 600ms.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/lib/orbSeed.ts` | Create -- FNV-1a hash function |
| `src/components/orb/OrbDebugOverlay.tsx` | Create -- debug panel component |
| `src/components/orb/types.ts` | Modify -- add `diagnosticState`, `missedFields`, `geometryFamily`, `seed` fields |
| `src/lib/orbProfileGenerator.ts` | Modify -- accept seed, widen ranges, add geometry family selection |
| `src/lib/avatarDNA.ts` | Modify -- accept seed for noise/geometry offsets |
| `src/hooks/useOrbProfile.ts` | Modify -- add seed computation, diagnostic detection, version tracking |
| `src/components/orb/PersonalizedOrb.tsx` | Modify -- integrate debug overlay, diagnostic rendering, smooth transitions |
| `src/components/orb/WebGLOrb.tsx` | Modify -- read geometryFamily from profile, texture type variations, particle styles |
| `src/lib/orbVisualSystem.ts` | Modify -- add geometry family mapping function |

## How to Verify

- **Toggle debug**: Open browser console, run `localStorage.setItem('ORB_DEBUG', 'true')` and refresh. A debug panel appears next to the Orb showing all computed values.
- **Per-user differentiation**: Log in as two different users -- even with identical onboarding answers, the seed-based hue offset + geometry rotation produces visibly different orbs.
- **Diagnostic mode**: Create a user who has not completed onboarding -- the orb renders in a desaturated/grayscale state with a "Missing Data" indicator.
- **Reactivity**: Complete an onboarding step -- the orb smoothly transitions to the new profile within ~800ms.

