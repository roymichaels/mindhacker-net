---
name: World Atmosphere System
description: Phase 5B.8 + 5C.2 + 5C.3 + 5C.4 + 5C.6 — every cognitive world owns a cinematic environment via WorldAtmosphere, driven by climate + cross-world influence + dream layer + live gesture-as-atmosphere field. Worlds form one shared subconscious ecosystem the user touches, not a UI they operate.
type: architecture
---
# World Atmosphere System

Concept-art north star reinterpreted natively: worlds are not pages with
backgrounds — they are cinematic environments. UI stays minimal; the
environment carries the emotional experience.

## Phase 5D.1B — World Terrain Deepening

`/outer-world` is the flagship "living planetary terrain" surface and
is **always** the primary view. Composition (top → bottom in z, all
below `UZ.anchor`):

- `PlanetHorizonLayer` — wide horizon arc (260vw disc), separate
  parallax planes for body (slow) and rim (mid). Surface city-light
  field is masked to the disc.
- `TerrainValleyLayer` (new, `UZ.structure - 1`) — three SVG ridge
  silhouettes (far/mid/near with progressive blur), perspective ground
  plane, slow drifting fog band (`60s / var(--view-drift)`).
- `AnchorField` → `AnchorPin`s with vertical light **beacon columns**,
  three concentric ground rings (outer one slowly pulses), label
  whisper ABOVE the icon (reference pattern), 6s pin sway.
- `EnergyPath` — 3-pass river (wide soft glow underlay, shimmer stroke,
  flowing light particles via `<animateMotion>`); curve biased downward
  so paths arc *along* the terrain.
- Multi-rate parallax: one `usePresenceParallax` source split into
  distant×0.25 (planet body), mid×0.6 (rim + valley), near×1.0
  (anchors). Real depth, not single-plane shift.
- Top-light wash + scene-local bottom void unify lighting and hand off
  to the composer area.

Legacy `AlignedRealities` is reachable only via a tiny chevron at the
bottom edge that opens it as a `Sheet` overlay. The card-feed surface
is no longer addressable as a primary view — terrain is the only
default for `/outer-world`.

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

## Phase 5C.4 — Dream Layer

The subconscious field lives in `src/worlds/dreams/`:

- `subconsciousField.ts` — persisted store (motifs, archetype affinities,
  per-world residue/reinforcement). Write-restricted to `dreamEngine`.
- `symbolicPatterns.ts` — pure detectors mapping (climate + history +
  residue) → optional `MotifKind` candidate per world per tick.
- `archetypeEmergence.ts` — slow EMA across all worlds onto 6 archetype
  axes (protector/explorer/creator/shadow/sage/rebel).
- `dreamEngine.ts` — `<DreamRuntime />` mounted once in `App.tsx`. Ticks
  every ~12s, decays long-term memory, refreshes archetypes, and rolls
  rare emergence events. Pauses while the tab is hidden.
- `useDreamState.ts` — read-only hooks (`useActiveDreamEvents`,
  `useWorldMotifs`, `useSubconsciousSnapshot`, `useDominantArchetype`).

Active `DreamEvent`s render in `WorldAtmosphere` as the `DreamPhenomenon`
sub-component — single low-opacity motion layers per kind, hue biased
by the motif's resonant archetype. Lifespans 18–70s, intensities capped
≤ 0.45.

Rules:
- Dream effects must remain rare, subtle, ambiguous, never literal.
- Never surface motif names, archetype labels, residue numbers, or
  causal explanations in the UI.
- AION may quietly reference recurring symbolic phenomena via
  `useSubconsciousSnapshot` / `useDominantArchetype`, but must never
  over-explain meaning.
- `useSubconsciousFieldStore` is write-restricted to `dreamEngine`.

## Phase 5C.6 — Gesture as Atmosphere

The world stops being something the user *operates* and starts being a
field they *affect*. Lives in `src/worlds/gesture/` + `src/worlds/scene/WorldGestureField.tsx`:

