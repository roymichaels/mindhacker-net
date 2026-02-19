

# Orb Visual Uniqueness Overhaul -- Full Rendering Pipeline Upgrade

## The Problem

The orb currently renders using `THREE.LineSegments` with `LineBasicMaterial` (wireframe). Even though the DNA system computes 3 colors (primary, secondary, accent), the renderer only applies them as vertex-color tints on wireframe lines. The result: every orb looks like a single-color wireframe with minor hue variations. Additionally, only ~15 of ~65 onboarding variables influence the orb.

## What Changes

The orb will become a solid 3D mesh with custom GLSL shaders that display multi-stop gradients, material styles, surface patterns, and rim lighting. All ~65 onboarding variables will drive distinct visual parameters.

---

## Phase A -- Extend OrbProfile Type + Defaults

**File: `src/components/orb/types.ts`**

Add 15 new fields to the `OrbProfile` interface:

| Field | Type | Range |
|-------|------|-------|
| `gradientStops` | `string[]` | 3-7 HSL strings |
| `gradientMode` | enum | `'vertical' \| 'radial' \| 'noise' \| 'rim'` |
| `coreGradient` | `[string, string]` | Two HSL strings |
| `rimLightColor` | `string` | HSL |
| `materialType` | enum | `'wire' \| 'metal' \| 'glass' \| 'plasma' \| 'iridescent'` |
| `materialParams` | object | `{ metalness, roughness, clearcoat, transmission, ior, emissiveIntensity }` |
| `patternType` | enum | `'voronoi' \| 'cellular' \| 'fractal' \| 'shards' \| 'swirl' \| 'strata'` |
| `patternIntensity` | `number` | 0-1 |
| `particlePalette` | `string[]` | 3-5 HSL strings |
| `particleMode` | enum | `'single' \| 'cycle' \| 'random' \| 'byVelocity' \| 'byRadius'` |
| `particleBehavior` | enum | `'orbit' \| 'spiral' \| 'halo' \| 'burst' \| 'drift'` |
| `bloomStrength` | `number` | 0-1.5 |
| `chromaShift` | `number` | 0-0.8 |
| `dayNightBias` | `number` | 0-1 |

All stored inside the existing `computed_from` JSON column -- no DB schema changes.

**Files: `src/lib/orbProfileGenerator.ts`, `src/hooks/useOrbProfile.ts`**

- Update `DEFAULT_ORB_PROFILE` with defaults for all new fields
- Update `rowToProfile()` and `profileToRow()` to serialize/deserialize new fields from `computed_from` JSON
- Update `interpolateOrbProfiles()` to lerp numeric fields and snap enum fields at t=0.5

---

## Phase B -- Visual DNA from ALL Intake Variables

**New file: `src/lib/visualDNA.ts`**

A single pure function:

```
buildVisualDNA({ step1Intention, step2ProfileData, summaryRow, gameState, seed }): Partial<OrbProfile>
```

This function maps all ~65 onboarding variables to the new visual fields using deterministic `seedFloat`/`seedInt` (no `Math.random`).

### Key Mappings

**Pressure Zone -> Pattern + Motion:**
- `cognitive_overload` -> `shards` pattern, high jitter, `electric` texture
- `energy_instability` -> pulsing brightness, `plasma` pattern
- `direction_fog` -> `swirl` pattern, rotating axis drift
- `lack_of_structure` -> `strata` pattern, more symmetry

**Functional Signals -> Morph + Particles:**
- `racing_thoughts` -> higher noise frequency, faster pulseRate
- `doom_scrolling` -> higher particle count, chaotic drift
- `afternoon_crash` -> darker dayNightBias, lower coreIntensity

**Execution Pattern -> Particle Behavior + Bloom:**
- `start_and_quit` -> `burst` particle behavior
- `overplan_and_delay` -> low motion, "contained energy"
- `burn_out_quickly` -> high bloom + fast morph + periodic dim
- `consistent_but_plateaued` -> stable symmetry, subtle `swirl`

**Motivation Driver -> Material + Gradient:**
- `status` -> `metal` material, crisp rim, high specular
- `freedom` -> `plasma` material, wide gradients, `drift` particles
- `stability` -> low jitter, strong symmetry, muted palette
- `identity_upgrade` -> `iridescent` material, high chromaShift

**Sleep Quality (1-5) -> Material + Smoothness:**
- Low (1-2) -> higher roughness, lower bloom, matte
- High (4-5) -> `glass`/`iridescent`, smoother motion

