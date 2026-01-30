

# Personalized Digital Identity Orb System

## Overview

This plan creates a dynamic, evolving orb that serves as each user's unique "Digital Identity" - a visual representation of their personality, life path, traits, and progress. The orb will be personalized after completing the Launchpad and will continuously evolve based on user actions.

## Data Sources for Orb Personalization

The orb will derive its appearance from multiple user data sources:

| Data Source | Visual Property | Description |
|-------------|-----------------|-------------|
| **Ego State** | Primary Color Scheme | Guardian (Blue), Warrior (Orange), Healer (Green), Mystic (Purple), etc. |
| **Character Traits** | Secondary Colors / Particle Effects | 6 categories: Inner Strength (Orange), Thinking (Violet), Heart (Pink), Leadership (Gold), Social (Emerald), Spiritual (Indigo) |
| **Life Direction** | Morphing Intensity | Higher clarity score = smoother, more focused movement |
| **Consciousness Score** | Core Glow Intensity | Higher score = brighter, more luminous core |
| **XP Level** | Complexity / Layers | Higher levels = more geometric detail and nested layers |
| **Streak** | Particle Activity | Active streaks = more particles and energy trails |
| **Transformation Readiness** | Pulsation Speed | Higher readiness = more dynamic, alive pulsation |

## New Orb Configuration System

### 1. Orb Profile Interface

A new `OrbProfile` interface will define all personalization parameters:

```text
OrbProfile
├── Primary Color (from Ego State)
├── Secondary Colors (from top 2-3 trait categories)
├── Accent Color (from life direction focus area)
├── Morphing Config
│   ├── Intensity (consciousness score / 100)
│   ├── Speed (transformation readiness / 100)
│   └── Octaves (level-based: 2-6)
├── Particle Config
│   ├── Enabled (streak > 0)
│   ├── Count (streak * 3)
│   └── Color (from dominant trait)
├── Core Config
│   ├── Glow Intensity (consciousness score / 100)
│   └── Size (0.2 + level * 0.02)
└── Layer Config
    ├── Count (1 + Math.floor(level / 3))
    └── Detail (icosahedron subdivisions: 3-6)
```

### 2. Hook: useOrbProfile

A new hook that combines all user data to generate the orb configuration:

**Location**: `src/hooks/useOrbProfile.ts`

**Data Dependencies**:
- `useGameState()` - level, experience, streak, activeEgoState
- `useDashboard()` - characterTraits (identity elements)
- `useLifeModel()` - lifeDirection (clarity_score)
- `useLaunchpadSummary()` - consciousness_score, transformation_readiness
- `useLaunchpadProgress()` - isLaunchpadComplete

**Logic**:
- Calculate dominant trait categories from selected character traits
- Map ego state to primary color palette
- Blend trait category colors for secondary/accent
- Scale morphing parameters based on scores
- Determine layer complexity from level

### 3. Enhanced Orb Component

**Updated Props** (`src/components/orb/types.ts`):

```text
OrbProps (Extended)
├── Existing props (size, state, audioLevel, etc.)
└── New props
    ├── profile?: OrbProfile (full personalization)
    ├── traitColors?: string[] (secondary color accents)
    ├── morphIntensity?: number (0-1)
    ├── morphSpeed?: number (0.5-2)
    ├── coreIntensity?: number (0.3-1)
    ├── layerCount?: number (1-4)
    ├── particleEnabled?: boolean
    └── particleCount?: number
```

### 4. WebGL Orb Enhancements

**File**: `src/components/orb/WebGLOrb.tsx`

**New Visual Features**:

1. **Multi-Color Gradient System**
   - Primary color for outer layer
   - Secondary colors blend into inner layers
   - Accent color for core glow

2. **Dynamic Layer Generation**
   - Generate 1-4 nested icosahedron shells
   - Each layer has different subdivision level and opacity
   - Layers rotate at different speeds for depth effect

3. **Trait-Based Particle System**
   - Floating particles around orb based on streak
   - Particle colors match dominant trait categories
   - Particles move in organic patterns

4. **Consciousness Core**
   - Central glowing sphere
   - Brightness scales with consciousness_score
   - Subtle pulse synchronized with user's "heart" traits

5. **Level-Based Geometry Evolution**
   - Low levels (1-3): Simple smooth sphere
   - Mid levels (4-6): Icosahedron with visible edges
   - High levels (7-9): Complex fractal surface
   - Master levels (10+): Alien geometric structures with extra rings

## Database Changes

### New Table: `orb_profiles`

