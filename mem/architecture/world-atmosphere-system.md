---
name: World Atmosphere System
description: Phase 5B.8 — every cognitive world owns a cinematic environment via per-world AtmospherePreset (palette spine, depth tier, motion temperament, light quality, particle density) rendered by WorldAtmosphere; AION orb stays the shared presence
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
