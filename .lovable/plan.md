

# Rebuild MindOS Entry Experience — 5-Step Identity Calibration

## What Changes

The current `/start` flow shows an 8-pillar grid as Screen 1 ("What area needs attention?"). This is a dashboard disguised as onboarding. We're replacing it with a friction-first 5-step calibration at `/onboarding`.

## Architecture Difference

**Current** (10 screens at `/start`):
Screen 1: Pick a pillar (8 options) --> Screen 2: Pain --> Screen 3: Outcome --> Screen 4: Commitment --> Screen 5: Secondary focus --> Screen 6: Blocker --> Screen 7: Energy time --> Screen 8: Identity text --> Screen 9: Vision text --> Screen 10: Reveal

**New** (5 screens at `/onboarding`):
Screen 1: "What feels hardest?" (6 emotional options, maps to pillar silently) --> Screen 2: Specific tension (dynamic per friction type) --> Screen 3: Desired shift (specific, not vague) --> Screen 4: Commitment calibration --> Screen 5: Light personalization (age range, work structure, experience level) --> Reveal screen

Key differences:
- No pillar grid shown. User picks an emotional pain point, system maps it to a pillar internally
- 5 screens instead of 10 (no secondary focus, no blocker, no energy, no identity text, no vision text)
- Personalization (demographics) comes LAST, after friction is established
- Dashboard is locked until `onboarding_complete = true`

## Route Changes

| Route | Before | After |
|-------|--------|-------|
| `/onboarding` | Does not exist | New entry point for first-time users |
| `/start` | Activation flow | Redirects to `/onboarding` |
| `/launchpad` | Redirects to `/start` | Redirects to `/onboarding` |
| `/today` | Always accessible | Redirects to `/onboarding` if not completed |
| `/plan`, `/me`, `/sessions` | Always accessible | Redirects to `/onboarding` if not completed |

## Data Storage (Zero Schema Changes)

All data stores into existing `launchpad_progress` columns:

`step_1_intention` (JSON):
```json
{
  "friction_type": "mentally_exhausted",
  "selected_pillar": "mind",
  "specific_tension": "cant_stop_overthinking",
  "desired_shift": "wake_without_anxiety",
  "commitment_level": "real_change"
}
```

`step_2_profile_data` (JSON):
```json
{
  "age_range": "25_34",
  "work_structure": "employed",
  "experience_level": "rebuilding"
}
```

On completion: `launchpad_complete = true`, `step_7_dashboard_activated = true`

## Friction-to-Pillar Mapping

The 6 friction options on Screen 1 map silently to pillars:

| Friction Option | Internal Pillar |
|----------------|-----------------|
| "I feel mentally exhausted" | mind |
| "I feel stuck in my career" | career |
| "I feel financially stressed" | money |
| "My relationships feel disconnected" | relationships |
| "I lack structure and discipline" | health |
| "I feel physically drained" | health |

## New Files (4)

### 1. `src/flows/onboardingFlowSpec.ts`
5-step FlowSpec with friction-first emotional language:

**Step 1 - Friction Anchor**: 6 emotional options (single_select, auto-advance)
**Step 2 - Specific Tension**: Dynamic options per friction type using branching logic (single_select, auto-advance). Each friction type gets 5 specific sub-tensions.
**Step 3 - Desired Shift**: 5 specific, non-vague outcome options (single_select, auto-advance). Options like "I'd wake up without anxiety" not "financial freedom".
**Step 4 - Commitment Calibration**: 4 options (single_select, auto-advance)
**Step 5 - Light Personalization**: 3 single_select questions shown sequentially (age range, work structure, experience level). These feel relevant because friction was established first.

### 2. `src/components/onboarding/OnboardingFlow.tsx`
Full-screen orchestrator (replaces ActivationFlow pattern):
- Dark background (`bg-gray-950`)
- Centered question, no nav, no tab bar
- 5-segment progress indicator
- Auto-advance on single_select (400ms delay)
- Framer Motion slide transitions
- Auto-save on every answer
- After Step 5: shows Reveal screen

### 3. `src/components/onboarding/OnboardingReveal.tsx`
"Your Personalized Upgrade Path is Ready" screen:
- Shows identified focus area (mapped pillar label)
- Detected friction type
- Commitment level
- Suggested starting quest + first habit
- "Enter My System" button
- On click: saves to `launchpad_progress`, calls `generate-launchpad-summary`, redirects to `/today`

### 4. `src/pages/Onboarding.tsx`
Route page component rendering `OnboardingFlow`

## Modified Files (2)

### 5. `src/App.tsx`
- Add `/onboarding` route (public, renders `Onboarding` page)
- Change `/start`, `/launchpad`, `/quests`, `/free-journey` to all redirect to `/onboarding`
- Wrap `/today`, `/plan`, `/sessions`, `/me` routes with an onboarding gate: if `launchpad_complete !== true`, redirect to `/onboarding`

### 6. `src/components/dashboard/ProfileContent.tsx`
- Update `handleEditJourney` to navigate to `/onboarding` instead of `/quests` or `/launchpad`

## What Gets Removed / Deprecated
- `/start` route becomes a redirect to `/onboarding`
- The 10-screen activation flow files stay in codebase but are no longer routed to
- Grid-first pillar selection is no longer the entry point anywhere

## What Stays Untouched
- `generate-launchpad-summary` edge function (reads from same columns)
- All dashboard pages (just gated behind onboarding check)
- Existing `launchpad_progress` DB schema
- Auth modal system
- XP/gamification engine
- Pillar quest specs (available post-onboarding as deep-dives)

## UI Rules (enforced in OnboardingFlow)
- `bg-gray-950` dark background with forced dark CSS variables
- Centered question with `text-2xl font-bold`
- 4-6 large tap targets per screen (`min-h-[56px]`, `rounded-2xl`)
- Soft slide-up animation (200ms ease-out)
- 5-segment thin progress bar at top (`h-1`)
- No top nav, no bottom tab bar
- Subtle back button at bottom (not prominent)
- Auto-advance: 400ms delay after single_select with scale animation

## Implementation Order
1. Create `onboardingFlowSpec.ts` (5 steps + branching + friction-to-pillar mapping)
2. Create `OnboardingReveal.tsx` (reveal screen)
3. Create `OnboardingFlow.tsx` (orchestrator)
4. Create `Onboarding.tsx` (page)
5. Update `App.tsx` (routes + onboarding gate)
6. Update `ProfileContent.tsx` (navigation fix)
