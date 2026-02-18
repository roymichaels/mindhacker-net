

# Daily Roadmap - Dashboard Body Redesign

## What Changes

The dashboard body currently shows separate, disconnected sections: a Daily Pulse check-in, a Habits collapsible, and a Tasks collapsible. This feels fragmented and the Daily Pulse isn't motivating action. We'll replace all three with a single **Daily Roadmap** -- a unified, visual timeline of everything the user needs to do today.

## New "Daily Roadmap" Component

A vertical mini-timeline that merges today's habits, tasks, and current milestone into one motivating, actionable view:

```
Today's Journey
  [progress bar: 3/8 complete]

  [=] Wake up routine           (habit, done)
  [=] Morning meditation        (habit, done)
  [=] Review daily plan         (task, done)
  [ ] Nutrition tracking        (habit)
  [ ] Week 3: Build routine     (milestone, current)
  [ ] Evening reflection        (habit)
  [ ] Screen off by 22:00       (habit)
  [ ] Journal entry             (task)
```

Each item is tappable to complete (habits/tasks) or view details (milestones). Items are color-coded by type (emerald for habits, violet for tasks, amber for milestones).

## Layout in Dashboard Body

The new order in `MobileHeroGrid` COL 2:

1. **StartSessionButton** (stays)
2. **MotivationalBanner** (stays)
3. **DailyRoadmap** (NEW -- replaces DailyPulse + Habits + Tasks)
4. **RecalibrationSummary** (stays)

The Daily Pulse data collection still happens, but moves into the Daily Roadmap as the first uncompleted item when not yet logged today (a quick inline prompt rather than a separate card).

---

## Technical Details

### New file: `src/components/dashboard/DailyRoadmap.tsx`

- Combines data from `useTodaysHabits()`, tasks query (from `action_items`), `useLifePlanWithMilestones()`, and `useDailyPulse()`
- Renders a vertical mini-timeline with a progress line (similar visual language to `VerticalRoadmap`)
- Item types distinguished by icon + color:
  - Habits: Sparkles icon, emerald
  - Tasks: ListChecks icon, violet
  - Milestones: MapPin icon, amber (non-toggleable, opens detail)
  - Daily Pulse: Activity icon, primary (inline micro-form when not logged)
- Progress bar at top showing `completed/total` with percentage
- Items sorted: completed at bottom (faded), pulse first if not done, then habits, then tasks, then milestone
- Each habit/task has a tap-to-complete circle (reuses existing toggle logic)
- Collapsible "completed" section at bottom to keep focus on remaining items

### Modify: `src/components/dashboard/MobileHeroGrid.tsx`

- Remove `DailyPulseCard` import and usage
- Remove the two `CollapsiblePlanRow` blocks (habits and tasks)
- Add `DailyRoadmap` component in their place
- Keep `CollapsiblePlanRow` sub-component in file (or remove if unused elsewhere)
- Clean up unused imports (`Sparkles`, `ListChecks` if only used there)

### Keep existing hooks unchanged

- `useTodaysHabits` -- consumed by DailyRoadmap
- `useDailyPulse` -- consumed by DailyRoadmap for inline pulse
- Task query logic moves into DailyRoadmap (or extracted to a shared hook)