- `gesture/types.ts` — `GestureEnergy { dwell, swipe, pulse, swipeAngle, focal, lastAt }`,
  `GestureKind = 'dwell' | 'swipe-up' | 'swipe-down' | 'swipe-h' | 'pulse' | 'tap'`,
  `GestureVerbResolver`.
- `gesture/gestureFieldStore.ts` — zustand store keyed by `CognitiveWorldId`.
  Energies decay exponentially (τ ≈ 1.4–2.2s). **Decay is owned by
  `useWorldReactivity` only** — single scheduler.
- `gesture/gestureBindings.ts` — per-world `GestureKind → verb id`
  resolvers (defaults by intent shape; `emotions`, `habits`, `memory`,
  `higher` override).
- `scene/WorldGestureField.tsx` — transparent overlay (`absolute inset-0`,
  scoped to the immersive world container, not viewport-fixed).
  Detects: dwell ≥ 600ms, swipe ≥ 40px in ≤ 600ms, 3-tap-pulse in 800ms.
  Each gesture pushes energy into the field, anchors a faint accent
  ripple at the focal point (opacity ≤ 0.32, ≤ 1.4s), and fires a verb
  via the resolver through the existing `useGraphMutator` pipeline.
- `worldSignals.ts` folds live `GestureEnergy` into the signal vector
  (`applyGestureBias`) — dwell deepens recovery+density, swipe lifts
  arousal+memory activity, pulse spikes creative+tension. Climate
  runtime then re-maps these into the visible atmosphere.
- The bottom-edge `AmbientGesture` button is retired; the world itself
  is the affordance. AmbientGesture file is left as legacy reference.

Rules:
- The gesture field never opens menus, never shows verb names. Verbs
  manifest as atmospheric change + the existing graph mutation pipeline.
- Ripple opacity is capped (`dwell` ≤ 0.32, others ≤ 0.22). Never paint
  visible UI affordances inside the field.
- `gestureFieldStore.decayAll` may only be called from `useWorldReactivity`.
- Pointer events from elements with `[data-no-gesture-field]`, real
  buttons, links, inputs, or `[role="button"]` are passed through.

## Phase 5C.7 — World-Specific Interaction Physics

Each Cognitive World owns a `WorldPhysics` law in
`src/worlds/physics/worldPhysicsRegistry.ts`. Identical gestures shape
each world differently:

- `mutateSignals(signals, energy)` — slow per-world signal bias
  (replaces the generic `applyGenericGestureBias` for any world that
  has a registered law). Read by `worldSignals.deriveWorldSignals`.
- `mutateClimate(climate, energy)` — fast climate shove applied AFTER
  `evolveClimate` each tick. Bypasses climate time-constants for the
  immediate felt response (turbulence, fog, fracture, drift).
- `onGesture(event)` — symbolic emergence hook. May return a
  low-intensity (≤ 0.4) `DreamEvent` that is pushed into the
  subconscious field by `physics/dispatchGesture.ts` (de-duped per
  active kind/world).

Per-world feel summary:
- Emotions: dwell thickens fog, slow swipes calm weather, sharp swipes turbulent.
- Habits: circular gestures stabilise orbits, pulse builds rhythm, sharp lateral swipes drift.
- Memory: drag wakes timeline + particles, dwell summons fragments, fast movement blurs.
- Relationships: dwell pulls + reveals tension, sharp swipes increase distance.
- Beliefs: dwell stabilises structure, sharp swipes fracture, pulse charges.
- Creativity: pulse births shards, swipes scatter, dwell allows form.
- Higher Self: stillness coheres, movement fades the field, dwell expands depth.
- Archetypes: dwell reveals silhouettes, movement shifts masks, pulse awakens.
- Self: calm container — dwell deepens, never chaotic.

Rules:
- Physics laws are pure functions; clamp 0..1 (or -1..1 for temperature).
- `onGesture` events must cap `intensity ≤ 0.4` and lifespan ≤ ~40s.
- No UI, no labels, no controls. Effects are felt only via climate +
  dream layer.
