
# AION Orb — Real-Time Living Entity Rebuild

## 1. Audit findings (why it looks bad today)

The "orb" the user sees is **three different things in three places**, none of them the actual WebGL renderer:

| Surface | What's actually rendering | Problem |
|---|---|---|
| Header (top bar) | `AuroraOrbIcon` — a **static SVG glyph** (geometric star + circle, `feGaussianBlur stdDev=8`) | Vector logo, not an orb. Reads as a flat icon. The "blown-out glow" is the SVG blur stack. |
| Mobile shell (`AIONPresenceButton`) | **CSS `radial-gradient` on a span** + outer animated pulse div + `box-shadow` halo | The "stretched PNG" feeling. Scaling enlarges a flat radial gradient — no depth, no parallax. |
| Interactive AION (fullscreen) | Real `OrganicSphere` (Three.js + GLSL perlin shader) via `OrganicOrbCanvas` | Good base, but: `dpr=[1, 1.25]` on mobile (a DPR-3 iPhone renders at ~40% native → pixelation/jaggies), `antialias: false` on mobile, no bloom, no tone-mapping, no post-processing. Geometry up to 512² segments (over-budget on phones). |

Additional weight: **10+ legacy orb files** (`WebGLOrb.tsx` 879 LOC, `GalleryMorphOrb.tsx` 697 LOC, `CSSGalleryOrb`, `CSSOrb`, `BusinessOrb`, `PresetOrb`, `SharedOrbView`, `SharedOrbCanvas`, `Orb`, `OrganicSphere`, `PersonalizedOrb`) — fragmenting the visual identity. Each surface picks a different one, so "the orb" never feels like one entity.

The WebGL orb is also instantiated **per surface** (header vs presence vs fullscreen) — multiple WebGL contexts on iOS where the limit is ~8.

## 2. Strategy

**One orb. One renderer. Three tiers of fidelity. Shared GPU context.**

Approach: keep the existing perlin-displaced shader as the **base** (it already maps DNA → color → motion), but rebuild the rendering pipeline around it:

- **Single shared `<Canvas>`** mounted once near the app root. Header / presence / fullscreen orbs render as **drei `<View>` portals** into that canvas → one WebGL context, no contention, no context loss.
- **DPR done correctly**: `dpr={[1.5, Math.min(window.devicePixelRatio, 2.5)]}` everywhere. Antialias on (MSAA 4× when supported). On phones cap at 2.0 to keep fill-rate sane while killing jaggies.
- **Post-processing pass** (`@react-three/postprocessing`): ACES tone-mapping, soft bloom (intensity 0.6, threshold 0.5, radius 0.85), subtle chromatic aberration on cinematic tier only, optional film grain in hypnosis state. This is what produces the "Interstellar plasma" feel.
- **LOD tiers** chosen by render size, not by code path:
  - **Presence (≤ 56 px)** — fragment-only fullscreen quad with a cheap raymarched sphere + procedural fresnel. No geometry, no displacement. Crisp at any DPR. ~0.2ms/frame.
  - **Standard (56–256 px)** — current `OrganicSphere` with **128² segments** (down from 512²) + bloom. Visually identical at this size.
  - **Cinematic (> 256 px)** — 256² segments + bloom + chromatic aberration + inner volumetric glow (fragment ray-march from camera into a soft sphere with noise). For Interactive AION fullscreen.
- **State machine** (`useAIONOrbState`) drives uniforms, not React: `idle | listening | thinking | responding | recovery | focus | hypnosis`. Each state is a target vector of `(distortion, displacement, fresnel, timeFreq, bloomIntensity, hueShift, palette)`. Lerp toward target every frame — no React re-renders during state changes.
- **Audio reactivity** via shared `AnalyserNode` from voice mode (already exists). Smoothed RMS + low-band energy fed into uniforms.
- **Fallback**: if `WebGLRenderingContext` unavailable OR `navigator.deviceMemory < 2`, render a **CSS shader-emulation variant** (radial-gradient + conic-gradient + animated `mask`) — better than today's flat radial. Single component, used everywhere.

## 3. New file layout

```text
src/components/orb/
  v2/
    SharedOrbStage.tsx        # the one <Canvas>, mounted at app root
    OrbView.tsx               # drei <View> portal, drop-in replacement everywhere
    OrbScene.tsx              # picks tier by size, renders sphere or fullscreen quad
    tiers/
      PresenceQuad.tsx        # fragment-only LOD0
      StandardSphere.tsx      # LOD1 — refined OrganicSphere (128 seg)
      CinematicSphere.tsx     # LOD2 — + volumetric inner glow
    post/
      OrbPostFX.tsx           # bloom, ACES, optional CA + grain
    shaders/
      organicVertex.ts        # kept (already good)
      organicFragment.ts      # refined (better fresnel falloff, soft edge AA)
      presenceFragment.ts     # new — cheap raymarch
      volumetricFragment.ts   # new — inner glow
    state/
      useAIONOrbState.ts      # state machine, uniform targets, ease loop
      orbStates.ts            # 7 state presets
    fallback/
      CSSPresence.tsx         # CSS-only orb (no WebGL)
```

