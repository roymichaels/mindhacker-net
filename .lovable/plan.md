

# Fix: Inject User's Biological Profile, Diet, and Willingness Into Aurora's Brain

## Root Cause

Aurora's "brain" (contextBuilder) and both generation engines are **blind** to:
- **Diet**: `["alkaline", "vegetarian"]` stored in `life_domains.domain_config.history[].rawInputsUsed.diet_type`
- **Willingness boundaries**: What users said they WILL and WON'T do (stored in `life_domains.domain_config.latest_assessment.willingness`)
- **All raw assessment inputs**: sleep times, caffeine, training style, substances, nutrition weak points
- **Launchpad profile data**: `launchpad_progress.step_2_profile_data` with age, gender, work type, etc.

This means the AI generates missions telling an alkaline vegan to eat feta cheese, eggs, and butter because it literally doesn't know.

## Fix: 3 Files, 1 Principle

**Principle**: Every AI generation point must have access to the user's biological constraints and willingness. We inject this data at the source (contextBuilder) so ALL downstream consumers automatically get it.

---

### 1. Upgrade `_shared/contextBuilder.ts` — Add Biological Profile + Willingness

**What changes:**
- Add a new `biological_profile` field to `AuroraContext` containing:
  - `diet_type` (e.g. `["alkaline", "vegetarian"]`)
  - `substances` (caffeine, alcohol, nicotine, THC usage)
  - `sleep_pattern` (sleep/wake times, quality)
  - `training_style` (activity level, training window)
  - `nutrition_details` (meals/day, protein awareness, weak points, hydration)
  - `age_bracket`, `gender`
- Add a new `willingness` field containing per-pillar willingness data (what user will/won't do)
- Add a new `assessment_constraints` field with key findings across all assessed pillars
- Query `life_domains` and `launchpad_progress` in the parallel DB fetch block
- Extract `rawInputsUsed` from the most recent vitality history entry
- Extract willingness from each domain's `latest_assessment`

```text
New AuroraContext fields:
  biological_profile: {
    diet_type: string[]        // ["alkaline", "vegetarian"]
    meals_per_day: string      // "2"
    protein_awareness: string  // "some"
    nutrition_weak_point: string // "ultra_processed"
    hydration: { volume: string, sources: string[] }
    sleep: { time: string, wake: string, duration: string, quality: number }
    substances: { caffeine: string, alcohol: string, nicotine: string, thc: string }
    activity_level: string
    age_bracket: string
    gender: string
  }
  willingness: {
    [pillar]: { willing: string[], not_willing: string[], constraints: string[] }
  }
```

### 2. Upgrade `generate-execution-steps/index.ts` — Use Biological Profile

**What changes:**
- `buildUserContextBlock` now includes a `BIOLOGICAL CONSTRAINTS` section extracted from the new context fields
- Adds explicit `HARD RULES` to the system prompt:
  - "User is alkaline vegan — NEVER suggest dairy, eggs, meat, fish, honey, or any animal products"
  - "User is NOT willing to: [list from willingness]"
  - These rules appear at the TOP of the prompt with `## CRITICAL CONSTRAINTS (NEVER VIOLATE)` heading
- All food-related steps are filtered through dietary constraints
- All activity steps are filtered through willingness boundaries

### 3. Upgrade `generate-90day-strategy/index.ts` — Use rawInputsUsed + Willingness

**What changes:**
- `resolveAssessmentBlock` now also extracts `rawInputsUsed` from the domain's history (where diet_type lives)
- Adds willingness data to the assessment block sent to AI
- Adds a new `buildConstraintsBlock` function that generates a global constraints section injected into ALL 3 layers of the prompt pipeline:
  - Layer 1 (goals): Don't generate nutrition goals that conflict with alkaline vegan diet
  - Layer 2 (milestones): Don't create milestones involving foods user can't eat
  - Layer 3 (mini-milestones/daily actions): Every single daily action must respect diet + willingness
- Queries `launchpad_progress.step_2_profile_data` for additional biological context
- The constraints block is injected with `## CRITICAL USER CONSTRAINTS (NEVER VIOLATE)` header

---

## Technical Details

### contextBuilder.ts Changes

Add to the parallel queries:
```text
// Life domains (assessments + willingness + raw inputs)
supabase.from("life_domains")
  .select("domain_id, domain_config, status")
  .eq("user_id", userId)

// Launchpad profile (biological baseline from onboarding)  
supabase.from("launchpad_progress")
  .select("step_2_profile_data, step_3_lifestyle_data")
  .eq("user_id", userId)
  .single()
```

Parse biological profile from vitality domain's `rawInputsUsed`:
```text
const vitalityDomain = domains.find(d => d.domain_id === 'vitality')
const rawInputs = vitalityDomain?.domain_config?.history?.[0]?.rawInputsUsed || {}
// OR from launchpad_progress.step_2_profile_data as fallback
```

### generate-execution-steps/index.ts Changes

New constraint block at top of system prompt:
```text
## CRITICAL CONSTRAINTS (NEVER VIOLATE):
- DIET: alkaline vegetarian — NO dairy, NO eggs, NO meat, NO fish, NO honey
  ALLOWED: fruits, vegetables, nuts, seeds, legumes, grains, coconut products, plant-based milk
- NOT WILLING TO: [from willingness data]
- SUBSTANCES: no alcohol, no nicotine (respect these in suggestions)
- SLEEP TARGET: 22:00-03:00 (do not suggest late-night activities)
```

### generate-90day-strategy/index.ts Changes

Upgrade `resolveAssessmentBlock` to include raw inputs:
```text
const history = cfg.history || [];
const latestHistory = history[0] || {};
const rawInputs = latestHistory.rawInputsUsed || {};
// Add diet_type, substances, sleep patterns to the block
```

New `buildConstraintsBlock` function querying all domains for willingness:
```text
function buildConstraintsBlock(assessments, launchpadProfile) {
  // Extract diet from vitality rawInputsUsed
  // Extract willingness.not_willing from each domain
  // Return formatted constraint block
}
```

Inject into all 3 layer prompts.

---

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/_shared/contextBuilder.ts` | Add `biological_profile`, `willingness`, `assessment_constraints` fields + queries for `life_domains` and `launchpad_progress` |
| `supabase/functions/generate-execution-steps/index.ts` | Add CRITICAL CONSTRAINTS section to system prompt using biological_profile + willingness from context |
| `supabase/functions/generate-90day-strategy/index.ts` | Upgrade `resolveAssessmentBlock` to include rawInputsUsed, add `buildConstraintsBlock`, inject into all 3 prompt layers |

## Impact

After this fix:
- Aurora will NEVER suggest non-vegan food to a vegan user
- Aurora will NEVER suggest activities the user explicitly said they won't do
- All missions, milestones, and daily actions will respect biological constraints
- The fix is systemic — every AI touchpoint (chat, execution steps, strategy, hypnosis) benefits because it flows through the shared context builder

