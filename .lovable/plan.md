

# MindOS Neural Architecture Intake V2 -- Full Rewrite

## Overview

Replace the current shallow 5-step onboarding flow (`onboardingFlowSpec.ts`) with a comprehensive 5-phase, 13-step neural intake system. This collects measurable behavioral variables (not emotional fluff) to power: hormonal optimization scores, 8-8-8 daily structure generation, personalized hypnosis calibration, and a fully customized 90-day plan.

## Current State

- **Onboarding** (`onboardingFlowSpec.ts`): 5 steps, ~12 questions total (friction type, tension, desired shift, commitment, light personalization)
- **Launchpad** (`coreLaunchpadSpec.ts`): 10 steps with deeper profile but still missing biological/hormonal/dopamine/time architecture data
- **AI Summary** (`generate-launchpad-summary`): Generates consciousness analysis + 90-day plan but lacks biological baseline data
- **OnboardingReveal**: Shows basic pillar mapping, triggers `generate-launchpad-summary`

## What Changes

### 1. Rewrite `src/flows/onboardingFlowSpec.ts` -- The Neural Intake

Replace all 5 steps with 13 steps across 5 phases:

**PHASE 1 -- STATE DIAGNOSIS**
- Step 1: Primary Pressure Zone (single_select, 7 options: cognitive overload, energy instability, career stagnation, financial instability, emotional strain, direction confusion, lack of structure)
- Step 2: Functional Impairment (branched multi_select -- 5 neuro-behavioral signals per pressure zone, e.g., "racing thoughts", "crash after lunch", "doom scrolling")

**PHASE 2 -- BIOLOGICAL BASELINE**
- Step 3: Biological Identity (age bracket, gender, body fat estimate, physical activity level)
- Step 4: Sleep Structure (wake time picker, sleep time picker, avg sleep duration, sleep quality 1-5 slider, screen before bed yes/no)
- Step 5: Dopamine Load (screen time, social media frequency, porn frequency, caffeine intake, alcohol frequency)
- Step 6: Physical Inputs (diet type, protein awareness, water intake, sun exposure, cold exposure)

**PHASE 3 -- TIME ARCHITECTURE**
- Step 7: Work Reality (work type, daily work hours slider, commute duration, energy peak time, energy crash time)
- Step 8: Life Load (dependents, household responsibility, social life frequency)

**PHASE 4 -- PSYCHOLOGICAL OPERATING SYSTEM**
- Step 9: Execution Pattern (single_select: start-and-quit, overplan-and-delay, avoid hard tasks, burn out quickly, intense but inconsistent, consistent but plateaued)
- Step 10: Motivation Driver (single_select: fear of failure, desire for status, identity upgrade, freedom, stability, approval)
- Step 11: 90-Day Vector (primary target single_select + "why does this matter" textarea + urgency 1-10 slider)

**PHASE 5 -- COMMITMENT FILTER**
- Step 12: Lifestyle Restructure Willingness (1-10 slider)
- Step 13: Final Notes (textarea -- anything else the system should know)

All questions store to `step_1_intention` (phase 1) and `step_2_profile_data` (phases 2-5) in `launchpad_progress`, maintaining DB compatibility.

### 2. Rewrite `src/components/onboarding/OnboardingReveal.tsx` -- Neural Diagnostics Screen

After completion, show a diagnostics dashboard with computed scores:
- Nervous System State (derived from pressure zone + functional impairment)
- Energy Stability Score (from sleep + dopamine load + physical inputs)
- Hormonal Risk Index (from body fat + activity + sun/cold exposure + sleep quality)
- Dopamine Load Index (from screen time + social media + porn + caffeine + alcohol)
- Time Optimization Potential (from work hours + commute + dependents vs available time)
- 90-Day Roadmap Preview (from target + urgency + commitment)
- Personalized Hypnosis Theme for Week 1

These are computed client-side as preview scores, then the AI refines them.

### 3. Update `supabase/functions/_shared/launchpad-ai-prompt.ts` -- Enhanced AI Prompt

Expand the system prompt to:
- Accept and process all new biological/hormonal/dopamine data
- Generate an optimized 8-8-8 daily structure (Sleep Block, Deep Work Block, Admin Block, Training Window, Personal Development Window, Recovery Window) based on wake/sleep times, work hours, peak energy
- Compute hormonal reset priority score
- Generate hypnosis personalization variables (tone from motivation driver, theme from pressure zone, intensity from commitment score, length from available free time, frequency from dopamine load)
- Include the diagnostic scores in the output JSON schema

### 4. Update `supabase/functions/generate-launchpad-summary/index.ts` -- Data Pipeline

- Update `buildAnalysisPrompt()` to pass all new fields (biological baseline, dopamine load, physical inputs, time architecture, execution pattern, motivation driver, 90-day vector, commitment score) to the AI
- Update the output JSON schema to include `daily_structure` (8-8-8 blocks), `hormonal_profile`, `dopamine_index`, `hypnosis_calibration`
- These new fields get saved into `launchpad_summaries.summary_data` (existing JSON column, no schema change needed)
- The 90-day plan generation uses the new time architecture to place tasks in correct time blocks

### 5. Update `src/flows/onboardingFlowSpec.ts` exports

Update `FRICTION_PILLAR_MAP` to map new pressure zones to pillars. Update `PILLAR_SUGGESTIONS` with more targeted suggestions based on the richer data.

### 6. Auto-save mapping in `OnboardingFlow.tsx`

Update the `autoSave` callback to persist all new answer keys:
- Phase 1 answers -> `step_1_intention`
- Phase 2-5 answers -> `step_2_profile_data`

## Files Modified

| File | Change |
|------|--------|
| `src/flows/onboardingFlowSpec.ts` | Full rewrite -- 13 steps, 5 phases, ~45 questions |
| `src/components/onboarding/OnboardingFlow.tsx` | Update auto-save to handle all new keys |
| `src/components/onboarding/OnboardingReveal.tsx` | Full rewrite -- neural diagnostics screen with computed scores |
| `supabase/functions/_shared/launchpad-ai-prompt.ts` | Enhanced prompt with 8-8-8, hormonal, dopamine, hypnosis calibration |
| `supabase/functions/generate-launchpad-summary/index.ts` | Update `buildAnalysisPrompt()` to pass new data fields |

## No Database Changes Needed

All new data fits into existing JSON columns (`step_1_intention`, `step_2_profile_data`) in `launchpad_progress`. The AI summary output goes into the existing `summary_data` JSON column in `launchpad_summaries`.

## Integration Points (Already Wired)

- `generate-launchpad-summary` already populates `aurora_life_direction`, `aurora_identity_elements`, `aurora_commitments`, `aurora_daily_minimums`, `life_plans`, `life_plan_milestones`
- Dashboard already reads from these tables for Identity Card, AI Analysis, 90-Day Plan, etc.
- Hypnosis script generator already reads from `launchpad_summaries.summary_data` -- it will automatically pick up the new calibration data
- Aurora chat context builder already reads the Life Model tables

No new wiring needed. The richer input data flows through existing pipelines and automatically improves all downstream personalization.

