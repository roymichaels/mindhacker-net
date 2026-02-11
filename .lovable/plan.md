

# Split "Missions" into "Tasks" and "Goals"

## What Changes

The current "Missions Roadmap" combines everything into one view. We'll split it into two clear sections on the dashboard:

1. **Tasks (משימות)** -- Daily/weekly actionable checklist items from `aurora_checklists` + `aurora_checklist_items`. This is the existing `ChecklistsCard` component, already built and working.

2. **Goals (יעדים)** -- High-level goals from the 90-day life plan milestones (e.g., "Stop smoking", "Build a body", "Career action plan complete"). These come from `life_plan_milestones.goal` field.

## Dashboard Layout Change

Currently Zone 4 shows:
```text
[ Today's Habits ] [ Plan Progress ]
```

New Zone 4 will show:
```text
[ Tasks (ChecklistsCard) ]
[ Goals (new GoalsCard)  ]
[ Today's Habits ] [ Plan Progress ]
```

## Technical Steps

### 1. Create `GoalsCard` component
**New file**: `src/components/dashboard/v2/GoalsCard.tsx`

- Fetch all milestones from `life_plan_milestones` via the active `life_plans`
- Display each milestone's `goal` field as a goal card with its `title` as context
- Show completion status (checkbox-style) based on `is_completed`
- Group by month (Month 1, 2, 3) using `month_number`
- Collapsible sections, current month expanded by default
- Visual progress indicator per month

### 2. Add `ChecklistsCard` to the dashboard
The existing `ChecklistsCard` from `src/components/dashboard/unified/ChecklistsCard.tsx` already shows all aurora checklists with items, toggle completion, XP awards, etc. We'll add it directly to the dashboard layout.

### 3. Update `UnifiedDashboardView.tsx`
- Import `ChecklistsCard` and the new `GoalsCard`
- Add them as Zone 4a and 4b above the existing habits/plan row
- Rename the `ChecklistsModal` dialog header from "Missions Roadmap" to "Tasks & Goals"

### 4. Update `DashboardModals.tsx`
- Replace `MissionsRoadmap` in `ChecklistsModal` with the two separate components (Tasks + Goals)
- Update title/icon

### 5. Clean up references
- Update `NextActionBanner` and `QuickActionsBar` references from "missions" to reflect the new split
- Keep the `useMissionsRoadmap` hook intact as it's used by other components, but the dashboard will use the simpler data sources directly

### Data Sources (no DB changes needed)
- **Tasks**: `aurora_checklists` + `aurora_checklist_items` (already used by `useChecklistsData`)
- **Goals**: `life_plan_milestones.goal` (already used by `PlanProgressCard`)

