

# Redirect "Edit Transformation Journey" CTA to /quests

## Summary

Two components have a CTA button navigating to `/launchpad` that should instead go to `/quests`. The button text should also dynamically show "Continue" vs "Edit" based on whether the user has completed any pillar quest.

## Changes

### 1. `src/components/dashboard/ProfileContent.tsx`

**Line 100**: Change `navigate('/launchpad')` to `navigate('/quests')`

**Lines 406-408**: Replace the hardcoded inline text with logic that checks `pillar_quests` completion status:
- If any pillar quest has `completed: true` -> show "Continue Transformation Journey" / "המשך מסע טרנספורמציה"
- If launchpad is complete but no quests done -> show "Edit Transformation Journey" / "ערוך מסע טרנספורמציה"
- If launchpad not complete -> keep "Start Transformation Journey" / "התחל מסע טרנספורמציה" (and keep navigating to `/launchpad` for this case only)

To derive quest status, use the existing `launchpadData` or profile data already available in this component to check `step_2_profile_data.pillar_quests`.

### 2. `src/components/dashboard/unified/IdentityProfileCard.tsx`

**Line 45**: Change `navigate('/launchpad')` to `navigate('/quests')`

**Line 137**: Same dynamic text logic -- check if any quest is completed to toggle between "Edit" and "Continue". This component may need a new prop (`hasCompletedQuest?: boolean`) passed from its parent, or it can use the translation keys already defined (`editTransformationJourney`, `continueTransformationJourney`).

### 3. Translation keys (already exist, just use them)

The keys `editTransformationJourney`, `continueTransformationJourney`, and `startTransformationJourney` are already defined in both `en.ts` and `he.ts`. The fix will replace the inline Hebrew/English conditionals with proper `t()` calls, which also fixes the translation standardization issue.

## Technical Details

- **Quest completion check**: Look for any key in `pillar_quests` where `completed === true`. A simple helper:
  ```typescript
  const hasCompletedAnyQuest = Object.values(pillarQuests || {}).some(q => q?.completed);
  ```
- **Navigation split**: When launchpad is NOT complete, the CTA still goes to `/launchpad`. When complete, it goes to `/quests`.
- **No new dependencies or DB changes required.**

## Files Modified

| File | Change |
|------|--------|
| `src/components/dashboard/ProfileContent.tsx` | Navigate to `/quests`, dynamic CTA text, use `t()` keys |
| `src/components/dashboard/unified/IdentityProfileCard.tsx` | Navigate to `/quests`, dynamic CTA text, use `t()` keys |

