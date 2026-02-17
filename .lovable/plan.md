

# Restructure Launchpad into Core + Pillar Quests

## Overview

Transform the 11-step monolithic Launchpad (~40+ min) into a fast Core Launchpad (~15 min, 10 steps) plus 8 optional Pillar Quests (~8-12 min each). No database schema changes. No edge function changes. Same DB columns, same AI pipeline.

## Architecture

### New Files to Create

```text
src/lib/flow/
  types.ts              -- FlowSpec type definitions
  flowSpec.ts           -- FlowSpec registry + helpers

src/components/flow/
  FlowRenderer.tsx      -- Generic 1-question-per-screen engine
  QuestionCard.tsx       -- Single question UI component
  FlowProgress.tsx       -- Progress bar (macro + mini step)

src/flows/
  coreLaunchpadSpec.ts   -- Core 10-step flow definition
  pillarSpecs/
    index.ts
    healthQuestSpec.ts
    moneyQuestSpec.ts
    mindQuestSpec.ts
    relationshipsQuestSpec.ts
    careerQuestSpec.ts
    creativityQuestSpec.ts
    socialQuestSpec.ts
    spiritualityQuestSpec.ts

src/pages/Quests.tsx     -- /quests page with 8 pillar cards + progress
```

### Files to Modify

```text
src/components/launchpad/LaunchpadFlow.tsx   -- Wire FlowRenderer for config-driven steps
src/pages/Launchpad.tsx                      -- Minor: pass quest unlock callback
src/App.tsx (or routes)                      -- Add /quests route
```

### Files NOT Modified

```text
supabase/functions/generate-launchpad-summary/index.ts  -- Untouched
supabase/functions/_shared/launchpad-ai-prompt.ts       -- Untouched
src/hooks/useLaunchpadProgress.ts                       -- Untouched
src/hooks/useLaunchpadAutoSave.ts                       -- Untouched
src/hooks/useGuestLaunchpadProgress.ts                  -- Untouched
src/hooks/useGuestLaunchpadAutoSave.ts                  -- Untouched
src/components/launchpad/steps/FirstChatStep.tsx         -- Kept as custom
src/components/launchpad/steps/IntrospectionStep.tsx     -- Kept as custom
src/components/launchpad/steps/LifePlanStep.tsx          -- Kept as custom
src/components/launchpad/steps/DashboardActivation.tsx   -- Kept as custom
```

---

## Phase 1: FlowSpec Engine

### `src/lib/flow/types.ts`

Define the core types for the flow specification system:

- **FlowSpec**: Top-level flow definition (id, title, steps, dbMapping)
- **FlowStep**: A macro step containing miniSteps
- **MiniStep**: A single question screen with:
  - `id`, `title_he`, `title_en`, `prompt_he`, `prompt_en`
  - `inputType`: `single_select | multi_select | slider | time_picker | textarea | chat`
  - `options[]`: `{ value, label_he, label_en, icon? }`
  - `validation`: `{ required, minSelected?, maxSelected?, minChars? }`
  - `branching?`: `{ showIf: (answers) => boolean }`
  - `dbPath`: `{ table, column, jsonPath? }` -- maps to existing schema
- **FlowState**: Current answers, current miniStep index, completion status

### `src/lib/flow/flowSpec.ts`

Registry that holds all flow specs. Exports:
- `getFlowSpec(id)` -- returns a FlowSpec
- `registerFlow(spec)` -- registers a spec
- `getVisibleMiniSteps(spec, answers)` -- filters by branching rules

### `src/components/flow/QuestionCard.tsx`

Generic renderer for a single MiniStep. Handles:
- `single_select`: Grid of tappable cards (44px+ touch targets)
- `multi_select`: Same grid with multi-select badges
- `slider`: Slider with labels
- `time_picker`: Reuses existing `MobileTimePicker`
- `textarea`: Textarea with character count
- Auto-calls `onAutoSave` on every change
- "Skip" button when `validation.required === false`

### `src/components/flow/FlowRenderer.tsx`

Orchestrator component:
- Renders one `QuestionCard` at a time
- Progress bar: "Step X of Y" (macro) + mini-step dots
- Back button navigates to previous mini-step
- On answer, auto-advances to next visible mini-step
- At end of macro step, calls `onStepComplete(stepNumber, collectedData)`
- Delegates to custom components for steps marked `renderer: 'custom'`

### `src/components/flow/FlowProgress.tsx`

Visual progress indicator showing:
- Current macro step / total
- Mini-step progress within current macro step
- Phase label (Phase 1/2/3)

---

## Phase 2: Core Launchpad Flow Spec

### `src/flows/coreLaunchpadSpec.ts`

10 macro steps. Steps marked `renderer: 'card'` use FlowRenderer. Steps marked `renderer: 'custom'` render existing components unchanged.

