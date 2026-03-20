

# Founding Members Landing Wizard — Implementation Plan

## Overview
A new route `/founding` hosting a full-screen, multi-step wizard experience targeting Israeli audiences. 10 sections navigated via "Next" progression, ending with an application form that saves to the database. Dark neon Web3 aesthetic, Hebrew-first RTL, mobile-first.

## Architecture

**New files to create:**

1. **`src/pages/FoundingLanding.tsx`** — Main wizard page with step state management (0–9), keyboard/swipe navigation, progress indicator, and smooth animated transitions between sections.

2. **`src/components/founding/` directory** with one component per section:
   - `FoundingHero.tsx` — Section 1: Glowing orb (reuse `PersonalizedOrb`), headline, CTA button
   - `FoundingProblem.tsx` — Section 2: Pain points with staggered fade-in text blocks
   - `FoundingSystem.tsx` — Section 3: Animated vertical step flow (enter → choose → tasks → progress → earn)
   - `FoundingBenefits.tsx` — Section 4: Icon grid with neon-glow cards
   - `FoundingMembers.tsx` — Section 5: "100 founding members" exclusive positioning
   - `FoundingRole.tsx` — Section 6: Opportunity cards (create, share, invite, feedback)
   - `FoundingEarning.tsx` — Section 7: Earning paths — simple, no percentages/tokenomics
   - `FoundingWhyNow.tsx` — Section 8: Urgency/scarcity messaging
   - `FoundingFinalCTA.tsx` — Section 9: Final call-to-action
   - `FoundingApplyForm.tsx` — Section 10: Application form (name, social handle, occupation, why join, how contribute) → saves to DB → success state
   - `FoundingBackground.tsx` — Shared animated background (particle dots, radial neon glows, subtle parallax)
   - `WizardNav.tsx` — Bottom navigation bar with dot progress + Next/Back buttons

3. **Database migration** — New `founding_applications` table:
   - `id`, `name`, `social_handle`, `occupation`, `why_join`, `how_contribute`, `referral_code`, `status` (pending/accepted/rejected), `created_at`
   - RLS: insert for anon/authenticated, select own rows only

4. **Route registration** in `src/App.tsx` — Add `/founding` as a public route

## Visual System
- All sections use a shared dark background (`#050505`) with layered radial gradients (purple `#7c3aed`, cyan `#06b6d4`, blue `#3b82f6`)
- Neon glow effects via `box-shadow` and `blur` filters
- Framer Motion for all transitions: `AnimatePresence` with directional slide + fade
- Reuse existing `PersonalizedOrb` component for the hero soul orb
- Each section gets a unique accent glow color for "different world" feel

## RTL & Language
- Hebrew as primary, English secondary via `useTranslation` / `isRTL`
- All text hardcoded bilingual (like existing `Go.tsx` pattern)
- `dir="rtl"` on root container, logical Tailwind properties throughout

## Mobile-First
- Full viewport height sections (`min-h-[100svh]`)
- Touch-friendly large buttons (`py-6 px-10`)
- Swipe gesture support via Framer Motion drag

## Key Interactions
- Wizard progresses via prominent "המשך" (Continue) button
- Section 10 form submits to `founding_applications` table
- Success state shows confirmation message
- UTM/referral params captured on entry via existing `AffiliateTracker`

