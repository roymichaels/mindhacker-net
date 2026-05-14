## Phase 5B.4 — SelfWorld + Identity Triad Architecture

Reframe Profile/Self from a "settings page with widgets" into **SelfWorld**: an explorable inner OS with a clear three-layer identity model. This phase lays the **shell, hierarchy, navigation, and visual language** — not the deep systems behind every layer.

### Conceptual model (frozen for the rest of the system)

Three distinct entities, never collapsed into one profile object:

```text
  ┌─────────────────────────────────────┐
  │  AION NFT      — Intelligence layer │  (canonical orb, persistent guide)
  ├─────────────────────────────────────┤
  │  DNA NFT       — Consciousness layer│  (user DNA orb, evolving inner self)
  ├─────────────────────────────────────┤
  │  Character NFT — Embodiment layer   │  (avatar, access, world traversal)
  └─────────────────────────────────────┘
```

`ProfileNFTTriad` and `PersonalizedOrb` continue to live **only as identity artifacts** under the AION presence layer. The canonical AION model is never the user's DNA orb.

### SelfWorld hierarchy (top → bottom)

1. **AION presence band** — canonical AION model + presence-state line (already shipped as `AionPresenceHero`).
2. **Identity Core** — the triad: AION NFT · DNA NFT · Character NFT, each entering a layer view.
3. **Inner systems map** — explorable layer registry (Memories, Beliefs, Emotional Patterns, Habits, Archetypes, Roles, Values, Relationships, Trajectory, Shadow, Creative, Higher Self). Most are **placeholder layers** for now — locked/coming-soon, but registered.
4. **Brain Graph entry** — link to the existing brain/atlas as the cognitive map layer.
5. **Settings & account** — collapsed, last.

### What gets built now

**Shell**
- New `src/selfworld/` module with:
  - `SelfWorldShell.tsx` — full-height container, ambient atmosphere, scroll-as-descent feel.
  - `layers/` — one component per band (PresenceBand, IdentityCoreBand, InnerSystemsBand, BrainGraphBand, SettingsBand).
  - `layerRegistry.ts` — declarative list of inner-system layers (id, label HE/EN, icon, owner: `dna` | `aion` | `character`, status: `live` | `coming`).
  - `LayerCard.tsx` — uniform card used by InnerSystemsBand; opens a layer view (or a "coming soon" sheet for unlive layers).
  - `LayerView.tsx` — generic detail surface used by live layers (Identity Core, DNA, Brain Graph) and as the "coming" stub for the rest.

**Identity Triad reframing**
- Wrap the existing `ProfileNFTTriad` inside an `IdentityCoreBand` that labels it as the **three-entity identity core** (AION · DNA · Character) with a one-line caption per entity reflecting its layer:
  - AION → "Intelligence layer · your persistent guide"
  - DNA → "Consciousness layer · your evolving inner self"
  - Character → "Embodiment layer · how you appear and access worlds"
- No visual rebuild of the triad cards themselves; only the surrounding framing and copy.

**Self panel migration**
- `SelfPanel` becomes a thin wrapper that mounts `SelfWorldShell`. The existing sections (`WhatAionKnowsSection`, `CorrectionsSection`, `PrivacySettingsSection`) move under the new **Settings & account** band so nothing is lost.
- `IdentitySection` is retired in favor of the triad band (its name+orb row was a placeholder for the triad).

**Visual language**
- Dark ambient background with soft vertical gradient between bands (no heavy shadows/gradients per design memory — subtle `bg-white/[0.02]` separators, `rounded-2xl`, `backdrop-blur`).
- Each band has: small uppercase label, optional sublabel, content. No card chrome around bands themselves.
- Locked layers render with a `Lock` glyph and "coming soon" muted treatment — registered in `layerRegistry` so future phases just flip `status: 'live'`.

**Navigation**
- Tapping a triad card opens its layer view (AION → AION layer stub, DNA → existing `DNAViewer` artifact, Character → existing avatar surface).
- Tapping an inner-system card opens `LayerView` (live layers route to existing component; locked layers show a presence-aware "AION is preparing this layer" state).

### What is explicitly NOT built yet

- No 3D spatial world / WebGL navigation between layers (the band-stack is the v1 spatial metaphor).
- No backend tables or NFT/blockchain wiring — these are conceptual labels only.
- No deep implementation of Memories, Beliefs, Emotional Patterns, Habits, Archetypes, Roles, Values, Relationships, Trajectory, Shadow, Creative, Higher Self. They register as locked layers.
- No redesign of the triad cards, DNA viewer, brain graph, or avatar.
- No route changes — `ProfilePage` keeps mounting `SelfPanel`.

### Files (planned)

**New**
- `src/selfworld/SelfWorldShell.tsx`
- `src/selfworld/layerRegistry.ts`
- `src/selfworld/LayerCard.tsx`
- `src/selfworld/LayerView.tsx`
- `src/selfworld/layers/PresenceBand.tsx` (wraps existing `AionPresenceHero`)
- `src/selfworld/layers/IdentityCoreBand.tsx` (wraps `ProfileNFTTriad` with triad framing)
- `src/selfworld/layers/InnerSystemsBand.tsx`
- `src/selfworld/layers/BrainGraphBand.tsx`
- `src/selfworld/layers/SettingsBand.tsx` (hosts the existing Self sections)
- `mem/architecture/identity-triad-and-selfworld.md` + index entry

**Edited**
- `src/components/self/SelfPanel.tsx` — replaced body with `<SelfWorldShell />`.
- `src/components/self/sections/IdentitySection.tsx` — deleted (superseded by IdentityCoreBand). Imports cleaned.

### Success criteria

Opening Profile/Self:
1. AION presence is the first thing you feel (canonical model, presence-aware copy).
2. Below it, the identity **triad** is clearly labeled as three distinct entities (Intelligence · Consciousness · Embodiment), not one profile.
3. Below that, an **inner systems map** previews the explorable layers of your consciousness — most locked, but visibly registered.
4. Brain graph entry is a peer band, not buried in settings.
5. Settings/account is the last, quietest band.
6. Canonical AION still reads identically in Chat, Voice, Journey, World, Mind, and SelfWorld.

### Memory updates

Add `mem://architecture/identity-triad-and-selfworld` documenting:
- Three-layer identity contract (AION / DNA / Character — never collapsed).
- SelfWorld as the canonical inner-OS surface.
- Layer registry pattern for staged rollout of inner systems.