**Step 1 -- Intent** (`renderer: 'card'`)
- MiniSteps: `main_area` (multi_select, 12 options), conditional sub-questions (career_specific, health_specific, etc. -- shown based on main_area answers), `emotional_state`, `tried_before`, `help_style`
- DB: `launchpad_progress.step_1_intention` (JSON stringified)
- All options extracted from existing `WelcomeStep.tsx` WELCOME_QUIZ array

**Step 2 -- Essential Profile** (`renderer: 'card'`) -- CUT DOWN
- Include ONLY these miniSteps from PersonalProfileStep CATEGORIES:
  - `age_group`, `gender`, `relationship_status`, `employment_status` (demographics)
  - `stress_level` (mental)
  - `sleep_hours` (health)
  - `life_priorities` (max 3 selections enforced)
  - `growth_focus` (max 3 selections enforced)
  - `obstacles`
- REMOVED from core (moved to pillar quests): `height_cm`, `weight_kg`, `children`, `living_situation`, `diet`, `exercise_frequency`, `exercise_types`, `smoking`, `alcohol`, `caffeine`, `hydration`, `supplements`, `meditation_practice`, `therapy_experience`, `energy_source`, `relaxation_methods`, `hobbies`, `reading_habits`, `conflict_handling`, `problem_approach`, `decision_style`, `opportunity_response`, `failure_response`, `time_management`, `relationship_style`, `social_preference`, `morning_evening`, `learning_style`, `spiritual_practice`
- DB: `launchpad_progress.step_2_profile_data` (same column, same JSON shape, just fewer keys initially)

**Step 3 -- Routine Snapshot** (`renderer: 'card'`) -- CUT DOWN
- Include ONLY: `wake_time`, `sleep_time`, `peak_productivity`, `low_energy_time`, `family_commitments`
- REMOVED from core: `sleep_quality`, `shift_work`, `work_start_time`, `work_end_time`, `work_flexibility`, `breakfast_time`, `lunch_time`, `dinner_time`, `special_constraints`
- DB: merged into `step_2_profile_data` (same as today)

**Step 4 -- Growth Deep Dive** (`renderer: 'custom'`)
- Reuse existing `GrowthDeepDiveStep.tsx`
- Limit to max 3 areas (already limited by growth_focus max 3)
- DB: `step_2_profile_data.deep_dive`

**Step 5 -- First Chat** (`renderer: 'custom'`)
- Reuse existing `FirstChatStep.tsx` unchanged
- DB: `step_2_summary`

**Step 6 -- Introspection Light** (`renderer: 'custom'`)
- Reuse existing `IntrospectionStep.tsx` but will be modified in a follow-up to add multi-select friction chips before textarea
- DB: `form_submissions` (same form ID)
- Edge function: `analyze-introspection-form` (unchanged)

**Step 7 -- Life Plan Light** (`renderer: 'custom'`)
- Reuse existing `LifePlanStep.tsx` but will be modified to show only `vision_3y` (required), `goals_90d` (required), `identity` (optional), `risks` (optional)
- DB: `form_submissions` (same form ID)
- Edge function: `analyze-life-plan` (unchanged)

**Step 8 -- Focus Areas** (`renderer: 'card'`)
- Reuse existing logic: select exactly 3 from 8 pillars
- DB: `step_5_focus_areas_selected`

**Step 9 -- First Week** (`renderer: 'card'`)
- MiniSteps: `habits_to_quit` (multi_select, min 1), `habits_to_build` (multi_select, min 1), `career_status` (single_select), `career_goal` (single_select)
- DB: `step_6_actions`

**Step 10 -- Activation** (`renderer: 'custom'`)
- Reuse existing `DashboardActivation.tsx`
- Calls `generate-launchpad-summary` (unchanged)
- Note: FinalNotesStep (old step 10) is removed from core. Its data field (`step_10_final_notes`) remains in DB but is optional and will be surfaced in pillar quests or settings.

### DB Column Mapping (unchanged)

| Core Step | DB Column | Format |
|-----------|-----------|--------|
| 1 | step_1_intention | JSON string |
| 2 | step_2_profile_data | JSON object |
| 3 | step_2_profile_data (merged) | JSON object |
| 4 | step_2_profile_data.deep_dive | JSON object |
| 5 | step_2_summary | JSON string |
| 6 | form_submissions | via form_submission_id |
| 7 | form_submissions | via form_submission_id |
| 8 | step_5_focus_areas_selected | string[] |
| 9 | step_6_actions | JSON object |
| 10 | step_7_dashboard_activated | boolean |

---

## Phase 3: Pillar Quest System

### `src/flows/pillarSpecs/*.ts`

Each pillar quest contains the questions removed from Core Launchpad, organized by domain. They use the same FlowRenderer and QuestionCard.

