## Phase 5D.1B — World Terrain Deepening

The wiring is correct but everything reads as flat CSS halos on a void. This pass keeps the architecture intact and pushes the visual language toward the reference: a planetary horizon arc, textured terrain valley, glowing rivers between landmarks, and pins that look like *places* — vertical light columns rooted in the ground, not floating UI badges.

No new routes, data, or behaviour. Pure visual deepening of existing primitives plus one new structural sub-layer (the terrain valley), and a small reorder so the legacy feed is no longer the default surface.

### 1. Planet horizon — from disc to arc

`src/world/terrain/PlanetHorizonLayer.tsx`

- Replace the off-frame radial disc with a true horizon **arc**: planet edge spans the top ~40% of the viewport in a wide curve, terminator visible across the whole width (matches reference image #2).
- Three stacked layers:
  1. Planet **mass** — large dark disc with subtle violet body tint, pushed up so only the lower curve is visible.
  2. **Rim terminator** — bright cyan/violet hairline along the curve with outer bloom (the "atmospheric edge" in the reference).
  3. Surface **city-light field** — clipped to the planet body via radial mask so the warm specks only appear *on* the curved surface, not in the sky.
- Add a thin **atmospheric scatter band** above the rim (cyan glow falling off into space) for the "atmosphere visible from orbit" feel.
- Parallax: rim and body translate at slightly different rates (rim slower) → real depth.

### 2. New structural sub-layer — terrain valley

`src/world/terrain/TerrainValleyLayer.tsx` (new, `UZ.structure - 0.5`)

A pure-CSS/SVG textured valley occupying the lower ~60% of the viewport. Composed of:

- **Distant ridges** — three horizontal SVG silhouette bands at varying heights with low opacity and progressive blur (far → close). Shapes are smooth low-frequency curves, not geometric.
- **Ground plane** — a subtle perspective gradient from horizon (warm magenta bleed) down to near-camera (deep navy), with a faint hex/noise texture mask to avoid feeling like a flat fill.
- **Drifting fog band** — single soft horizontal blur at ~mid-screen, animated very slowly (60s drift) tied to `--view-drift`.
- Honours reduced-motion (drift disabled, three ridges still render).

This layer is what kills the "diagram on void" feeling.

### 3. Glowing rivers between anchors

`src/universe/primitives/EnergyPath.tsx`

- Replace the single dashed stroke with a **3-pass** river:
  1. wide soft glow underlay (strokeWidth ~2.4, low opacity, blurred via `filter`)
  2. mid stroke with the existing travelling shimmer
  3. bright **light particles** — 2–3 small circles animated along the path via `<animateMotion>` (or CSS offset-path) so the bridges feel like flowing energy, not static lines.
- Curve generation: bias the control point lower so paths arc *along* the terrain (river-like) instead of arcing upward.
- Keep SVG-only; no canvas.

### 4. Anchor pins as landmarks

`src/universe/primitives/AnchorPin.tsx`

- Add a tall **vertical light column** rising from the ground rings up through the icon halo (a thin blurred gradient bar, ~1.5px wide, height ~80px). This is the single change that turns a UI badge into a "place" — it looks like a beacon planted on the surface.
- Strengthen the **ground rings**: 3 concentric ellipses (existing 2 + one larger faint one), with the outermost very faint and slowly pulsing on a long offset.
- Halo: switch the hard `boxShadow` ring to a softer **double bloom** (inner saturated, outer wide diffuse) so the pin glows into the scene instead of sitting on top of it.
- Label whisper: drop the side-of-pin layout in favour of the reference's pattern — label sits **above** the icon in RTL/LTR-respecting alignment, smaller and dimmer (`text-[11px] text-foreground/60`), no meta line by default; meta only appears on hover/focus.
- Slight **pin sway** — 6s sinusoidal `translateY ±2px` per pin with staggered phase, disabled in reduced-motion.

### 5. Parallax depth — multi-rate

`src/world/terrain/WorldTerrainScene.tsx`

- Compute three parallax slices from one `usePresenceParallax`:
  - `parallaxDistant` (×0.25) → planet body
  - `parallaxMid` (×0.6) → terrain valley + rim
  - `parallaxNear` (×1.0) → anchor field
- Pass each into the matching layer. Result: turning the head feels like real depth, not a single-plane shift.

### 6. Environmental lighting cohesion

`src/world/terrain/WorldTerrainScene.tsx`

- Add a **top-light wash** (single `radial-gradient` covering the upper viewport) tinted by the active world's hue, so pins, rim, and atmosphere all share one light source.
- Add a faint **bottom void gradient** specific to this scene to anchor the composer area into the terrain (without conflicting with `AtmosphereLayer`'s global bottom void — this one is darker and warmer near the horizon).

### 7. Default-vs-legacy reorder

`src/pages/OuterWorldHub.tsx`

- Today: `?legacy=1` shows feed, default shows terrain. Keep that contract — terrain stays default.
- Move the legacy `AlignedRealities` access from a URL param to a quiet, dismissable affordance: a single tiny `…` chevron at the very bottom of the terrain that, on tap, slides the legacy feed up as an overlay (uses the existing OverlayLayer; no new route). Still hidden by default.
- Confirm `OuterWorldHub` always mounts `WorldTerrainScene` first; the legacy surface is never the primary view.

### 8. Whisper title

`src/world/terrain/WorldTerrainScene.tsx`

- Shorten visible window from 4.2s → 3.0s and reduce opacity peak to 0.45 so the title evaporates faster — the world should be the headline, not a label.

### Out of scope

- WebGL / Three.js / canvas.
- Any new data, RPCs, or feature surfaces.
- Touching `BackgroundLayer`, `AtmosphereLayer`, `CosmosLayer`, `HazeLayer` (already correct globally — this pass only deepens what lives at `structure` + `anchor` for the World route).
- Changes to other views (Brain, Journey, Profile, Chat, Interactive).
- Replacing `AlignedRealities` content; just demoting it.

### Files

**Edit**
- `src/world/terrain/PlanetHorizonLayer.tsx` — horizon arc rewrite
- `src/world/terrain/WorldTerrainScene.tsx` — multi-rate parallax, top-light wash, mount terrain valley, shorter whisper, legacy overlay trigger
- `src/universe/primitives/EnergyPath.tsx` — 3-pass river + flowing particles
- `src/universe/primitives/AnchorPin.tsx` — light column, ground rings, double bloom, label-above, sway
- `src/pages/OuterWorldHub.tsx` — legacy as bottom-sheet overlay instead of `?legacy=1` route fork
- `mem/architecture/world-atmosphere-system.md` — note the deepening pass

**Add**
- `src/world/terrain/TerrainValleyLayer.tsx` — new ridges + ground plane + fog band

### Success check

Open `/outer-world` on the 402×716 viewport. You should see:
- A planet **arc** across the top with a glowing terminator and atmosphere band.
- A textured **valley** below with three ridges fading into distance.
- Anchor pins rooted on the ground via **vertical beacon columns** and concentric rings.
- Rivers of light **flowing** between linked pins (visible particle motion).
- Subtle multi-rate **parallax** when tilting / pointer move.
- The old card feed is **gone** from the default view; reachable only by an inconspicuous chevron at the bottom edge.
