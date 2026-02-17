

# Multi-Select Onboarding Questions

## Which Questions Become Multi-Select

| Question | Current | New | Reason |
|----------|---------|-----|--------|
| Step 1: "What feels hardest?" | single | **multi_select** | Users often face multiple challenges |
| Step 2: "Specific tension" (all 6 variants) | single | **multi_select** | Multiple tensions can coexist |
| Step 3: "Desired shift" | single | **multi_select** | Multiple desired outcomes make sense |
| Step 4: "Commitment level" | single | single | It's a single intensity level |
| Step 5: Age range | single | single | Factual, one answer |
| Step 5: Work structure | single | single | Factual, one answer |
| Step 5: Experience level | single | single | Factual, one answer |

## UX Behavior Change

**Single-select** (Steps 4, 5): Tap an option, auto-advance after 400ms (current behavior)

**Multi-select** (Steps 1, 2, 3): 
- Tap options to toggle them on/off (purple highlight when selected)
- A "Continue" button appears at the bottom once at least 1 option is selected
- No auto-advance -- user controls when to proceed
- Store answer as an array of values (e.g., `["mentally_exhausted", "stuck_career"]`)

## Changes

### 1. `src/flows/onboardingFlowSpec.ts`
- Change `inputType` from `'single_select'` to `'multi_select'` for:
  - `friction_type` (Step 1)
  - All 6 `specific_tension` variants (Step 2)
  - `desired_shift` (Step 3)
- Add `minSelected: 1` validation to each

### 2. `src/components/onboarding/OnboardingFlow.tsx`
- Add multi-select toggle logic: clicking an option adds/removes it from an array
- Show a "Continue" / "המשך" button when `inputType === 'multi_select'` and at least 1 option selected
- Keep auto-advance only for `single_select` questions
- Update the `handleSelect` function to handle both modes
- Store multi-select answers as `string[]` in the answers object

### 3. `src/components/onboarding/OnboardingReveal.tsx`
- Update to handle `friction_type` being an array (use first value for pillar mapping, display all selected)

### 4. Auto-save logic in `OnboardingFlow.tsx`
- Update `autoSave` to handle array values for `friction_type` (map first selected value to pillar, store full array)

## Technical Details

### Multi-select state management
```
// For multi-select: maintain array of selected values
const currentSelections = (answers[currentMini.id] as string[]) || [];
// Toggle: add if not present, remove if present
const toggleValue = currentSelections.includes(value)
  ? currentSelections.filter(v => v !== value)
  : [...currentSelections, value];
```

### Continue button styling
- Full-width gradient button matching the app's primary style
- Appears with a slide-up animation when selections exist
- Disabled state when nothing selected

### Pillar mapping with multi-select
- When `friction_type` is an array, use the **first selected** value for primary pillar mapping
- Store all selected friction types so the AI summary can reference all of them
