

## Fix: All Milestones Showing 3-Star Difficulty

### Root Cause
Two issues causing uniform 3-star display:

1. **AI output**: The prompt already instructs 1-5 progression, but the model may still output uniform values. Need to make the prompt instruction more emphatic and add validation.

2. **Fallback defaults to 3**: In `LifeHub.tsx` line 606 and `ArenaHub.tsx` line 553, the code uses `ms.difficulty || 3` — so any `NULL` or `0` values default to 3 stars instead of using the milestone's position.

3. **Existing data**: Current milestones in the DB were likely generated before difficulty was properly enforced, so they all have `difficulty = NULL` or `3`.

### Changes

**1. `supabase/functions/generate-90day-strategy/index.ts`**
- Strengthen the prompt: Add a **bold warning** that difficulty MUST vary across milestones (1→2→3→4→5 progression per mission)
- Add post-processing validation: After parsing AI output, if all milestones in a mission have the same difficulty, force-assign 1-5 sequentially
- In the insertion code, change fallback from `ms.difficulty || (si + 1)` to explicitly validate the range

**2. `src/pages/LifeHub.tsx`**
- Change `ms.difficulty || 3` to `ms.difficulty ?? (index + 1)` so null/undefined uses position-based difficulty instead of always defaulting to 3

**3. `src/pages/ArenaHub.tsx`**
- Same fix: change `action.difficulty || 3` to use position-based fallback

**4. Database migration** (optional but recommended)
- Update existing milestones that have NULL difficulty to use their `milestone_number` as difficulty (1-5 per mission group)

### Technical Detail
The key insight is that `|| 3` treats `0` and `null` the same — both become 3. Using `??` with a position-based fallback ensures visual variety even for legacy data. The prompt reinforcement + post-parse validation ensures future generations always produce 1-5 spread.