**Health Quest** -- Questions from PersonalProfileStep health section:
- `height_cm` (slider), `weight_kg` (slider), `diet`, `exercise_frequency`, `exercise_types`, `smoking`, `alcohol`, `caffeine`, `hydration`, `supplements`
- Plus from LifestyleRoutineStep: `sleep_quality`, `breakfast_time`, `lunch_time`, `dinner_time`
- DB: `launchpad_progress.step_2_profile_data` (merged into existing JSON, adding keys)

**Mind Quest** -- Questions from behavioral/mental sections:
- `meditation_practice`, `therapy_experience`, `energy_source`, `relaxation_methods`
- `conflict_handling`, `problem_approach`, `decision_style`, `failure_response`, `time_management`
- DB: `step_2_profile_data` (merged)

**Relationships Quest**:
- `relationship_style`, `children`, `living_situation`
- DB: `step_2_profile_data` (merged)

**Career Quest**:
- Work schedule questions: `shift_work`, `work_start_time`, `work_end_time`, `work_flexibility`
- DB: `step_2_profile_data` (merged)

**Money Quest** -- New questions focused on financial habits and goals
- DB: `step_2_profile_data` (merged under `pillar_money` key)

**Creativity Quest** -- Moved from core:
- `hobbies` (the 85+ option list), `reading_habits`
- DB: `step_2_profile_data` (merged)

**Social Quest**:
- `social_preference`, `learning_style`
- DB: `step_2_profile_data` (merged)

**Spirituality Quest**:
- `spiritual_practice`, `morning_evening`, `opportunity_response`
- Additional spirituality-specific questions
- DB: `step_2_profile_data` (merged)

### Quest Progress Storage

Each quest's completion status is stored in `step_2_profile_data.quest_progress`:
```json
{
  "quest_progress": {
    "health": { "completed": true, "completed_at": "..." },
    "mind": { "completed": false, "current_mini_step": 3 }
  }
}
```

No new DB columns needed -- the existing `step_2_profile_data` JSON column absorbs everything.

### XP Awards

Each quest completion awards XP via the existing `award_unified_xp` RPC:
- Quest completion: 50 XP + 5 tokens per quest
- Uses the existing XP/token infrastructure, no changes needed

---

## Phase 4: Quests Page

### `src/pages/Quests.tsx` (route: `/quests`)

- 8 pillar cards in a 2-column grid
- Each card shows: icon, title (HE/EN), progress bar, completion badge
- "Continue" or "Start" CTA button
- Cards are enabled/unlocked based on the 3 pillars selected in Core Step 8
- Other 5 pillars shown as locked/dimmed with "Complete Launchpad first" message
- Clicking a card navigates to `/quests/:pillarId` which renders FlowRenderer with the pillar's FlowSpec

---

## Phase 5: Integration with LaunchpadFlow

### Modification to `LaunchpadFlow.tsx`

The `renderCurrentStep()` switch statement is updated:
- For steps with `renderer: 'card'` in the spec, render `<FlowRenderer spec={stepSpec} ... />`
- For steps with `renderer: 'custom'`, render existing components (FirstChatStep, IntrospectionStep, etc.)
- The autosave and completeStep calls remain identical
- Guest/auth parity maintained through the existing unified adapter pattern

### Navigation

After Core Launchpad completion -> redirect to `/launchpad/complete` (existing behavior).
From completion page -> "Explore Your Quests" CTA -> `/quests`.
Bottom tab bar and dashboard also link to `/quests`.

---

## Phase 6: What is NOT Changed

- Database schema: zero migrations
- `generate-launchpad-summary` edge function: reads same columns, same format
- `analyze-introspection-form` and `analyze-life-plan` edge functions: unchanged
- `complete_launchpad_step` RPC: unchanged
- `useLaunchpadProgress` hook: unchanged (still 11 internal steps, step 10 maps to old FinalNotes which is now skipped/auto-completed)
- `useLaunchpadAutoSave` hook: unchanged
- `useGuestLaunchpadProgress` hook: unchanged
- XP/token awarding via `award_unified_xp`: unchanged
- All existing step components: preserved in codebase, just not rendered for steps that become config-driven

---

## Implementation Order

1. Create `src/lib/flow/types.ts` and `src/lib/flow/flowSpec.ts`
2. Create `src/components/flow/QuestionCard.tsx` and `FlowRenderer.tsx`
3. Create `src/flows/coreLaunchpadSpec.ts` with all options extracted from existing components
4. Wire FlowRenderer into `LaunchpadFlow.tsx` for card-rendered steps
5. Create pillar quest specs (8 files)
6. Create `/quests` page and route
7. Test end-to-end: Core Launchpad -> Dashboard Activation -> Quests

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Existing users mid-journey | FlowRenderer reads same DB columns; existing progress is preserved |
| generate-launchpad-summary expects certain fields | Core still populates all required fields; quest data is additive |
| Guest mode breaks | FlowRenderer calls same guest autosave hooks |
| Old components left unused | No deletion -- they remain as fallback and reference |

