---
name: World Atmosphere System
description: Phase 5B.8 + 5C.2 + 5C.3 — every cognitive world owns a cinematic environment via WorldAtmosphere, driven by a continuously evolving WorldClimate (useWorldClimate) AND cross-world resonance bleed (useCrossWorldInfluence); worlds form one shared subconscious field. AION orb stays the shared presence (only halo reflects state).
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
- **Phase 5C.3 — Cross-World Resonance + Subconscious Continuity:**
  - `src/worlds/resonance/types.ts` — `WorldResonanceSignal`,
    `WorldClimateBleed`, `WorldEcho`, `WorldInfluence`,
    `WorldHistoryFrame`, `WorldHistorySummary`.
  - `src/worlds/resonance/resonanceGraph.ts` — directed
    `RESONANCE_GRAPH[from][to] = { weight, delayMs, axes }` encoding
    psychological priors (Higher Self stabilises all; Habits steady
    Emotions; Memory colours Emotions; Relationships fuel Creativity;
    unresolved tension fragments downstream).
  - `src/worlds/resonance/worldStateHistory.ts` — persisted ring buffer
    + EMA summary per world. Used to look up source signals at each
    edge's `delayMs` so cross-world echoes arrive subconsciously, not
    instantly.
  - `src/worlds/resonance/worldPropagation.ts` — `emitResonanceSignal`,
    `propagateInfluence`, `applyBleed`, plus the write-only
    `useWorldInfluenceStore`. The runtime tick now does:
    1) evolve own climate, 2) emit signals, 3) propagate via graph,
    4) apply small bleed to climate, 5) publish influence + push history.
  - `src/worlds/resonance/useCrossWorldInfluence.ts` — read hook for
    atmosphere consumers.
  - `WorldAtmosphere` adds three subconscious layers driven by influence:
    foreign-world echo (accent of dominant partner), fragmentation
    flicker (low-stability cross-pressure), contamination veil (high
    cumulative downstream pressure).
  - **Bleed is capped tiny.** Foreign signals can only colour a world,
    never override its identity.
  - **`useWorldInfluenceStore` and `useWorldHistoryStore` are
    write-restricted to the runtime loop.**

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
- **Cross-world effects must remain subtle, atmospheric, cumulative.**
  Never expose causal arrows, partner names, or influence strengths
  in the UI.
