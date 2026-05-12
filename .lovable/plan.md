## Goal
Make the header orb render reliably and make the interactive orb look premium at large size instead of pixelated, clipped, or faceted.

## Audit findings
1. **Header orb is on the wrong renderer path**
   - `OrbView` forces all small orbs (`size <= 64`) into the legacy CSS fallback.
   - The header orb is `size={40}`, so it never uses the shared stage / high-fidelity path.
   - That means the header is still using the old blob illusion instead of the new premium renderer.

2. **Interactive orb is using a shader that breaks when enlarged**
   - `InteractiveAION` renders `PersonalizedOrb`, which routes large sizes into `OrbView` → `OrganicSphere`.
   - `OrganicSphere` is a vertex-lit displacement shader with hard fresnel and no proper post-processing pipeline.
   - On a large orb this creates the exact problems you reported: faceting, clipped white highlights, low perceived resolution, weak depth, and a cheap enlarged look.

3. **The current architecture mixes two incompatible quality levels**
   - Small surfaces use the legacy CSS orb.
   - Large surfaces use the newer WebGL orb.
   - So the app is not rendering “one living entity,” it is switching identities depending on size.

## Plan
### 1) Split orb rendering by surface role, not only by size
- Update `OrbView` so header/presence/inline orbs can use a dedicated **small-orb renderer** instead of the current forced CSS fallback.
- Keep a low-cost small-surface path for reliability, but make it visually consistent with the premium orb instead of the old blob look.
- Remove the “all small orbs must fall back” assumption.

### 2) Replace the enlarged interactive orb’s current material pipeline
- Rework the large interactive orb around a **cinematic renderer** tuned for close-up viewing.
- Keep the shared global stage, but replace the current harsh lighting/material behavior in `OrganicSphere`.
- Add softer specular response, controlled fresnel, better internal depth, and highlight compression so whites never blow out.
- Increase perceived detail with a shader/material approach that survives scale instead of exposing mesh faceting.

### 3) Unify the orb states visually
- Map the interactive states (`idle`, `listening`, `thinking`, `responding`, `recovery`, `focus`, `hypnosis`) to one coherent motion language.
- Make small and large orbs share the same palette, breathing rhythm, highlight behavior, and surface character.
- Ensure the header orb reads as the same living presence as the interactive orb, just at a smaller scale.

### 4) Add progressive quality and fallbacks properly
- Define tiers explicitly:
  - **Header / inline**: crisp, lightweight premium small renderer
  - **Interactive / fullscreen**: cinematic renderer
  - **Low-end fallback**: controlled CSS/2D fallback that matches the same look language
- Keep one WebGL context and cap DPR intelligently on mobile.
- Reduce quality only when necessary instead of defaulting small surfaces to the old renderer.

### 5) Validate against the actual failure cases
- Verify header orb is visible and visually correct on mobile.
- Verify interactive orb no longer shows faceting, hard clipping, or blown highlights.
- Verify slide-in interactive mode still works from the left.
- Verify no blank/or missing orb state in header or interactive mode.

## Technical details
- Files likely involved:
  - `src/components/orb/v2/OrbView.tsx`
  - `src/components/orb/OrganicSphere.tsx`
  - `src/components/orb/shaders/organicVertex.ts`
  - `src/components/orb/PersonalizedOrb.tsx`
  - `src/components/aion/InteractiveAION.tsx`
  - possibly `src/components/Header.tsx`
- Main implementation change:
  - stop using the current “presence = legacy CSS” rule
  - introduce explicit renderer selection by **surface role and quality tier**
  - tune or replace the current fullscreen shader/material so large-scale rendering looks dense and premium

## Expected result
- The header orb renders correctly.
- The interactive orb stops looking like a stretched low-quality object.
- Both orbs feel like the same premium living presence instead of two different systems.