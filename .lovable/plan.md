
# Recalibrate Plan -- Full Recalculation Modal

## Overview

Add a "Recalibrate" button to the bottom of both sidebars (HUD + Roadmap) that opens a single premium modal. This modal shows ALL of the user's original activation answers in an editable form. When they save, it re-runs the `generate-launchpad-summary` edge function to regenerate their entire plan (summary, milestones, identity, commitments, daily anchors) from scratch.

## User Experience

1. User taps the "Recalibrate" button (bottom of HUD sidebar or Roadmap sidebar)
2. A full-screen Dialog opens showing all 9 activation questions with their current saved answers pre-filled
3. User edits any answers they want (same UI components as activation flow but in a scrollable single-page layout)
4. User taps "Recalculate My Plan" button at the bottom
5. Loading state with a motivational message while the edge function runs
6. On success: toast notification, modal closes, all dashboard queries invalidate and refresh
7. Everything updates: summary, life plan, milestones, identity elements, commitments, daily habits

## Technical Details

### New file: `src/components/dashboard/RecalibrateModal.tsx`

- Full-screen Dialog (using Radix Dialog from shadcn)
- On mount, fetches `launchpad_progress.step_1_intention` for the current user and parses the JSON to pre-fill all 9 fields
- Renders a scrollable form with sections matching the activation flow:
  1. Primary Focus (single select grid)
  2. Primary Pain (dynamic based on focus, single select)
  3. Desired Outcome (dynamic based on focus, single select)
  4. Commitment Level (single select)
  5. Secondary Focus (multi-select, max 2)
  6. Core Obstacle (single select)
  7. Peak Productivity (single select)
  8. Identity Statement (textarea)
  9. 90-Day Vision (textarea)
- Each section reuses the option data from `activationFlowSpec.ts` (imported directly)
- On submit:
  1. Saves updated answers to `launchpad_progress.step_1_intention` and `step_2_profile_data`
  2. Deactivates old life plan (`UPDATE life_plans SET status = 'archived'`)
  3. Calls `generate-launchpad-summary` edge function (which already handles cleanup + full regeneration)
  4. Invalidates all relevant query keys: `life-plan`, `milestones`, `launchpad-summary`, `current-week-milestone`
  5. Shows success toast

### Modify: `src/components/dashboard/HudSidebar.tsx`

- Add a "Recalibrate" button at the very bottom of both collapsed and expanded views
- Collapsed: small icon button (RefreshCw icon)
- Expanded: full-width button with label
- Opens `RecalibrateModal`

### Modify: `src/components/dashboard/RoadmapSidebar.tsx`

- Add same "Recalibrate" button at the bottom of both collapsed and expanded views
- Consistent styling with HudSidebar

### No edge function changes needed

The existing `generate-launchpad-summary` function already:
- Reads all data from `launchpad_progress`
- Generates AI summary and plan
- Cleans up old data (checklists, commitments, identity elements)
- Creates new life plan, milestones, and populates all Life Model tables
- This is exactly what we need for recalculation

### Form UI Pattern

Each question section in the modal will use:
- A card container with the question title
- Option buttons matching the activation flow style (grid of selectable cards with icons)
- Textarea for identity statement and vision
- Dynamic pain/outcome options that change when primary focus changes
- Visual feedback for selected state (primary border + background)
