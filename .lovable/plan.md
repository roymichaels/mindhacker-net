

# Homepage Redesign -- High-Conversion, Feature-Honest Landing Page

## Goal
Rebuild the homepage to authentically showcase everything the app offers, use Aurora's HoloOrb as the visual anchor, and maximize sign-up conversion -- without fabricated claims.

---

## New Section Flow (7 sections)

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Hero** | Aurora HoloOrb center-stage (large, ~200px), orbiting domain icons (all 11 domains). Headline: "Your Life, Upgraded by AI." Clear value prop subtitle. Single primary CTA. |
| 2 | **Two Worlds** (Core + Arena) | Side-by-side cards showing the 6 Core domains (Image, Power, Vitality, Focus, Combat, Expansion) and 5 Arena domains (Wealth, Influence, Relationships, Business, Projects). Each domain gets its icon + one-liner. Communicates breadth. |
| 3 | **Aurora Coach** | Redesigned with AuroraHoloOrb (replacing PresetOrb). Chat preview showing cross-pillar intelligence. Feature bullets: 24/7 coaching, voice-to-text, personalized memory, hypnosis sessions. |
| 4 | **How It Works** (3 steps) | Simple 3-step flow: 1) Take the Assessment (5 min) -> 2) Get Your 90-Day Plan -> 3) Execute Daily with Aurora. Clean, no fluff. |
| 5 | **Feature Showcase Grid** | 6 cards: AI Coaching, Custom Hypnosis, Gamification (XP/Levels/Badges), Progress Dashboard, Personalized Orb Avatar, Combat Training. Each with icon + short description. |
| 6 | **Before vs After** | Keep existing TransformationProofSection (authentic, no fake numbers). Minor polish. |
| 7 | **Final CTA** | Aurora HoloOrb, strong headline, feature checklist, single CTA button. Remove countdown timer (felt manipulative). |

---

## Key Changes

### Visual Identity
- Replace all `PresetOrb` instances in homepage with `AuroraHoloOrb` (larger sizes: 120-200px)
- Aurora HoloOrb becomes the hero visual -- no more generic WebGL orb
- Keep orbiting domain icons but use all 11 domains from `CORE_DOMAINS` + `ARENA_DOMAINS`

### Sections Removed
- `FearOfMissingOutSection` (countdown timer to midnight -- feels dishonest)
- `SystemArchitectureSection` (too technical)
- `LifePillarsSection` (merged into "Two Worlds")
- `FreeJourneyBannerSection` (no subscription/pricing talk)
- `HandsFreeSection` (voice features folded into Aurora Coach section)

### Sections Added/Replaced
- **"Two Worlds"** -- new component showing Core + Arena split with all domain icons
- **"How It Works"** -- simple 3-step onboarding flow
- **"Feature Showcase"** -- grid highlighting key platform capabilities

### Conversion Tactics (honest)
- Single, repeated CTA: "Start Your Assessment" (links to `/onboarding`)
- Trust signals: "5 minutes to start", "Cancel anytime", "Personalized from day 1"
- Before/After section stays (authentic pain/gain framing)
- No fake user counts, no fake testimonials, no countdown timers

---

## Technical Plan

### Files to Create
1. `src/components/home/TwoWorldsSection.tsx` -- Core + Arena domain showcase
2. `src/components/home/HowItWorksSection.tsx` -- 3-step flow
3. `src/components/home/FeatureShowcaseSection.tsx` -- 6-card feature grid

### Files to Edit
4. `src/components/home/GameHeroSection.tsx` -- Replace PresetOrb with large AuroraHoloOrb, use all 11 domains, simplify copy
5. `src/components/home/AuroraCoachSection.tsx` -- Replace PresetOrb with AuroraHoloOrb, remove ego-state orbit (too esoteric for landing), keep chat preview
6. `src/components/home/FinalCTASection.tsx` -- Replace PresetOrb with AuroraHoloOrb, remove "what you get" grid (moved to Feature Showcase), streamline
7. `src/components/home/TransformationProofSection.tsx` -- Minor copy polish only
8. `src/components/home/index.ts` -- Update exports
9. `src/pages/Index.tsx` -- New section order: Hero -> TwoWorlds -> HowItWorks -> AuroraCoach -> FeatureShowcase -> TransformationProof -> FinalCTA

### Translation Keys
- Will add inline bilingual strings (HE/EN) directly in components, following the existing pattern used in TransformationProofSection and FinalCTASection

### No Database Changes
- Purely frontend redesign

