# Phase 5L — Living World Physics

Behavioral life on top of the runtime that already exists. No new canvases, no DB, no routes, no features. Extends `aionPresenceBus`, `WorldPhysics`, `WorldGestureField`, `WorldClimate`, and `SharedOrbStage` rather than replacing them.

## What already exists (do not rebuild)

| Capability | Location |
|---|---|
| AION presence states (6) | `src/aion/presenceState.ts` |
| Orb behavioural mapping (mood/scale/anchor) | `src/aion/presence/useOrbPresenceBehaviour.ts` |
| Per-world physics registry | `src/worlds/physics/{types,worldPhysicsRegistry,dispatchGesture}.ts` |
| Gesture field + bindings | `src/worlds/gesture/*` + `src/worlds/scene/WorldGestureField.tsx` |
| Climate + reactivity + cross-world resonance | `src/worlds/runtime/*`, `src/worlds/resonance/*` |
| Env memory (history) | `src/worlds/resonance/worldStateHistory.ts` |
| Single WebGL canvas | `src/components/orb/v2/SharedOrbStage.tsx` |
| Atmosphere (singleton) | `src/shellv2/layers/AtmosphereLayer.tsx` |
| Nav dock | `src/shellv2/layers/NavLayer.tsx` + `AionNavDock` |

5L is a **thin behavioural skin** over these.

---

## 5L.1 — Orb Behavioural Runtime

Extend, don't replace. The bus already has 6 states; add the 3 missing: `thinking`, `guiding`, `hesitating`, `dreaming` (4 actually). Map `forming → thinking`, keep both as aliases for one cycle so nothing breaks.

- New file `src/aion/presence/orbBehavior.ts` — `OrbBehaviorState` union + `BEHAVIOR_PROFILE` table (drift, pulse, glow, response-delay, environmental-influence per state).
- Extend `presenceState.ts` to accept the new states (additive union, no breaking change).
- `useOrbPresenceBehaviour.ts` reads the profile table → publishes additional CSS vars: `--aion-orb-drift`, `--aion-orb-pulse-rate`, `--aion-orb-glow`, `--aion-orb-influence`.
- Orb shader (`OrbView.tsx`) reads those vars (no per-state branching in JS RAF).

## 5L.2 — Orb Attention System

- New file `src/aion/presence/attentionBus.ts` — tiny bus, `AttentionTarget = 'user' | 'world-node' | 'artifact' | 'memory' | 'self' | 'idle'` plus optional focal point `{x,y}` in viewport [0..1].
- `useOrbPresenceBehaviour` adds an "attention bias" that tugs `targetCx/targetCy` slightly toward focal (clamped, ≤6vw) — single existing RAF, no new loop.
- Hooks: `useNoticeArtifact(ref)` (intersection-observer based) and `useNoticePointer()` already implicit via pointer ref.

## 5L.3 — World Physics Runtime (shared field)

Augment, don't fork. Per-world `WorldPhysics` already exists; what's missing is the **shared ambient field** that runs even when no gesture fires.

- New file `src/worlds/physics/sharedPhysicsField.ts` — single tick driven by the existing climate evolve loop. Outputs: `driftVector`, `inertia`, `currents`, `gravityAnchor`. No new RAF — piggyback `useWorldMomentum`.
- New `useSharedPhysicsField()` hook reads from the same store; consumed by `WorldAtmosphere` and orb.

## 5L.4 — Gesture-as-Atmosphere

`WorldGestureField` already captures hold/drag/dwell. Wire its outputs to atmosphere directly.

- Extend `dispatchGesture.ts` so each gesture also nudges climate (already does via `mutateClimate`) AND publishes a transient ripple to `attentionBus` (`world-node`, focal=touch point) for ~600ms.
- Orb subtly leans toward the touch via 5L.2 path.

## 5L.5 — Environmental Memory

Already partial in `worldStateHistory.ts`. Add an emotional residue layer.

- New file `src/worlds/resonance/worldResidue.ts` — `recordVisit(worldId, dwellMs)` + `recordAvoidance(worldId)`; persists to `localStorage` (no DB). Decays over real time.
- `WorldAtmosphere` reads residue → dims unloved worlds, warms engaged ones (CSS vars on the world root, not new render).

## 5L.6 — Living Navigation (transitions)

