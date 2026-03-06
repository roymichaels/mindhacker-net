

## Homepage Full Overhaul

### Current State
The homepage has 12 sections, many of which are generic marketing fluff (Coach Marketplace, Community, Learning Engine, Transformation Proof) that don't reflect the app's core experience: **a 90-day AI-powered life transformation OS** with Aurora coaching, strategic planning across 14 life domains, daily tactical execution, and a gamified orb avatar.

### New Structure — 6 Sections

The homepage will be trimmed to 6 high-impact sections that map directly to the real app flow:

1. **Hero** — Keep the AuroraHoloOrb + orbiting domains visual but rewrite copy to focus on the core promise: "Your AI-powered 90-day transformation system." Sharper subtitle about what happens when you sign up (assessment → strategy → daily execution). Single CTA.

2. **The System** (replaces TwoWorlds + HowItWorks) — One combined section showing the 3-phase flow:
   - Phase 1: Deep Assessment — Aurora scans your 14 life domains
   - Phase 2: 90-Day Strategy — AI generates missions, milestones & protocols
   - Phase 3: Daily Execution — Tactical queue delivered every morning
   Clean vertical timeline layout, no fluff.

3. **Aurora Coach** — Keep but simplify. Remove chat preview examples. Focus on: 24/7 AI coach, remembers everything, voice + text, generates hypnosis sessions. Tighter 2x2 grid.

4. **App Preview** (replaces FeatureShowcase) — Show 3-4 actual app screens/mockups instead of 15-feature sidebar nav. Key screens: Now page (daily queue), Strategy map, Tactics calendar, Orb avatar. Simple horizontal card carousel.

5. **Pricing** — Keep the 3-tier pricing, just clean up copy slightly.

6. **Final CTA** — Keep, simplify checklist to 4 items max.

### Sections Removed
- TwoWorldsSection (merged into "The System")
- HowItWorksSection (merged into "The System")
- FeatureShowcaseSection (replaced by App Preview)
- OrbCollectionSection (too heavy, orb shown in hero already)
- LearningEngineSection (not core to the value prop)
- CoachMarketplaceSection (B2B feature, wrong audience)
- CommunitySection (secondary feature)
- TransformationProofSection (generic before/after)

### Files Changed
- **`src/pages/Index.tsx`** — Remove 8 section imports, add new `TheSystemSection` and `AppPreviewSection`
- **`src/components/home/GameHeroSection.tsx`** — Rewrite copy, tighten layout, remove scroll indicator
- **`src/components/home/TheSystemSection.tsx`** — New file. 3-phase vertical timeline (Assess → Strategize → Execute)
- **`src/components/home/AppPreviewSection.tsx`** — New file. 3-4 card carousel showing real app screens as styled mockup cards
- **`src/components/home/AuroraCoachSection.tsx`** — Simplify: remove chat preview, keep 2x2 feature grid
- **`src/components/home/PricingPreviewSection.tsx`** — Minor copy tweaks
- **`src/components/home/FinalCTASection.tsx`** — Trim checklist to 4 items
- **`src/components/home/index.ts`** — Update exports

### Design Direction
- Darker, more immersive feel (the app itself is dark-mode native)
- Less marketing speak, more "show the system" energy
- Mobile-first sections with clean vertical rhythm
- Keep all existing i18n pattern (Hebrew + English via `useTranslation`)

