
# Unified Identity Activation Flow — `/start`

## Overview
Replace the 11-step `/launchpad` and grid-based `/quests` with a single psychologically-sequenced 10-screen activation flow at `/start`. Emotion-first, demographics after commitment. One question per screen, auto-advance on single-select, clean dark minimal UI.

## Data Strategy (Zero Schema Changes)
All 10 screens store data into existing `launchpad_progress` columns:
- Screens 1-4 (Focus, Pain, Outcome, Commitment) --> `step_1_intention` (JSON)
- Screens 5-7 (Growth Intent, Behavioral Block, Energy) --> `step_2_profile_data` (JSON)
- Screens 8-9 (Identity Anchor, 90-Day Vision) --> `step_2_profile_data` (merged)
- Screen 10 (Reveal) --> marks `step_7_dashboard_activated = true`, calls `generate-launchpad-summary`, redirects to `/today`

The JSON structure inside `step_1_intention`:
```json
{
  "primary_focus": "health",
  "primary_pain": "low_energy",
  "desired_outcome": "consistent_energy",
  "commitment_level": "locked_in",
  "secondary_focus": ["career", "relationships"],
  "core_obstacle": "procrastination",
  "peak_productivity": "morning",
  "identity_statement": "A disciplined, high-energy leader...",
  "ninety_day_vision": "I wake up at 6am feeling..."
}
```

## New Files

### 1. `src/flows/activationFlowSpec.ts`
New FlowSpec with 10 steps, each containing 1 mini-step (one question per screen):

| Screen | Question | Type | Auto-Advance |
|--------|----------|------|--------------|
| 1 - Focus | "What area needs the most attention?" | single_select (8 pillars) | Yes |
| 2 - Pain | Dynamic pain points based on Screen 1 | single_select (6 options per pillar) | Yes |
| 3 - Outcome | "What would change everything?" | single_select (dynamic) | Yes |
| 4 - Commitment | "How serious are you?" | single_select (4 levels) | Yes |
| 5 - Growth | "Where else do you want improvement?" | multi_select (max 2) | No |
| 6 - Block | "What stops you most?" | single_select (8 obstacles) | Yes |
| 7 - Energy | "When are you most productive?" | single_select (6 time slots) | Yes |
| 8 - Identity | "Who do you need to become?" | textarea (min 20 chars) | No |
| 9 - Vision | "90 days from now, what changed?" | textarea (min 20 chars) | No |
| 10 - Reveal | Dynamic summary + "Enter MindOS" CTA | custom | No |

Screens 2 and 3 use branching logic (same pattern as existing `coreLaunchpadSpec`) to show dynamic options based on `primary_focus` selection.

### 2. `src/components/activation/ActivationFlow.tsx`
New orchestrator component (replaces `LaunchpadFlow` role):
- Full-screen dark minimal layout
- No header navigation, no dashboard chrome
- 10-segment progress bar at top
- Uses `FlowRenderer` for screens 1-9
- Custom component for Screen 10 (Reveal)
- Framer Motion page transitions
- Auto-save on every answer change

### 3. `src/components/activation/RevealScreen.tsx`
Screen 10 -- the personalized summary reveal:
- Animated entry with staggered sections
- Shows: primary focus, biggest blocker, commitment level, identity statement, 90-day vision
- Single CTA: "Enter MindOS" (GradientCTAButton)
- On click: saves all data to `launchpad_progress`, calls `generate-launchpad-summary`, redirects to `/today`

### 4. `src/components/activation/ActivationProgress.tsx`
Minimal 10-segment progress bar (thin line, no step titles, no dots -- just clean segments that fill as user progresses).

### 5. `src/pages/Start.tsx`
New page component for `/start` route. Renders `ActivationFlow`. Handles completion redirect to `/today`.

## Modified Files

### 6. `src/App.tsx` (Routes)
- Add `/start` route pointing to `Start.tsx`
- Redirect `/launchpad` to `/start`
- Redirect `/quests` to `/start`
- Keep `/launchpad/complete` route for existing users who already completed

### 7. `src/hooks/useLaunchpadProgress.ts`
- Add a mapping function that converts activation flow answers into the existing `launchpad_progress` column structure
- The `completeStep` function will accept the unified activation data and write it across `step_1_intention` and `step_2_profile_data`
- Mark `step_7_dashboard_activated = true` and `launchpad_complete = true` on completion

### 8. `src/hooks/useLaunchpadAutoSave.ts`
- Add support for the activation flow's data shape (single JSON blob auto-saved to `step_1_intention`)

## What Gets Removed (Cleanup)
- `/quests` route and grid selection screen
- Direct pillar selection from landing page (consciousness card click --> `/start` instead)
- Navigation links during onboarding flow
- The old 11-step flow remains in codebase but is no longer the primary entry (redirected)

## What Stays Untouched
- `generate-launchpad-summary` edge function (reads from same columns)
- XP/gamification engine (`award_unified_xp` RPC)
- All existing `launchpad_progress` DB schema
- Dashboard pages (`/today`, `/plan`, `/sessions`, `/me`)
- Existing pillar quest specs (for future deep-dives post-activation)
- Auth modal system

## UI Design Specs
- Background: `bg-gray-950` (near-black)
- Cards: Large tappable (min 56px height), `rounded-2xl`, subtle border glow on hover
- Typography: Question title `text-2xl font-bold`, emotional microcopy `text-sm text-muted-foreground` below each question
- Progress bar: 10 thin segments, `h-1`, primary color fill, no labels
- Transitions: `framer-motion` slide-up with 200ms ease-out
- Auto-advance: 400ms delay after selection with subtle scale animation

## Implementation Order
1. Create `activationFlowSpec.ts` with all 10 screens and branching logic
2. Create `ActivationProgress.tsx` (simple progress bar)
3. Create `RevealScreen.tsx` (summary + CTA)
4. Create `ActivationFlow.tsx` (orchestrator)
5. Create `Start.tsx` (page)
6. Update `App.tsx` routes (add `/start`, redirect `/launchpad`)
7. Update `useLaunchpadProgress.ts` (activation data mapper)