- New file `src/shellv2/transitions/atmosphericTransition.ts` — small helper `beginTraversal(fromWorldId, toWorldId)`. Runs:
  1. Snapshot source climate.
  2. Cross-fade atmosphere CSS vars over 600ms instead of route swap.
  3. Carry orb position; do not unmount.
- Hook `useAtmosphericNavigate()` returns a navigate fn used by `AionNavDock` (opt-in). React Router still does the route change underneath; the visual carryover is purely CSS-var/atmosphere.

## 5L.7 — Identity Triad Runtime

DNA + Avatar + AION already exist as separate hooks. Add a thin organism layer.

- New file `src/identity/triadOrganism.ts` — `useTriadOrganism()` reads `useDNA`, `useAION`, avatar state and writes:
  - `--aion-orb-material-tint` (from DNA)
  - `--aion-avatar-posture-bias` (from presence)
  - `--aion-resonance-tendency` (from DNA × presence)
- One `useEffect`, no RAF.

## 5L.8 — Bottom Navigation Evolution (foundation only)

Per constraint: "do not fully redesign yet — lay runtime foundation."

- Extend `AionNavDock` props to accept `glyphEnergy` (0..1) per tab, computed from `worldResidue` + `attentionBus` target. Visual: stronger soft glow on active realm, gentle dim on avoided ones. No layout change. No constellation rewrite this phase.

## 5L.9 — Remove Explicit Explanations

Audit + delete. Targets identified during exploration:
- "AION is learning…" / "Planning ontology trajectory" style microcopy in: `src/components/self/sections/AionPresenceHero.tsx`, journey/strategy echo banners, presence chips. Replace with silence + glow change (already wired via 5L.1 vars).
- Collected list compiled before edits; nothing removed without an environmental substitute already in place.

## 5L.10 — Performance Constraints (audit)

Check before merge:
- ✅ No new `<Canvas>` mounts (all orb work stays in `SharedOrbStage`).
- ✅ No new `requestAnimationFrame` loops; all new work hooks into existing loops (`useOrbPresenceBehaviour` RAF, `useWorldMomentum` tick, climate evolve).
- ✅ `useCanvasGuard` (already in place from 5F.4) re-run as smoke test.
- ✅ `AtmosphereLayer` singleton guard untouched.

---

## Files (planned)

**New (~8 small files)**
- `src/aion/presence/orbBehavior.ts`
- `src/aion/presence/attentionBus.ts`
- `src/worlds/physics/sharedPhysicsField.ts`
- `src/worlds/resonance/worldResidue.ts`
- `src/shellv2/transitions/atmosphericTransition.ts`
- `src/shellv2/transitions/useAtmosphericNavigate.ts`
- `src/identity/triadOrganism.ts`
- `src/aion/presence/useNoticeArtifact.ts`

**Edited (additive only)**
- `src/aion/presenceState.ts` — extend union with `thinking | guiding | hesitating | dreaming`
- `src/aion/presence/useOrbPresenceBehaviour.ts` — read profile + attention focal
- `src/components/orb/v2/OrbView.tsx` — read new CSS vars in shader uniforms
- `src/worlds/physics/dispatchGesture.ts` — emit attention ripple
- `src/worlds/atmosphere/WorldAtmosphere.tsx` — apply residue + shared field vars
- `src/components/aion/ui/AionNavDock.tsx` — accept `glyphEnergy`
- `src/shellv2/layers/NavLayer.tsx` — pass residue/attention into dock
- `src/components/self/sections/AionPresenceHero.tsx` (+ small explanatory chips) — strip diagnostic copy

## Order of execution

1. 5L.1 orb behaviour table + state extension
2. 5L.2 attention bus + orb tug
3. 5L.3 shared physics field
4. 5L.4 gesture → atmosphere ripple
5. 5L.5 environmental memory (residue)
6. 5L.7 triad organism (small, safe)
7. 5L.6 atmospheric transitions (opt-in via nav dock)
8. 5L.8 nav glyphEnergy wiring
9. 5L.9 explanatory-copy removal sweep
10. 5L.10 canvas + RAF audit, ship

## Out of scope (explicit)

- No new routes, no new pages, no constellation nav rewrite, no DNA/Avatar visual redesign, no marketplace/economy, no dashboard resurrection, no second canvas, no per-world RAF.

## Recommended next sub-phase after 5L lands

**5M — Constellation Navigation**: now that `glyphEnergy` + atmospheric transitions exist, replace the literal tab bar with realm anchors orbiting the orb. Pure visual; runtime is already in place.
