
# Homepage Orb Showcase + Content Refresh

## Overview

Update the homepage to feature 10 visually distinct orb presets that continuously morph in 3 locations (Hero, Aurora Coach, Final CTA). Each orb cycles through presets independently with smooth interpolation, showcasing the new shader system (gradients, materials, patterns). The homepage content will also be refreshed to better reflect the app's current capabilities.

## New Files

### 1. `src/lib/orbPresets.ts`

Define 10 hardcoded `OrbProfile` presets, each differing in at least 2 major visual axes:

| Preset | Material | Gradient Mode | Pattern | Geometry | Bloom | Chroma |
|--------|----------|---------------|---------|----------|-------|--------|
| Abyss Glass | glass | radial | cellular | sphere | 0.6 | 0.15 |
| Solar Metal | metal | rim | shards | octa | 0.25 | 0.05 |
| Violet Iridescence | iridescent | noise | voronoi | dodeca | 0.9 | 0.55 |
| Emerald Plasma | plasma | vertical | swirl | spiky | 1.0 | 0.25 |
| Arctic Stone | metal | vertical | strata | icosa | 0.1 | 0.0 |
| Neon Reactor | plasma | noise | fractal | torus | 1.2 | 0.35 |
| Rose Quartz | glass | rim | voronoi | sphere | 0.55 | 0.12 |
| Obsidian Wire | wire | radial | shards | octa | 0.2 | 0.08 |
| Aurora Skin | iridescent | vertical | cellular | dodeca | 0.8 | 0.6 |
| Sunset Marble | metal | noise | strata | icosa | 0.35 | 0.1 |

Each preset includes full `OrbProfile` with 3-7 gradient stops in distinct color palettes, appropriate material params, and motion signatures.

### 2. `src/hooks/useOrbPresetMorph.ts`

A React hook that cycles through presets with smooth morphing:

- **Inputs**: `presets[]`, `durationMs` (morph time, e.g. 2500), `holdMs` (hold time, e.g. 600), `startIndex`
- **Output**: `currentProfile: OrbProfile` (the interpolated result)
- Uses `requestAnimationFrame` for smooth updates
- Easing: smoothstep (ease in-out)
- Uses existing `interpolateOrbProfiles()` for lerp/snap logic
- Geometry family changes: snap at transition boundary (t=1), not mid-morph
- Deterministic: no `Math.random`, just index cycling

## Homepage Section Updates

### 3. `GameHeroSection.tsx` (Hero)

- Replace `<PersonalizedOrb>` with a new `<PresetOrb>` that uses `useOrbPresetMorph` with `startIndex=0`, size 180, bloom enabled
- Keep the orbiting 8 life pillars, 90-day arc, and CTA buttons
- Update size from 140 to 180 for more visual impact

### 4. `AuroraCoachSection.tsx` (Mid-page)

- Replace `<CSSOrb size={320}>` with `<PresetOrb>` using `useOrbPresetMorph` with `startIndex=3`, size 280
- This ensures the Aurora orb cycles through different presets than the hero, so they look distinct at any moment

### 5. `FinalCTASection.tsx` (Bottom)

- Replace `<PersonalizedOrb size={120} disablePersonalization>` with `<PresetOrb>` using `useOrbPresetMorph` with `startIndex=7`, size 160
- Slightly larger for better visual

### 6. `PresetOrb` Component

A lightweight wrapper: `src/components/orb/PresetOrb.tsx`

```
<PresetOrb startIndex={0} size={180} />
```

Internally:
- Imports `ORB_PRESETS` and `useOrbPresetMorph`
- Renders `<Orb profile={currentProfile} size={size} state="breathing" />`
- No personalization, no auth dependency -- pure showcase

## Performance

- Bloom is enabled for all 3 homepage orbs (sizes 160-280, all above 120px threshold)
- Only 3 WebGL canvases on the page (same as current 2 orbs + 1 CSSOrb)
- `requestAnimationFrame` is shared per orb instance (already how WebGLOrb works)
- No particles on homepage orbs (particles disabled in presets)

## Files Summary

| File | Action |
|------|--------|
| `src/lib/orbPresets.ts` | NEW -- 10 preset profiles |
| `src/hooks/useOrbPresetMorph.ts` | NEW -- morph cycling hook |
| `src/components/orb/PresetOrb.tsx` | NEW -- lightweight preset orb wrapper |
| `src/components/home/GameHeroSection.tsx` | Update: use PresetOrb |
| `src/components/home/AuroraCoachSection.tsx` | Update: use PresetOrb |
| `src/components/home/FinalCTASection.tsx` | Update: use PresetOrb |
