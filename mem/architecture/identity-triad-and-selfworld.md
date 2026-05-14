---
name: Identity Triad & SelfWorld
description: Three-entity identity contract (AION · DNA · Character) and SelfWorld shell hierarchy that frames Profile/Self as an explorable inner OS
type: feature
---
# Identity Triad & SelfWorld

## Three-layer identity contract

The user's identity is **never one profile object**. It is three distinct entities that must stay conceptually and visually separated everywhere they appear:

1. **AION NFT — Intelligence layer.** The persistent guide. Holds AION memory, orchestration history, guidance style, voice identity, relationship evolution with the user. Rendered with `CanonicalAionModel` (cyan/violet/magenta) in Chat, Voice, Journey, World, Mind, and SelfWorld. Never the user's DNA orb.
2. **DNA NFT — Consciousness layer.** The user's evolving inner self: memories, beliefs, emotional patterns, habits, archetypes, values, relationship patterns, life trajectory, shadow, symbolic identity. Rendered with `PersonalizedOrb` / `DNAViewer`. Belongs to the user, not to AION.
3. **Character NFT — Embodiment layer.** Avatar, cosmetics, unlockables, access permissions, social/world traversal identity. Rendered with `AvatarMiniPreview` / `AvatarFullBody`.

Rule: do NOT collapse consciousness, intelligence, and embodiment into one profile. UI surfaces that show identity must preserve the triad framing.

## SelfWorld shell

`src/selfworld/SelfWorldShell.tsx` is the canonical body of Profile/Self (mounted via `SelfPanel`). Top-down bands:

1. `PresenceBand`     — canonical AION (intelligence, guide).
2. `IdentityCoreBand` — `ProfileNFTTriad` framed as three entities with per-card layer captions.
3. `InnerSystemsBand` — explorable layer registry (`layerRegistry.ts`).
4. `BrainGraphBand`   — peer band linking to `/brain` (cognitive map).
5. `SettingsBand`     — quietest band; hosts `WhatAionKnowsSection`, `CorrectionsSection`, `PrivacySettingsSection`.

## Inner systems registry

`src/selfworld/layerRegistry.ts` is the staged-rollout list of inner-system layers (Memories, Beliefs, Emotional Patterns, Habits, Archetypes, Roles, Values, Relationships, Trajectory, Shadow, Creative World, Higher Self, Energy Patterns, Cognitive Structures). Each entry has `owner: 'dna' | 'aion' | 'character'` and `status: 'live' | 'coming'`. To ship a new layer, flip its `status` to `'live'` and route `LayerCard.onOpen` — no shell changes required.

Locked layers reveal a presence-aware "AION is preparing this layer" line on tap (line varies with `useAionPresence()` state).

## What is intentionally NOT built yet

- No 3D spatial WebGL navigation between layers — the band-stack is the v1 spatial metaphor.
- No backend tables / NFT / blockchain wiring — labels are conceptual.
- No deep implementations behind locked inner-system layers.
- No redesign of triad cards, DNA viewer, brain graph, or avatar.

## Files

- `src/selfworld/SelfWorldShell.tsx`
- `src/selfworld/layerRegistry.ts`
- `src/selfworld/LayerCard.tsx`
- `src/selfworld/layers/{PresenceBand,IdentityCoreBand,InnerSystemsBand,BrainGraphBand,SettingsBand}.tsx`
- `src/components/self/SelfPanel.tsx` (thin wrapper around SelfWorldShell)
- `src/components/self/sections/AionPresenceHero.tsx` (canonical AION + presence copy)
