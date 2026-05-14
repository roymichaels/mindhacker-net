
# Phase 5C.2 — Living Worlds Reactivity Layer

Goal: evolve the Cognitive Worlds from static immersive scenes into continuously living psychological environments. Each world derives a live `WorldClimate` from simulated signals (habits consistency, emotional intensity, memory density, social activity, creative flow, recovery, momentum, tension), and `WorldAtmosphere` reads that climate to physically reshape light, fog, depth, motion, particle density, harmonic gradients, and pulse — even while the user is idle.

AION never changes. The orb stays canonical and persistent. The worlds change around it.

No dashboards, no numbers, no analytics UI. The user feels the system; never reads it.

---

## Architecture

```text
                           simulated signals
                                  │
          ┌───────────────────────┴───────────────────────┐
          ▼                                               ▼
  worldSignals.ts  ──►  worldReactivity.ts  ──►  useWorldClimate(worldId)
          │                     ▲                          │
          │                     │                          ▼
          │             useWorldMomentum             WorldAtmosphere
          │             useCrossWorldResonance       (reads climate live)
          │                     ▲                          │
          └─── worldStateStore ─┘                          ▼
                                                   PersistentWorldOrb
                                                   (subtle climate halo only)

                    useWorldReactivity()  ── hidden runtime tick (rAF / interval)
                       evolves all worlds even when user is idle
```

`worldStateStore` (already exists) remains the source of truth for real interaction-derived state (momentum, climate, tensions). Phase 5C.2 adds a **runtime layer on top** that fuses that real state with simulated derived signals into a richer continuous `WorldClimate` consumed by the atmosphere.

---

## New files

### `src/worlds/runtime/types.ts`
Defines:
- `WorldSignals` — the raw per-world input axes:
  ```
  habitsConsistency, emotionalIntensity, journalingDensity,
  memoryActivity, relationshipActivity, creativeActivity,
  burnoutPressure, recoveryLevel, longTermMomentum,
  unresolvedTension
  ```
  All `0..1`. Optional per world; runtime fills sensible defaults.
- `WorldClimate` (exact shape specified):
  ```
  luminosity, atmosphericDensity, motionIntensity,
  harmonicStability, particleActivity, resonance,
  emotionalTemperature, temporalCoherence
  ```
- `WorldMomentumSnapshot`, `CrossWorldResonance` — small typed structs.

### `src/worlds/runtime/worldSignals.ts`
- Pure functions that **derive simulated signals** per world from existing `worldStateStore` state plus time-based oscillators (sine drifts at world-specific periods so nothing ever feels frozen).
- Per-world signal recipes (e.g. Habits emphasises consistency/momentum, Emotions emphasises intensity/tension, Memory emphasises density/longTermMomentum, Higher reduces noise toward coherence).
- No external data required. Believable scaffolding now; trivial to swap to real signals later.

### `src/worlds/runtime/worldReactivity.ts`
- Pure mapping `signals → WorldClimate`, world-aware (each world weights axes differently — Habits favours `harmonicStability`, Emotions favours `emotionalTemperature`/`atmosphericDensity`, Memory favours `particleActivity`/`temporalCoherence`, Creative favours `resonance`/`motionIntensity`, Higher favours `temporalCoherence`/low `motionIntensity`).
- Smooths between previous and next climate using a per-axis lerp (so changes are continuous, never jumpy).
- Exposes `evolveClimate(prev, signals, dt)`.

### `src/worlds/runtime/useWorldClimate.ts`
- React hook returning the current `WorldClimate` for a `worldId`.
- Subscribes to a tiny zustand store (`worldClimateStore`, internal to this module) that the runtime loop updates.
- Selector-friendly so consumers re-render only when their world's climate slice changes.

### `src/worlds/runtime/useWorldMomentum.ts`
- Hook deriving a smoothed momentum snapshot per world (long-window EMA over `worldStateStore.momentum` + simulated `longTermMomentum` oscillation).
- Used by `WorldAtmosphere` to bias depth and bloom.

### `src/worlds/runtime/useCrossWorldResonance.ts`
- Computes pairwise resonance between worlds (e.g. Emotions ↔ Relationships, Habits ↔ Higher, Memory ↔ Self) from their climates and recent interaction overlap.
- Returns the active world's `resonance` value (already part of `WorldClimate`) plus the dominant partner world id (for future use; not rendered yet).

### `src/worlds/runtime/useWorldReactivity.ts`
- The **hidden runtime loop**. Mounted once at app root (next to `PersistentWorldOrb`).
- Uses a single `setInterval` (~250ms) plus an idle `requestAnimationFrame` micro-tick for the active world only.
- For each known world: gathers signals → evolves climate → writes to `worldClimateStore`.
- Pauses heavy work when `document.hidden`; resumes on visibility.