To deprecate (move to `legacy/` then delete after one release):
`Orb.tsx`, `WebGLOrb.tsx`, `GalleryMorphOrb.tsx`, `CSSOrb.tsx`, `CSSGalleryOrb.tsx`, `BusinessOrb.tsx`, `PresetOrb.tsx`, `SharedOrbView.tsx`, `SharedOrbCanvas.tsx`, `OrganicOrbCanvas.tsx`, `OrganicSphere.tsx`. `PersonalizedOrb.tsx` becomes a thin wrapper around `OrbView`.

`AuroraOrbIcon` keeps existing only as a tiny **fallback brand mark** for SSR/skeleton states; it stops being used as the header orb.

## 4. Surface migrations

- **Header** (`Header.tsx`): replace `AuroraOrbIcon size={40}` with `<OrbView size={40} state="idle" />`.
- **Mobile presence** (`AIONPresenceButton.tsx`): replace CSS gradient core with `<OrbView size={56} state={presenceState} />`. Outer pulse stays as ambient halo but uses a single `radial-gradient` matched to the orb's current palette uniform.
- **Interactive AION** (`InteractiveAION.tsx`): replace `<PersonalizedOrb size={...} />` with `<OrbView size={cinematicSize} tier="cinematic" state={interactiveState} />`.

All three now share **one WebGL context**, one palette source (DNA via `useOrbProfile`), one state machine.

## 5. Performance budget

- Mobile target: **stable 60fps on iPhone 12+, 30fps floor on iPhone X / mid Android**.
- Frame budget by tier (mobile): presence 0.2ms, standard 1.5ms, cinematic 4ms (only one cinematic visible at a time).
- Pause render loop when no orb is in viewport (`frameloop="demand"` + visibility observer on each `<View>`).
- Post-processing only on the cinematic view (header/presence skip the bloom pass).
- Geometry: 128² standard, 256² cinematic (down from 512²) — verified visually identical with bloom on.
- Textureless: zero asset bytes, zero decode cost. No raster upscaling possible.

## 6. State definitions (initial values)

| State | distortion | volume | fresnel | timeFreq | bloom | palette shift |
|---|---|---|---|---|---|---|
| idle | 0.7 | 0.12 | 4.5 | 0.0004 | 0.5 | base |
| listening | 1.1 | 0.18 | 5.2 | 0.0008 | 0.7 | +cool 8° |
| thinking | 1.6 | 0.22 | 5.8 | 0.0012 | 0.85 | +violet 12° |
| responding | 1.3 | 0.20 | 5.0 | 0.0010 | 0.95 | base |
| recovery | 0.4 | 0.08 | 3.5 | 0.0002 | 0.4 | +warm 6° |
| focus | 0.5 | 0.10 | 6.0 | 0.0003 | 0.6 | desat 20% |
| hypnosis | 2.2 | 0.30 | 6.5 | 0.0006 | 1.1 | full hue cycle, +grain |

Audio level adds on top (existing reactivity preserved).

## 7. Phasing

1. **Phase 1 — pipeline** (no visual change yet): introduce `SharedOrbStage`, `OrbView`, refined DPR/antialias/post-processing. Keep current `OrganicSphere` shader. *Outcome: pixelation gone, glow controlled, header/presence still old.*
2. **Phase 2 — surfaces**: migrate header + presence button + Interactive AION to `OrbView`. Retire `AuroraOrbIcon` from header. *Outcome: one entity across the app.*
3. **Phase 3 — tiers + state machine**: add presence raymarch tier, cinematic tier with volumetric glow + chromatic aberration, wire state machine to AION events (mic open, AI thinking stream, response start/end, hypnosis layer mount).
4. **Phase 4 — cleanup**: delete legacy orb files, update memories (`orb-system-centralization`, `orb-pure-renderer-standard`, `organic-sphere-rendering-quality`).

Each phase ships independently and is reversible.

## 8. Technical notes

- Add `@react-three/postprocessing@^2.16` (compatible with R3F 8 / React 18 already pinned).
- Use `gl.setPixelRatio(...)` via R3F's `dpr` prop, not manually — keeps it in sync with resize.
- Wrap `Canvas` in `<Suspense>` with the CSS fallback so WebGL load failure (the bug being chased the last two days) never leaves a blank orb.
- Inside the volumetric fragment shader, use a soft analytic falloff for edges (`smoothstep(1.0, 0.985, length(p))`) — eliminates aliasing on the silhouette without MSAA dependence.
- WebGPU is **not** required and the sandbox preview has no GPU adapter for it — sticking with WebGL2 keeps preview parity with production.

## 9. Open questions for you

- **Presence orb size on mobile**: today 56px. Bump to 64–72px so the LOD0 raymarch reads as a real entity rather than a button? (Affects thumb ergonomics.)
- **Hypnosis-state grain**: keep subtle (recommended) or push toward "old-CRT" texture for the recovery sessions?
- **Header orb**: should it animate continuously (always alive) or only when AION is actively in a non-idle state? Continuous is more "alive" but +0.2ms/frame globally.