**Screen Before Bed -> Chroma + Rim:**
- `yes` -> stronger chromaShift + brighter rimLight

**Dopamine Load (screen time + reels + porn) -> Neon + Bloom:**
- High load -> neon particlePalette, `burst`/`halo` behavior, high bloomStrength
- Low load -> calmer palette, fewer particles, `orbit`

**Body Fat + Activity -> Core + Speed:**
- Higher fat + low activity -> heavier coreSize, slower morphSpeed
- High activity -> sharper geometryDetail, faster morphSpeed

**Sunlight After Waking -> Rim Warmth:**
- `yes` -> warm gold rim light
- `no` -> cool cyan rim light

**Cold Exposure -> Pattern + Specular:**
- `yes` -> crystalline `shards` pattern, higher clearcoat

**Caffeine -> Micro-Jitter:**
- 3+ cups -> subtle micro-oscillation on morph

**Stress Default Behavior -> Particle + Pattern:**
- `eat` -> organic/`cellular` pattern, `drift`
- `isolate` -> inward `drift`, darker palette
- `exercise` -> `sparks`/`orbit`

**Friction Trigger -> Edge Sharpness:**
- `perfectionism` -> high symmetry
- `reactivity` -> sharp edges, higher noise frequency

**Urgency Scale (1-10) -> Pulse + Emissive:**
- High -> faster pulse, brighter emissive, aggressive rim

**Restructure Willingness (1-10) -> Complexity:**
- High -> more layers, more gradient stops (up to 7), richer material
- Low -> fewer stops (3), simpler visuals

**Additional mappings:** age bracket (saturation), gender (subtle hue temp), dependents (extra layer), relationship status (warmer secondaries), alcohol/weed frequency (smoother/dreamlike motion).

**File: `src/hooks/useOrbProfile.ts`**

- Update `extractProfileData()` to also read `step_1_intention` data from `launchpad_progress` (pressure_zone, functional_signals, urgency_scale, restructure_willingness)
- Pass both step_1 + step_2 data to `buildVisualDNA()`
- Merge result into the computed profile

**File: `src/lib/orbProfileGenerator.ts`**

- Import and call `buildVisualDNA()` inside `generateOrbProfile()`
- Archetype sets the base palette/geometry; `buildVisualDNA` overrides/enriches material, pattern, gradient, particles

---

## Phase C -- Shader-Based Rendering (Core Change)

**File: `src/components/orb/WebGLOrb.tsx`** (major rewrite)

### Current State (the problem)
Lines 396-431: Creates `WireframeGeometry` + `LineBasicMaterial` with vertex colors. This is why the orb is monochrome wireframe.

### New Rendering Architecture

**Dual-layer approach:**

1. **Outer Solid Mesh** -- `THREE.Mesh` with custom `THREE.ShaderMaterial`
   - Receives all gradient/material/pattern uniforms
   - This is where multi-color gradients, materials, and patterns render

2. **Inner Wireframe Overlay** -- `THREE.LineSegments` at 15-25% opacity
   - Keeps the geometric DNA vibe
   - Uses vertex colors from current system

### New GLSL Fragment Shader

Uniforms:
- `u_colors[7]` (vec3 array) -- gradient stop colors
- `u_colorCount` (int) -- active stop count
- `u_gradientMode` (int) -- 0=vertical, 1=radial, 2=noise, 3=rim
- `u_materialType` (int) -- 0=wire, 1=metal, 2=glass, 3=plasma, 4=iridescent
- `u_patternType` (int) -- 0=voronoi, 1=cellular, 2=fractal, 3=shards, 4=swirl, 5=strata
- `u_patternIntensity`, `u_chromaShift`, `u_bloomStrength`, `u_time`
- `u_rimLightColor`, `u_emissiveIntensity`
- `u_metalness`, `u_roughness`, `u_clearcoat`, `u_transmission`, `u_ior`

Fragment shader pipeline:
1. Compute gradient blend factor from `gradientMode` (normal.y / distance / fbm / fresnel)
2. Sample multi-stop gradient using blend factor
3. Apply pattern overlay (voronoi/cellular/fractal/shards/swirl/strata) mixed by `patternIntensity`
4. Apply material lighting model (metal = high specular; glass = fresnel rim + refraction tint; plasma = animated emissive + noise; iridescent = hue shift by view angle)
5. Add rim light using `rimLightColor`
6. Write emissive channel for bloom pre-pass

