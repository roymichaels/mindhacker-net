

# Neural Intake V3 + Unified Command Center -- Delta Implementation

## Current State Assessment

The V2 implementation already covers ~80% of what V3 requires. This plan addresses only the gaps.

## What's Already Done (No Changes Needed)
- 13-step intake flow with 5 phases (State Diagnosis, Biological Baseline, Time Architecture, Psychological OS, Commitment Filter)
- Diagnostic scores (Nervous System, Energy, Hormonal Risk, Dopamine Load, Time Optimization)
- Daily Pulse check-in (5 variables, micro-step UI)
- Weekly Recalibration engine + RecalibrationSummary component
- Risk prediction in `aurora-recalibrate`
- Adaptive hypnosis context enrichment
- Unified dashboard at `/dashboard` with HUD + Plan columns
- AI prompt with 8-8-8 structure, hypnosis calibration, biological profile
- Auto-save on every step

## What Changes (The V3 Delta)

### 1. Add Missing Intake Steps to `onboardingFlowSpec.ts`

Upgrade from 13 steps to 16 steps by adding/expanding:

**New Step 0 (insert before current Step 1):** Entry Context
- "I'm here to fix my life structure / optimize performance / recover energy / build income / build discipline"
- Save to `step_1_intention.entry_context`

**Expand Step 2:** Add `failure_moment` mini-step
- "When do you fail most often?" (Morning start / Midday drift / Evening collapse / Late-night spiral / Random)

**Expand Step 2 (Functional Impairment):** Increase from 5 to 8 options per pressure zone, enforce max 3 selections

**Expand Step 5 (Sleep):** Add:
- `sleep_duration_avg` (selector: <5h / 5-6h / 6-7h / 7-8h / 8h+)
- `wake_during_night` (never / 1x / 2x+ / often)
- `sunlight_after_waking` (yes / no / sometimes)

**New Step 6 (Stimulants & Downers):** Split from current dopamine step
- Caffeine count + first caffeine timing
- Alcohol frequency
- Nicotine (no / sometimes / daily)
- Weed/THC (no / sometimes / weekly / daily)

**Expand Step 7 (Dopamine):** Add:
- `shorts_reels` (never / sometimes / daily / heavy daily)
- `gaming` (none / weekends / few days / daily)
- `porn_frequency` (prefer not / never / monthly / weekly / 2-5x / daily)
- `late_night_scrolling` (never / sometimes / often)

**Expand Step 8 (Nutrition):** Add:
- `meals_per_day` (1 / 2 / 3 / 4+)
- `nutrition_weak_point` (sugar / late-night eating / skipping meals / ultra-processed / inconsistent timing)

**Expand Step 10 (Life Load):** Add:
- `training_window_available` (morning / midday / evening / none consistent)

**New Step 12: Friction Trigger** (insert after Execution Pattern)
- "What usually breaks you?" (Too tired / Too distracted / Too overwhelmed / Too perfectionist / Too emotionally reactive / No clear next step)

**Expand Step 14 (was 11, 90-Day Vector):** Add:
- `non_negotiable_constraint` (time / money / family / mental state / health / environment)

**New Step 15: System Preferences**
- `hypnosis_style` (calm / intense / direct / spiritual / scientific / coach-like)
- `preferred_session_length` (8 / 12 / 20 minutes)
- `preferred_reminders` (minimal / normal / strict)

Total: 16 steps, ~65-80 variables.

### 2. Update OnboardingFlow.tsx Auto-Save Keys

Add all new answer keys to `STEP1_KEYS` and `STEP2_KEYS` arrays. New keys:
- STEP1: `entry_context`, `failure_moment`, `non_negotiable_constraint`
- STEP2: `sleep_duration_avg`, `wake_during_night`, `sunlight_after_waking`, `first_caffeine_timing`, `nicotine`, `weed_thc`, `shorts_reels`, `gaming`, `porn_frequency`, `late_night_scrolling`, `meals_per_day`, `nutrition_weak_point`, `training_window_available`, `friction_trigger`, `hypnosis_style`, `preferred_session_length`, `preferred_reminders`

Update phase labels to cover steps 0-16.

