---
name: World Atmosphere System
description: Phase 5B.8 + 5C.2 — every cognitive world owns a cinematic environment via per-world AtmospherePreset rendered by WorldAtmosphere, now driven by a continuously evolving WorldClimate from useWorldClimate; AION orb stays the shared presence (only its halo reflects climate)
type: architecture
---
# World Atmosphere System

Concept-art north star reinterpreted natively: worlds are not pages with
backgrounds — they are cinematic environments. UI stays minimal; the
environment carries the emotional experience.

## Contract

- `src/worlds/atmosphere/atmospherePresets.ts` — `AtmospherePreset` per
  `CognitiveWorldId`: `primaryHsl`, `secondaryHsl`, `accentHsl`,
  `depth (1..5)`, `motion` temperament, `light` quality, `particles`,
  `ambient`.
- `src/worlds/atmosphere/WorldAtmosphere.tsx` — pure CSS + framer-motion
  layers (depth floor, two drifting glow fields, light pass per quality,
  climate veil, particulate stardust, edge vignette). Pointer-events off.
- Mounted by `WorldShell` (`fullBleed` when not embedded).
- Reads `useWorldState(worldId)` so momentum/climate modulate ambient
  brightness and tint — worlds visibly come alive with use.
- **Phase 5C.2 — Living Worlds Reactivity Layer:**
  - `src/worlds/runtime/types.ts` — `WorldSignals` (raw axes) and
    `WorldClimate` (luminosity, atmosphericDensity, motionIntensity,
    harmonicStability, particleActivity, resonance, emotionalTemperature,
    temporalCoherence).
  - `src/worlds/runtime/worldSignals.ts` — derives simulated signals per
    world from `worldStateStore` + time oscillators (worlds always breathe).
  - `src/worlds/runtime/worldReactivity.ts` — pure mapping
    `signals → WorldClimate`, world-aware, with per-axis time-constant
    smoothing via `evolveClimate`.
  - `src/worlds/runtime/worldClimateStore.ts` — zustand store; ONLY
    written by `useWorldReactivity()`.
  - `src/worlds/runtime/useWorldClimate.ts` — read hook for atmosphere
    and orb halo.
  - `src/worlds/runtime/useWorldReactivity.ts` + `<WorldsRuntime/>` —
    hidden ~250ms loop mounted once at app root; pauses on
    `document.hidden`. Active world (matched from `/worlds/:id` URL)
    ticks every cycle; background worlds tick less often.
  - `WorldAtmosphere` reads `useWorldClimate(worldId)` and uses it to
    drive fog density, light bloom, depth, motion speed, particle
    activity, environmental pulse, harmonic gradient, and resonance
    shimmer — additively over the existing CSS layers.
  - `PersistentWorldOrb` renders a thin climate halo around AION
    (hue from `emotionalTemperature`, opacity from `luminosity`).
    The orb itself (`CanonicalAionModel`) is never recoloured.

## Rules

- **No images.** All environments are gradients + motion. Concept art is
  reference only — never embedded.
- **AION presence is shared.** `CanonicalAionModel` rendering is owned
  by the shell, not the atmosphere; only framing/role changes per world.
- **Atmosphere never intercepts input.** `pointer-events-none`.
- **Scenes don't paint their own ambient backgrounds anymore.** They
  render structure (orbits, bands, scaffolds); atmosphere does the rest.
- **Adding a world** = add an entry to `ATMOSPHERE_PRESETS`. No other
  changes required for the environment to exist.
- **Environment = interface.** No dashboards, charts, or numeric overlays
  may surface raw climate or signal values. The user feels the system.
- **`worldClimateStore` is write-restricted to `useWorldReactivity()`.**
  All consumers read via `useWorldClimate` / `useAllWorldClimates`.