### Pattern Functions (GLSL)
- **Voronoi**: Cell noise with hash-based random points
- **Cellular**: Worley noise variant
- **Fractal**: Existing fbm repurposed
- **Shards**: Angular Voronoi with hard edges
- **Swirl**: Polar coordinate distortion
- **Strata**: Horizontal bands with noise displacement

### Post-Processing (Conditional)
- Add `EffectComposer` + `UnrealBloomPass` from Three.js examples
- Controlled by `bloomStrength`
- **Disabled** when orb size <= 120px (HUD) for performance
- Runs at half resolution on mobile

### Morph Animation
- Keep existing deformation logic (fbm + wave layers)
- Apply to the solid mesh geometry (same as current wireframe)
- Wireframe overlay tracks the same deformation

---

## Phase D -- Particle System

**New file: `src/components/orb/OrbParticles.ts`**

A particle system using `THREE.Points` with a custom shader.

### 5 Behaviors

| Behavior | Description |
|----------|-------------|
| `orbit` | Stable circular paths at varying radii |
| `spiral` | Helix paths wrapping the orb |
| `halo` | Concentrated ring at equator |
| `burst` | Periodic outward explosions synced to pulseRate |
| `drift` | Slow Brownian motion / random walk |

### Multi-Color Palette

Each particle gets a color from `particlePalette` based on `particleMode`:
- `single` -- all use palette[0]
- `cycle` -- colors rotate over time
- `random` -- each particle gets random palette color at spawn
- `byVelocity` -- faster = later palette colors
- `byRadius` -- farther = later palette colors

### Integration
- Runs in the same Three.js scene
- Shares the animation loop timing
- Count and speed driven by dopamine load + execution pattern signals

---

## Phase E -- Debug Overlay + Dev Gallery

### Update `src/components/orb/OrbDebugOverlay.tsx`

Add sections for:
- Gradient stop swatches (visual color dots, all 3-7)
- Material type + key materialParams
- Pattern type + intensity
- Particle palette swatches + behavior
- Bloom + chromaShift values
- "Randomize Seed" toggle button (only when ORB_DEBUG=true)

### Update `src/components/gamification/OrbDNACard.tsx`

Add a "Visual Signature" section:
- Gradient stop swatches row
- Material type badge (metal/glass/plasma/iridescent)
- Pattern type badge with intensity bar
- Rim light color swatch
- "Why you got this look" explanatory bullets (generated from the same mapping table in `buildVisualDNA`)

### New `src/pages/dev/OrbGallery.tsx`

A grid page at `/dev/orb-gallery` showing 12 orbs from hardcoded fake profiles with diverse intake combinations:
- Each cell: 150x150 orb + label (archetype + material + pattern)
- Covers all 5 material types, all 6 pattern types, varied archetypes
- Visually confirms diversity

### Route addition in `src/App.tsx`
- Add `/dev/orb-gallery` route (lazy-loaded)

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/orb/types.ts` | Add ~15 new OrbProfile fields + sub-types |
| `src/lib/visualDNA.ts` | **NEW** -- maps all ~65 intake vars to visual params |
| `src/lib/orbProfileGenerator.ts` | Integrate visualDNA, update defaults + interpolation |
| `src/hooks/useOrbProfile.ts` | Read step_1_intention, pass to generator, store new fields |
| `src/components/orb/WebGLOrb.tsx` | Major rewrite: Mesh + ShaderMaterial + patterns + bloom |
| `src/components/orb/OrbParticles.ts` | **NEW** -- particle system with 5 behaviors |
| `src/components/orb/OrbDebugOverlay.tsx` | Add new fields + randomize seed toggle |
| `src/components/gamification/OrbDNACard.tsx` | Add Visual Signature section + "why" bullets |
| `src/pages/dev/OrbGallery.tsx` | **NEW** -- 12-orb diversity test page |
| `src/App.tsx` | Add dev route |

---

## Performance Safeguards

- Bloom disabled for orb size <= 120px (HUD mode)
- Bloom runs at half resolution on all devices
- Pattern GLSL uses simple hash functions (no texture lookups)
- Particle count still capped at 120
- CSS fallback orb (`CSSOrb.tsx`) unchanged -- graceful degradation
- `wire` materialType preserved as an option for backward compatibility

## Migration Safety

- All new fields are optional with sensible defaults
- Existing stored profiles load fine (missing fields get defaults via `rowToProfile`)
- No database schema changes -- everything in `computed_from` JSON
- `interpolateOrbProfiles` handles new fields for smooth 800ms transitions

