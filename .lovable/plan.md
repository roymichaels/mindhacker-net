

# Whitepaper Mode Selector + Visual 3D Mode

## Overview
When users navigate to the whitepaper (`/docs`), show a fullscreen modal offering two modes:
1. **Simple** — the current text-based whitepaper (as-is)
2. **Visual** — a new immersive 3D presentation experience

The Visual mode will be a fullscreen, section-by-section scrollable experience using Three.js (already installed), particle systems, animated transitions, and cinematic typography — presenting the same whitepaper content as a visual journey.

## Architecture

```text
/docs route
  └─ Documentation.tsx
       ├─ WhitepaperModeModal (new) — fullscreen choice overlay
       ├─ mode === 'simple' → current text whitepaper (unchanged)
       └─ mode === 'visual' → VisualWhitepaper (new)
                                ├─ 3D background canvas (particles, orb, nebula)
                                ├─ Section slides (scroll-snapped)
                                ├─ Cinematic text reveals
                                └─ Navigation dots + progress bar
```

## Changes

### 1. Create `WhitepaperModeModal` component
- Fullscreen dark overlay with two cards
- **Simple**: document icon, "Classic reading experience"  
- **Visual**: 3D cube/diamond icon, "Immersive 3D experience"
- Animated entrance, glass-morphism cards, glow effects
- Stores choice in state; can switch modes from within

### 2. Create `VisualWhitepaper` component
The star of the show — a scroll-driven 3D cinematic presentation:

- **3D Background**: React Three Fiber canvas with:
  - Animated particle field (stars/nodes) that reacts to scroll
  - Floating geometric shapes (icosahedrons, torus knots) with iridescent materials
  - Dynamic lighting that shifts color per section
  - Depth-of-field / bloom post-processing feel via drei helpers

- **Section System** (scroll-snap fullscreen slides):
  - Each whitepaper section becomes a "slide"
  - Text appears with staggered letter/word animations (framer-motion)
  - Key stats/numbers animate with counting effects
  - Section transitions trigger 3D scene changes (camera movement, particle color shifts)

- **Sections adapted for visual mode**:
  - Hero: Giant brand name + orb, particle explosion on enter
  - "The Problem": Fragmented floating app icons → unifying into one
  - "The Solution": 5 core experiences as orbiting 3D nodes
  - Roadmap: 3D timeline with glowing milestones
  - Tokenomics: Animated circular/flow diagrams
  - Other sections: Cinematic text reveals with ambient 3D backgrounds

- **Navigation**: Floating dot indicators, scroll progress bar, keyboard nav (↑↓)
- **Exit button**: Return to mode selection or back

### 3. Modify `Documentation.tsx`
- Add `mode` state: `null | 'simple' | 'visual'`
- When `mode === null`: show `WhitepaperModeModal`
- When `mode === 'simple'`: render current whitepaper (unchanged)
- When `mode === 'visual'`: render `VisualWhitepaper`
- Add a floating button to switch modes

### 4. Supporting components
- `VisualWhitepaperScene.tsx` — Three.js canvas with particles, geometries, lighting
- `VisualSection.tsx` — Individual slide component with text animation
- `ParticleField.tsx` — Reusable animated particle system

## Technical Details
- Uses existing `three`, `@react-three/fiber`, `@react-three/drei` packages
- Uses existing `framer-motion` for text animations
- Scroll-snap CSS for section navigation
- 3D scene responds to scroll position via `useScroll` from framer-motion
- Reuses existing theme colors and brand settings from `useThemeSettings`
- Bilingual support (he/en) maintained in visual mode
- Mobile responsive: simpler particle count, touch scroll support