---

## Edits to existing files

### `src/worlds/atmosphere/WorldAtmosphere.tsx`
Extend (do not rewrite) so atmosphere reads `useWorldClimate(worldId)` in addition to the existing preset + `worldStateStore`. Climate now drives:
- **fog density** → secondary gradient alpha + bottom haze opacity
- **light bloom** → glow A/B size and opacity scaled by `luminosity`
- **volumetric depth** → parallax distance + extra depth band when `temporalCoherence` high
- **particle count / activity** → `particles` density multiplied by `particleActivity`; per-particle twinkle speed from `motionIntensity`
- **motion speed** → `MOTION_DRIFT` durations divided by `(0.6 + motionIntensity)`
- **environmental pulse** → low-frequency opacity oscillation amplitude scaled by `1 - harmonicStability`
- **background harmonic gradient** → hue blended by `emotionalTemperature` (cool → warm) on the climate veil
- **resonance shimmer** → faint cross-world hue tint when `resonance > 0.5`

All changes are additive to the existing CSS layers. No new images, no canvas. Keeps `pointer-events: none`.

### `src/worlds/orb/PersistentWorldOrb.tsx`
- Keep canonical orb identical.
- Wrap orb in a thin halo `div` whose `box-shadow`/`background` opacity is biased by the active world's `luminosity` and `emotionalTemperature` (hue shift only on the *halo*, never the orb itself).
- Orb palette, geometry, and motion remain untouched. This satisfies "subtly reflects world climate through surrounding atmosphere only".

### `src/App.tsx`
- Mount `useWorldReactivity()` once (e.g. inside a tiny `<WorldsRuntime />` component placed next to `<PersistentWorldOrb />`).
- No other changes.

### `src/worlds/scene/WorldShell.tsx`
- Pass through nothing new structurally. `WorldAtmosphere` already self-subscribes.
- Optional: forward `motionIntensity` to `AmbientGesture` so the gesture's breathing rate matches the world's pulse (small, optional; can be deferred).

---

## Reactivity recipes per world

Implemented inside `worldReactivity.ts`. Examples:

- **Habits** — high `harmonicStability` from consistency; momentum boosts `luminosity` and `resonance`; inconsistency raises `motionIntensity` (orbital wobble).
- **Emotions** — `emotionalIntensity` raises `motionIntensity` + `atmosphericDensity` (storms); unresolved tension raises `1 - harmonicStability` (turbulence); calm lowers both.
- **Memory** — `journalingDensity`/`memoryActivity` raise `particleActivity` (constellation count); `longTermMomentum` raises `temporalCoherence` (depth draw distance); inactive memories fade via low `luminosity`.
- **Relationships** — `relationshipActivity` raises `resonance` and `luminosity`; isolation raises `atmosphericDensity` low (emptiness) and lowers `particleActivity`.
- **Creative** — `creativeActivity` raises `motionIntensity` and `resonance` (geometry fractures); stagnation collapses `particleActivity`.
- **Higher Self** — coherence raises `temporalCoherence`, lowers `motionIntensity` and `atmosphericDensity` (silence becomes spatial).
- **Beliefs / Archetypes / Self** — slower tectonic/ritual/inward responses; long EMAs.

All recipes are pure functions in `worldReactivity.ts`, easy to tune.

---

## Memory updates

Update `mem://architecture/world-atmosphere-system.md` (and add a one-liner to `mem://index.md`):
- New core principle: **environment = interface**. Atmosphere is driven by `WorldClimate` from `useWorldClimate`, not by static presets alone.
- Document that `useWorldReactivity()` is the only writer to `worldClimateStore`; consumers read via hooks.
- Reaffirm: AION orb identity is canonical and never recoloured by climate — only its surrounding halo reflects the world.

---

## Out of scope (explicitly)

- No dashboards, charts, numeric overlays, or any visible signal readouts.
- No new scenes, no 3D, no audio.
- No changes to AION canonical orb (geometry, palette, shader).
- No backend or schema changes; all signals are simulated client-side.
- No changes to homepage, navigation, auth, or any page outside `/worlds/*` and the global runtime mount.

---

## Success check

After this phase:
- Sit on any world without interacting → light, fog, particles, and motion continue to evolve subtly.
- Switch worlds repeatedly → each world feels unmistakably *itself*, with its own breathing rhythm.
- Heavy interaction in one world (mutations) visibly shifts its atmosphere within seconds and leaves a faint resonance trace in related worlds.
- Orb is unchanged across all worlds; only its halo subtly inherits the world's emotional temperature.
