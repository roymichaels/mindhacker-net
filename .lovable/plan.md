

# Whitepaper & Codebase Audit — "14 → 15 Pillars" + Content Sync + Directory Cleanup

## Part 1: What's Wrong — Audit Findings

### A. Pillar Count Mismatch (14 → 15)

The source of truth `CORE_DOMAINS` in `src/navigation/lifeDomains.ts` has **15 pillars**:
1. Consciousness, 2. Image, 3. Power, 4. Vitality, 5. Focus, 6. Combat, 7. Expansion, 8. Wealth, 9. Influence, 10. Relationships, 11. Business, 12. Projects, 13. Play, 14. Order, 15. Romantics

But **"14"** is hardcoded in dozens of places:

| File | What says "14" |
|------|---------------|
| `Documentation.tsx` | Section 3 (methodology), 4.1 (Play), 5.0 (Aurora), subscription model, conclusion — all say "14 עמודי חיים" / "14 life pillars" |
| `VisualWhitepaper.tsx` | Hero slide (StatCard value=14), methodology slide, subscription slide ("All 14 pillars") |
| `i18n/translations/en.ts` | `twoWorlds` section: "14 Life Domains", "14 pillars", "The 14 Pillars" |
| `usePillarAccess.ts` | Comment: "Apex: all 14 pillars" |
| `data/featureShowcaseData.ts` | "14 domains" with wrong split "7 Core + 7 Arena" |
| `PricingPreviewSection.tsx` | "All 14 pillars unlocked" |
| `CommunityHeader.tsx` | "14 pillars. One civilization." |
| `CommunityPulse.tsx` | "14 pillars. One civilization." |
| `ArenaHudSidebar.tsx` | "All 14 pillars in action" |
| `OnboardingPillarSelection.tsx` | Comment: "all 14 pillars" |
| `DailyMilestones.tsx` | Comment: "ALL 14 pillars" |

**Already correct (says 15):** `subscriptionTiers.ts` Apex tier, `pillarColors.ts` comment.

### B. Pillar Split Description is Wrong

The whitepaper (section 4.1) says: "6 Life pillars + 6 Arena pillars + Consciousness and Craft"

**Actual current split:** All 15 are unified under Core. There is no "Craft" pillar. The 15th pillar is "Romantics". The whitepaper description of the split is completely outdated.

### C. PILLAR_QUESTS Registry is Stale

`src/flows/pillarSpecs/index.ts` has 14 entries with **old IDs** that don't match `CORE_DOMAINS`:
- Has `health`, `mind`, `relationships`, `career`, `money`, `creativity`, `social`, `spirituality` — these IDs don't exist in `CORE_DOMAINS`
- Missing: `power`, `vitality`, `focus`, `expansion`, `wealth`, `influence`, `business`, `projects`, `romantics`

### D. Whitepaper Content Gaps

Beyond the pillar count, the whitepaper text still references outdated architecture:
- Says "6 Life + 6 Arena + Consciousness and Craft" — should be "15 unified pillars"
- Subscription section says Command gets "all 14" — should be "all 15"
- No mention of the 15th pillar (Romantics) anywhere in whitepaper
- The `featureShowcaseData.ts` says "7 Core + 7 Arena" which is also wrong

---

## Part 2: The Fix Plan

### Task 1: Update all "14" references to "15"

**Files to edit** (all instances of "14 pillars" / "14 עמודי חיים" / "14 Life Domains" → "15"):

1. `src/pages/Documentation.tsx` — ~12 occurrences across sections 3, 4.1, 5.0, 5.1, 11, 18 (conclusion)
2. `src/components/docs/VisualWhitepaper.tsx` — Hero StatCard, methodology slide, subscription slide
3. `src/i18n/translations/en.ts` — twoWorlds section (3 strings)
4. `src/i18n/translations/he.ts` — corresponding Hebrew strings
5. `src/hooks/usePillarAccess.ts` — comment only
6. `src/data/featureShowcaseData.ts` — description text
7. `src/components/home/PricingPreviewSection.tsx` — Apex features
8. `src/components/community/CommunityHeader.tsx` — subtitle
9. `src/components/community/CommunityPulse.tsx` — subtitle
10. `src/components/arena/ArenaHudSidebar.tsx` — label
11. `src/components/onboarding/OnboardingPillarSelection.tsx` — comment
12. `src/components/hubs/DailyMilestones.tsx` — comment

### Task 2: Fix pillar split description in whitepaper

Update section 4.1 in `Documentation.tsx` and slide 3-4 in `VisualWhitepaper.tsx`:
- Remove "6 Life + 6 Arena + Consciousness and Craft"
- Replace with accurate: "15 unified life pillars: Consciousness, Image, Power, Vitality, Focus, Combat, Expansion, Wealth, Influence, Relationships, Business, Projects, Play, Order, and Romantics"
- Add Romantics pillar description where pillars are listed

### Task 3: Update featureShowcaseData.ts

Fix the "7 Core + 7 Arena" description to reflect unified 15-pillar model with Romantics included.

### Task 4: Sync PILLAR_QUESTS with CORE_DOMAINS (deferred — separate task)

The `PILLAR_QUESTS` array uses completely different IDs than `CORE_DOMAINS`. This is a larger refactor touching quest specs, flow registration, and database paths. Flag for a dedicated follow-up, not part of this whitepaper update.

---

## Part 3: Directory Organization — Project Architecture Diagram

### Task 5: Generate a Mermaid architecture diagram

Create a comprehensive `.mmd` file at `/mnt/documents/` that maps the full project structure:

```text
MindOS App
├── 5 Core Experiences (Hubs)
│   ├── Play (PlayHub) — Strategy + Tactics + Execution
│   ├── Aurora (AuroraPage) — AI Chat + Journal + Voice
│   ├── FreeMarket (FMAppShell) — Marketplace + Earn + Wallet
│   ├── Community — Feed + Stories + Events
│   └── Learn (Courses) — Adaptive Learning + Journeys
├── 15 Life Pillars (unified under Core)
│   └── Assessment → Strategy → Tactics → Execution pipeline
├── 5 Career Paths (CareerHub)
│   └── Business, Coach, Therapist, Creator, Freelancer
├── Supporting Systems
│   ├── Gamification (XP, Levels, Streaks, Badges)
│   ├── Hypnosis & Meditation
│   ├── Soul Avatar NFT + Web3
│   ├── MOS Economy + Tokenomics
│   └── Subscription (Awakening/Optimization/Command)
└── Infrastructure
    ├── Auth (Web3Auth + backend sessions)
    ├── Edge Functions
    └── Database (RLS-protected)
```

The diagram will map actual component files and pages to their functional areas, making the codebase navigable.

---

## Summary of Changes

| # | Task | Files | Scope |
|---|------|-------|-------|
| 1 | "14" → "15" everywhere | ~12 files | Text updates |
| 2 | Fix pillar split description | 2 files | Content rewrite |
| 3 | Fix featureShowcaseData | 1 file | Text update |
| 4 | Architecture diagram | 1 new `.mmd` file | Documentation |

Total: ~15 file edits + 1 new diagram file. No structural/behavioral changes — purely content accuracy and documentation.