### 3. Rewrite OnboardingReveal.tsx -- Unified Diagnostics + Week 1 Protocol

Replace current scores-only screen with a single cohesive reveal:

**Top Section:** 6 diagnostic scores (0-100) with 1-line interpretations
- Energy Stability
- Recovery Debt (new -- computed from sleep misses + screen + caffeine)
- Dopamine Load
- Execution Reliability (new -- derived from execution pattern + friction trigger)
- Time Leverage (renamed from Time Optimization)
- Hormonal Risk

**Middle Section:** "Your Week 1 Protocol"
- 3 Anchor Habits (computed from intake: e.g., "Wake at 6:30", "No screen after 22:00", "10min walk after waking")
- 3 Focus Blocks (aligned to energy peak time)
- 1 Recovery Block
- 1 Training Window suggestion

**Bottom Section:** "Your Daily Structure" (8-8-8 preview)
- Sleep block (derived from wake/sleep times)
- Deep work window (aligned to energy peak)
- Admin block
- Training window (from `training_window_available`)
- Personal development window
- Recovery window

**CTA:** "Start Today" navigates to `/dashboard`

### 4. Update AI Prompt (`launchpad-ai-prompt.ts`)

Expand the input data description to include all new V3 variables. Add to output schema:
- `week1_protocol` object with `anchor_habits`, `focus_blocks`, `recovery_block`, `training_suggestion`
- `plan_aggressiveness_level` (1-10, derived from urgency x commitment x available bandwidth)
- `execution_reliability_score` (new diagnostic)
- `recovery_debt_score` (new diagnostic)

### 5. Update `generate-launchpad-summary/index.ts`

Pass all new V3 fields into `buildAnalysisPrompt()`. The existing structure already handles most of the data flow -- just needs the new field names added to the data extraction.

### 6. Enhance Dashboard Command Center Layout

Restructure `MobileHeroGrid.tsx` for the 3-column Command Center on desktop:

**Column A (Today):** Next actions + Daily Pulse + Hypnosis session button
**Column B (This Week):** Habits + Tasks + 90-Day Plan progress + Milestones + Recalibration summary
**Column C (Diagnostics):** 6 diagnostic scores + recommended levers + Identity/Direction/Insights buttons

Mobile: stacked cards in priority order (Today first, then Week, then Diagnostics).

Desktop grid changes from current `grid-cols-[300px_1fr]` to `grid-cols-3`.

### 7. Update Diagnostic Score Computations

Add two new score functions in OnboardingReveal:
- `computeRecoveryDebt()` -- from sleep quality + screen before bed + caffeine + alcohol + wake_during_night
- `computeExecutionReliability()` -- from execution pattern + friction trigger + commitment level

Update existing functions to use new V3 variables (sunlight, nicotine, gaming, etc.).

## Files Modified

| File | Change |
|------|--------|
| `src/flows/onboardingFlowSpec.ts` | Add 3 new steps + expand 6 existing steps (~200 new lines) |
| `src/components/onboarding/OnboardingFlow.tsx` | Update STEP1/STEP2 key arrays + phase labels for 16 steps |
| `src/components/onboarding/OnboardingReveal.tsx` | Full rewrite -- 3-section reveal (scores + week 1 protocol + daily structure) |
| `src/components/dashboard/MobileHeroGrid.tsx` | Restructure to 3-column Command Center (desktop) |
| `supabase/functions/_shared/launchpad-ai-prompt.ts` | Add new variables + week1_protocol to output schema |
| `supabase/functions/generate-launchpad-summary/index.ts` | Pass new V3 fields to AI prompt |

## No Database Changes

All new variables fit into existing JSON columns (`step_1_intention`, `step_2_profile_data`). No new tables needed -- `daily_pulse_logs` and `recalibration_logs` already exist.

## Execution Order

1. Expand `onboardingFlowSpec.ts` with all V3 steps and questions
2. Update `OnboardingFlow.tsx` auto-save keys and phase labels
3. Rewrite `OnboardingReveal.tsx` with unified diagnostics + week 1 protocol
4. Update AI prompt and summary generator for new variables
5. Restructure `MobileHeroGrid.tsx` into 3-column Command Center
