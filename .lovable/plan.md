

## Fix Avatar/Orb Customization Based on AI Summarization and User DNA

### Problem
The `useOrbProfile` hook currently only extracts **hobbies** from `step_2_profile_data` to drive the orb's visual identity. It completely ignores:
- **AI Summarization data** from `launchpad_summaries` (identity profile, suggested ego state, dominant traits, values hierarchy, behavioral insights)
- **Rich profile data** from `step_2_profile_data` (decision style, conflict handling, problem approach, life priorities, traits)

This means the orb looks generic for most users despite having rich personality data available.

### Solution
Enhance `useOrbProfile` to pull data from both `launchpad_summaries` and the full `step_2_profile_data`, then feed it all into the existing `generateOrbProfile()` function from `orbProfileGenerator.ts` which already supports all these inputs (hobbies, decisionStyle, conflictStyle, problemSolvingStyle, traits, priorities, egoState, clarityScore).

### Changes

**1. `src/hooks/useOrbProfile.ts`** -- Main changes:
- Add a query to fetch `launchpad_summaries` (summary_data, clarity_score, consciousness_score, transformation_readiness)
- Extract the full profile data from `step_2_profile_data`: decision style, conflict handling, problem approach, life priorities
- Extract AI-generated data from summary: suggested ego state, dominant traits, values hierarchy
- Replace the simplified `generateVisualProfile()` call with the full `generateOrbProfile()` from `orbProfileGenerator.ts`, passing all available user DNA signals
- This feeds into the existing `avatarDNA.ts` system which already has mappings for all these traits

**2. Data flow after fix:**

```text
step_2_profile_data (hobbies, decision_style, conflict_handling, life_priorities, problem_approach)
       +
launchpad_summaries (ego_state, clarity_score, consciousness_score, transformation_readiness)
       +
game_state (level, streak, XP)
       |
       v
generateOrbProfile() --> computeAvatarDNA() --> dnaToOrbProfile()
       |
       v
Personalized Orb (colors, morphology, particles, motion, texture)
```

### Technical Details

The key change is in the `computedProfile` useMemo inside `useOrbProfile`:

- **Before**: `generateVisualProfile(hobbies, level, streak)` -- only uses hobbies
- **After**: `generateOrbProfile({ hobbies, decisionStyle, conflictStyle, problemSolvingStyle, priorities, selectedTraitIds, level, experience, streak, clarityScore, consciousnessScore, transformationReadiness, egoState })` -- uses full DNA

The `generateOrbProfile` function and `computeAvatarDNA` already exist and handle all these inputs with proper archetype blending, motion profiles, color palettes, particle systems, and complexity scaling. They just weren't being called with the full data.

No new tables, migrations, or edge functions needed. This is purely a frontend data-wiring fix.

