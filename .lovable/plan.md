

## Homepage Full Overhaul — NFT/Play2Earn Gaming Style

### Problem
The current homepage is generic and boring — just 6 bland sections with marketing copy. It doesn't reflect that this is a **digital self-improvement city** with a play-to-earn economy, living orb avatars, AI hypnosis, 14 life domains, a wallet system, community, learning engine, coach marketplace, and gamification.

### Vision
Redesign the homepage as an **immersive NFT game landing page** — dark, neon-accented, with a cyberpunk/gaming aesthetic. Think Axie Infinity meets Notion meets a metaverse city map. Every major feature gets its own visually distinct "district" in the city.

### New Section Architecture (10 sections)

1. **Hero — "Enter the City"**
   - Keep the orbiting domains + AuroraHoloOrb but reframe as "Your Digital Self-Improvement City"
   - Gaming tagline: "Level Up. Earn. Transform." 
   - Neon-glow CTA, animated particle grid background
   - Stats bar: "14 Domains • 100-Day Plans • Play2Earn"

2. **The Orb — "Your Living Avatar"** (NEW)
   - Giant CSS orb showcase in center
   - "Your orb evolves as you grow. It reflects your identity DNA — traits, strengths, and progress across 14 life pillars."
   - NFT-card style with rarity tiers and DNA traits preview
   - Glowing card with holographic border effect

3. **The 14 Domains — "The City Map"** (NEW)
   - Visual grid of all 14 life domains as glowing icon cards
   - Each card: icon, name, color, short description
   - Styled as "districts" in a city — dark cards with colored glow borders
   - Subtitle: "Consciousness • Power • Wealth • Combat • and 10 more"

4. **Aurora AI Coach — "Your Personal AI"** (REVAMP)
   - Keep orb + feature grid but add gaming flair
   - Features: 24/7 coaching, voice, full memory, generates hypnosis, knows all 14 domains
   - Add "One Brain" concept — Aurora connects everything

5. **AI Hypnosis — "Reprogram Your Mind"** (NEW)
   - Dark immersive section with breathing/wave animation
   - "AI-generated hypnosis sessions personalized from your conversations"
   - Features: Real-time generation, karaoke text, breathing guide, session stats

6. **The System — "100-Day Transformation OS"** (REVAMP)
   - Keep 3-phase timeline but style as a game quest progression
   - Phase icons as quest markers, connecting line as a "quest path"
   - Assess → Strategize → Execute daily

7. **Play2Earn Economy — "Proof of Growth"** (NEW)
   - MOS token showcase with wallet preview card
   - "Mine tokens by completing real actions. Cash out or trade."
   - Features: Activity mining, data marketplace, wallet, 100 MOS = $1
   - Styled as a crypto/DeFi dashboard card

8. **Community & Learning — "Join the Guild"** (NEW)
   - Split card: Community forums + Learning engine
   - Community: posts, discussions, player cards, leaderboards
   - Learning: AI-generated courses, pillar-based modules
   - Guild/clan aesthetic

9. **Coach OS — "Build Your Empire"** (NEW)
   - For practitioners: CRM, landing pages, digital products, analytics
   - Styled as a "business district" card
   - "Run your coaching business inside the city"

10. **Final CTA + Pricing** (MERGE)
    - Combine pricing tiers with final CTA into one epic section
    - 3 tiers as "rank cards" (Awakening / Optimization / Command)
    - Gaming rank aesthetic with glow effects
    - Single CTA button at bottom

### Files to Change

- **`src/components/home/GameHeroSection.tsx`** — Rewrite: gaming city theme, stats bar, new copy
- **`src/components/home/TheSystemSection.tsx`** — Restyle as quest progression path
- **`src/components/home/AuroraCoachSection.tsx`** — Add gaming flair, expand features
- **`src/components/home/AppPreviewSection.tsx`** — DELETE, replaced by domain grid + orb section
- **`src/components/home/PricingPreviewSection.tsx`** — Merge into FinalCTA, rank card style
- **`src/components/home/FinalCTASection.tsx`** — Merge with pricing, epic gaming CTA

New files:
- **`src/components/home/OrbShowcaseSection.tsx`** — Living avatar NFT showcase
- **`src/components/home/DomainCitySection.tsx`** — 14-domain grid as city districts
- **`src/components/home/HypnosisSection.tsx`** — AI hypnosis feature showcase
- **`src/components/home/Play2EarnSection.tsx`** — FM economy, wallet, mining
- **`src/components/home/GuildSection.tsx`** — Community + Learning combined
- **`src/components/home/CoachOSSection.tsx`** — Coach marketplace/business district

Updated files:
- **`src/pages/Index.tsx`** — New 10-section layout
- **`src/components/home/index.ts`** — Updated exports
- **`src/i18n/translations/en.ts`** — All new section translation keys
- **`src/i18n/translations/he.ts`** — All new section translation keys (Hebrew)

### Design Direction
- **Dark cyberpunk gaming aesthetic** — dark cards, neon borders, glow effects
- All cards use `bg-card/80 backdrop-blur border border-{color}/30 shadow-lg shadow-{color}/10`
- Holographic shimmer effects on key cards (orb, pricing ranks)
- Grid backgrounds with low-opacity primary color lines
- Section transitions with gradient fades
- Mobile-first, responsive grids
- Keep all i18n patterns (Hebrew + English)

