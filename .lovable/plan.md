

## Homepage Overhaul — "$1M NFT Play-to-Earn Game" Feel

### Problem
Currently 10 separate sections that feel like a feature list, not a game landing page. Too much text explaining things, key dimensions (traits, plan generation, economy) get buried or lost. The hero is cluttered with orbiting domain icons + stats + subtitle. No trait showcase anywhere. The AI plan generation "wow factor" is missing entirely.

### New Architecture — Consolidate to 6 Punchy Sections

```text
┌─────────────────────────────────────────────┐
│  1. HERO — Cinematic, minimal               │
│     Orb (fast) + One-liner + CTA            │
│     No stats bar, no orbiting icons          │
│     Gaming tagline only. Mystery > explain.  │
├─────────────────────────────────────────────┤
│  2. ORB NFT GALLERY (existing carousel)      │
│     Keep as-is — already strong              │
├─────────────────────────────────────────────┤
│  3. THE CITY — Consolidated "What's Inside"  │
│     6 flashy "district" cards in 2x3 grid:   │
│     • 14 Domains (domain icons mini-grid)    │
│     • Trait System (NFT trait cards preview)  │
│     • AI Plan Engine (animated plan gen)     │
│     • Hypnosis Engine (visualizer bars)      │
│     • MOS Economy (wallet + mining)          │
│     • Coach Marketplace (find/become)        │
│     Each card: icon, bold title, 1-line,     │
│     small animated visual element inside     │
├─────────────────────────────────────────────┤
│  4. TRAITS SHOWCASE — NEW                    │
│     NFT-style trait cards grid (6-8 traits)  │
│     Glowing cards with pillar colors         │
│     Show trait icons + names, no metrics     │
│     Mysterious "Your identity, evolved"      │
├─────────────────────────────────────────────┤
│  5. THE PLAN — NEW "AI Generates Your Path"  │
│     Animated cinematic sequence showing:     │
│     Orb pulse → "Scanning..." → Pillars      │
│     light up → Plan materializes             │
│     No details on HOW — just the magic       │
│     "100 Days. Engineered by AI."            │
├─────────────────────────────────────────────┤
│  6. FINAL CTA — Keep existing (already good) │
└─────────────────────────────────────────────┘
```

### Detailed Changes

**1. GameHeroSection.tsx — Strip down to cinematic minimum**
- Remove orbiting domain icons entirely
- Remove stats bar (14 / 100 / P2E)
- Remove subtitle paragraph
- Keep: Orb (center, large, fast), gradient title, badge, CTA button
- Add a single mysterious tagline like "Level Up Your Reality"
- Result: clean, dark, gaming-cinematic first impression

**2. OrbCollectionSection — No changes**

**3. NEW: CityShowcaseSection.tsx — Replaces DomainCitySection + AuroraCoachSection + HypnosisSection + TheSystemSection + Play2EarnSection + GuildSection + CoachOSSection (7 sections → 1)**
- 2x3 grid of "district" cards, each ~200px tall
- Each card has a bold icon, title, one-liner, and a small animated visual:
  - **Domains**: Mini 7-icon row showing domain icons
  - **Traits**: 3 small glowing NFT-style badge previews
  - **AI Plan**: Animated "generating..." dots/pulse
  - **Hypnosis**: Mini audio visualizer bars (3-4 bars)
  - **Economy**: "1,240 MOS" counter with coin icon
  - **Coaches**: "Find / Build" dual badge
- Dark card style, colored borders matching each theme
- No long descriptions — just enough to intrigue

**4. NEW: TraitShowcaseSection.tsx**
- Grid of 6-8 trait cards from the existing pillar system
- Each card: square, dark bg, glowing border (pillar color), icon + trait name
- No XP, no levels — identity-focused per memory
- Header: "Your Character. Your NFT." / "הדמות שלך. ה-NFT שלך."
- Subtle floating glow particles behind grid

**5. NEW: PlanCinematicSection.tsx**
- Full-width cinematic section
- Animated sequence (CSS/framer-motion):
  1. Orb pulses at center
  2. Scan lines emanate outward
  3. 3-4 pillar icons light up sequentially
  4. A "plan card" fades in below: "Your 100-Day Path — Generated"
- Tagline: "AI scans your DNA. Builds your path. You just play."
- No details about phases/steps — keep it mysterious and flashy
- Dark bg with primary glow

**6. FinalCTASection — Keep as-is**

### Index.tsx Update
```tsx
<GameHeroSection />        // Cinematic minimal hero
<OrbCollectionSection />   // NFT orb carousel
<CityShowcaseSection />    // 6 district cards (consolidated)
<TraitShowcaseSection />   // NFT trait gallery
<PlanCinematicSection />   // AI plan generation cinema
<FinalCTASection />        // Epic CTA
```

### Files to Create
- `src/components/home/CityShowcaseSection.tsx`
- `src/components/home/TraitShowcaseSection.tsx`
- `src/components/home/PlanCinematicSection.tsx`

### Files to Edit
- `src/components/home/GameHeroSection.tsx` — strip to minimal
- `src/components/home/index.ts` — add new exports
- `src/pages/Index.tsx` — new section order

### Files No Longer Used in Homepage
DomainCitySection, AuroraCoachSection, HypnosisSection, TheSystemSection, Play2EarnSection, GuildSection, CoachOSSection — kept in codebase but removed from Index.