Store computed orb configurations for faster loading:

```text
orb_profiles
├── id (uuid, PK)
├── user_id (uuid, FK to profiles)
├── primary_color (text) - HSL value
├── secondary_colors (jsonb) - array of HSL values
├── accent_color (text)
├── morph_intensity (numeric)
├── morph_speed (numeric)
├── core_intensity (numeric)
├── layer_count (integer)
├── particle_enabled (boolean)
├── particle_count (integer)
├── geometry_detail (integer)
├── computed_from (jsonb) - snapshot of source data
├── updated_at (timestamp)
└── created_at (timestamp)
```

### Trigger: Auto-Update Orb Profile

A database trigger will recompute the orb profile when:
- User completes Launchpad
- User selects new character traits
- User changes ego state
- Significant XP milestone reached
- Life plan milestone completed

## Implementation Files

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useOrbProfile.ts` | Main hook combining all data sources |
| `src/lib/orbProfileGenerator.ts` | Pure functions to compute orb config |
| `src/components/orb/OrbParticles.tsx` | Three.js particle system component |
| `src/components/orb/PersonalizedOrb.tsx` | Wrapper component with profile auto-loading |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/orb/types.ts` | Add OrbProfile interface and extended props |
| `src/components/orb/WebGLOrb.tsx` | Add multi-layer, particles, and dynamic colors |
| `src/components/orb/CSSOrb.tsx` | Add gradient colors and glow intensity fallback |
| `src/components/orb/index.ts` | Export new components |
| `src/components/home/GameHeroSection.tsx` | Use PersonalizedOrb for logged-in users |
| `src/pages/HypnosisSession.tsx` | Use PersonalizedOrb |
| `src/pages/Aurora.tsx` | Use PersonalizedOrb |

## Color Mapping Tables

### Ego State to Primary Colors

| Ego State | Primary HSL | Gradient |
|-----------|-------------|----------|
| Guardian | hsl(210, 100%, 50%) | Blue |
| Warrior | hsl(25, 90%, 50%) | Orange |
| Healer | hsl(150, 70%, 45%) | Green |
| Mystic | hsl(270, 70%, 55%) | Purple |
| Sage | hsl(195, 75%, 45%) | Cyan |
| Creator | hsl(320, 75%, 55%) | Pink |
| Explorer | hsl(45, 95%, 55%) | Yellow |
| Rebel | hsl(0, 85%, 55%) | Red |
| Lover | hsl(340, 85%, 55%) | Rose |
| Transformer | hsl(180, 70%, 45%) | Teal |

### Trait Category to Secondary Colors

| Category | Color | Visual Effect |
|----------|-------|---------------|
| Inner Strength | Orange (#f97316) | Fire-like particles |
| Thinking | Violet (#8b5cf6) | Electric sparks |
| Heart | Pink (#ec4899) | Soft pulsing glow |
| Leadership | Gold (#eab308) | Crown-like highlights |
| Social | Emerald (#10b981) | Connecting lines |
| Spiritual | Indigo (#6366f1) | Ethereal mist |

## User Experience Flow

```text
1. New User (No Profile)
   └── Default orb: Guardian blue, simple geometry, minimal effects

2. During Launchpad
   └── Orb gradually evolves as user completes steps:
       ├── Step 2 (Personal Profile): Slight color hints
       ├── Step 3 (Identity Building): Secondary colors appear
       ├── Step 5 (First Chat): Particles begin
       └── Step 10 (Dashboard Activation): Full personalized orb

3. Post-Launchpad
   └── Orb continues evolving:
       ├── Each level up: More geometric complexity
       ├── Streak milestones: More particles
       ├── Milestone completion: Temporary celebration animation
       └── Ego state change: Smooth color transition
```

## Technical Considerations

1. **Performance**
   - Cache computed profiles in database
   - Use instanced mesh for particles
   - Throttle animation updates on low-end devices
   - Reduce layer count on mobile

2. **Transitions**
   - Smooth color interpolation when profile changes
   - Particle count adjusts gradually
   - Geometry morphs rather than jumps

3. **Fallback**
   - CSS Orb receives simplified profile (colors only)
   - Static image fallback for no-WebGL environments

## Summary

This system transforms the orb from a static visual element into a living, breathing digital identity that:
- Reflects who the user is (traits, ego state)
- Shows their progress (level, XP, streaks)
- Visualizes their consciousness journey (scores, life direction)
- Evolves with every action they take

The orb becomes the user's unique avatar in the transformation journey - no two orbs are alike.

