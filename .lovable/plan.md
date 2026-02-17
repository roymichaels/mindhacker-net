
# Phase A: Wire FlowRenderer for Steps 1-3 + Phase B: Pillar Quests

## Phase A -- Wire Steps 1-3 into FlowRenderer

### What changes in `LaunchpadFlow.tsx`

**Add state for global answers (for branching):**
```typescript
const [globalAnswers, setGlobalAnswers] = useState<FlowAnswers>({});
```

**Replace cases 1, 2, 3 in `renderCurrentStep()`** with FlowRenderer. Each case will:
1. Look up the step spec from `coreLaunchpadSpec.steps` by matching `step.id`
2. Map `displayedStep` to the DB step number via `stepMapping`
3. Pass `savedAnswers` from existing `getSavedData()` 
4. Pass `allAnswers={globalAnswers}` for branching
5. Wire `onAutoSave` to call existing `handleAutoSave(dbStepNumber, data)` + merge into `globalAnswers`
6. Wire `onComplete` to call existing `handleStepComplete(data)`

Example for Step 1:
```typescript
case 1: {
  const stepSpec = coreLaunchpadSpec.steps.find(s => s.id === 1)!;
  return (
    <FlowRenderer
      key={`step-1-${viewingStep ?? 'current'}`}
      step={stepSpec}
      stepNumber={1}
      totalSteps={coreLaunchpadSpec.steps.length}
      savedAnswers={getSavedData(1) as Record<string, unknown> | undefined}
      allAnswers={globalAnswers}
      onAutoSave={(data) => {
        handleAutoSave(1, data);
        setGlobalAnswers(prev => ({ ...prev, ...data }));
      }}
      onComplete={(data) => handleStepComplete(data)}
      isCompleting={viewingStep === null ? isCompleting : false}
    />
  );
}
```

Steps 2 and 3 follow identical pattern with their respective step IDs and DB step numbers.

**Cases 4-11 remain completely unchanged** -- still rendering legacy custom components.

### What this preserves
- `handleAutoSave` calls the exact same `authAutoSave.autoSave(step, data)` or guest `stepNSave.saveData(data)`
- `handleStepComplete` calls the same `completeStep({ step, data })` which triggers `complete_launchpad_step` RPC
- Resume works because `getSavedData(1)` returns DB/localStorage data as before
- Phase transitions, XP, tokens -- all untouched

---

## Phase B -- Pillar Quests System

### B1: Create 8 Quest Spec Files

**Folder:** `src/flows/pillarSpecs/`

Each file exports a `FlowSpec` and registers it. All miniSteps write to:
- `table: 'launchpad_progress'`
- `column: 'step_2_profile_data'`
- `jsonPath: 'pillar_quests.<pillar>.answers'`

| File | Questions (moved from core) | Count |
|------|----------------------------|-------|
| `healthQuestSpec.ts` | height_cm (slider), weight_kg (slider), diet, exercise_frequency, exercise_types, smoking, alcohol, caffeine, hydration, supplements, sleep_quality, breakfast_time, lunch_time, dinner_time | ~14 |
| `mindQuestSpec.ts` | meditation_practice, therapy_experience, energy_source, relaxation_methods, conflict_handling, problem_approach, decision_style, failure_response, time_management | ~9 |
| `relationshipsQuestSpec.ts` | relationship_style, children, living_situation, communication_style, social_circle, boundaries | ~6 |
| `careerQuestSpec.ts` | shift_work, work_start_time, work_end_time, work_flexibility, career_aspirations, work_satisfaction | ~6 |
| `moneyQuestSpec.ts` | financial_goals, savings_habits, spending_awareness, income_satisfaction, financial_literacy, investment_interest | ~6 |
| `creativityQuestSpec.ts` | hobbies (large list), reading_habits, creative_outlets, artistic_interests | ~6 |
| `socialQuestSpec.ts` | social_preference, learning_style, community_involvement, networking_comfort, social_energy | ~6 |
| `spiritualityQuestSpec.ts` | spiritual_practice, morning_evening, opportunity_response, mindfulness_interest, gratitude_practice, values_alignment | ~6 |

**`index.ts`** -- re-exports all specs + a `PILLAR_QUESTS` array with metadata (id, icon, color).

### B2: Quest Data Storage

All quest data merges into the existing `step_2_profile_data` JSON column under a `pillar_quests` key:

```json
{
  "age_group": "25-34",
  "pillar_quests": {
    "health": { "completed": true, "completedAt": "...", "answers": { "height_cm": 175, ... } },
    "mind": { "completed": false, "answers": { "meditation_practice": "daily" } }
  }
}
```

No new DB columns or tables.

### B3: Quest Pages

**`src/pages/QuestsPage.tsx`** (route: `/quests`)
- Grid of 8 pillar cards showing icon, title (HE/EN), progress, status
- Cards show "Start" or "Continue" CTA
- Pillars selected in Core Step 8 are highlighted/prioritized
- Completed quests show a badge

**`src/pages/QuestRunnerPage.tsx`** (route: `/quests/:pillar`)
- Loads the correct quest spec by URL param
- Reads saved answers from `step_2_profile_data.pillar_quests[pillar].answers`
- Renders `FlowRenderer` with auto-save writing back to the JSON
- On completion: marks `completed: true`, awards 50 XP via existing `award_unified_xp` RPC, navigates back to `/quests`

### B4: Routing

Add to `App.tsx`:
```typescript
const QuestsPage = lazy(() => import("./pages/QuestsPage"));
const QuestRunnerPage = lazy(() => import("./pages/QuestRunnerPage"));
// Routes:
<Route path="/quests" element={<QuestsPage />} />
<Route path="/quests/:pillar" element={<QuestRunnerPage />} />
```

---

## Files Created (15 new files)

| File | Purpose |
|------|---------|
| `src/flows/pillarSpecs/index.ts` | Registry + metadata |
| `src/flows/pillarSpecs/healthQuestSpec.ts` | Health quest |
| `src/flows/pillarSpecs/moneyQuestSpec.ts` | Money quest |
| `src/flows/pillarSpecs/mindQuestSpec.ts` | Mind quest |
| `src/flows/pillarSpecs/relationshipsQuestSpec.ts` | Relationships quest |
| `src/flows/pillarSpecs/careerQuestSpec.ts` | Career quest |
| `src/flows/pillarSpecs/creativityQuestSpec.ts` | Creativity quest |
| `src/flows/pillarSpecs/socialQuestSpec.ts` | Social quest |
| `src/flows/pillarSpecs/spiritualityQuestSpec.ts` | Spirituality quest |
| `src/pages/QuestsPage.tsx` | Quest hub page |
| `src/pages/QuestRunnerPage.tsx` | Quest runner |

## Files Modified (2 files)

| File | Change |
|------|--------|
| `src/components/launchpad/LaunchpadFlow.tsx` | Replace cases 1-3 with FlowRenderer, add globalAnswers state |
| `src/App.tsx` | Add `/quests` and `/quests/:pillar` routes |

## Files NOT Modified

- All edge functions (generate-launchpad-summary, analyze-life-plan, etc.)
- useLaunchpadAutoSave.ts, useGuestLaunchpadAutoSave.ts
- useLaunchpadProgress.ts, useGuestLaunchpadProgress.ts  
- All existing step components (WelcomeStep, PersonalProfileStep, etc. -- kept as fallback)
- Database schema -- zero migrations

## Risk Mitigation

- Steps 4-11 are completely untouched legacy components
- FlowRenderer calls the same `handleAutoSave` and `completeStep` as before
- Quest data is additive JSON -- never overwrites existing profile data
- Old step components remain in codebase for reference/rollback
