

# Plan Page Redesign: From Redundant to Million-Dollar

## The Problem

The current Plan page displays the **same milestone data 4 times** across overlapping components, creating a confusing, repetitive experience:

| Component | What it shows | Redundant? |
|-----------|--------------|------------|
| PlanProgressHero | Week counter, progress bar, current milestone | Primary |
| GoalsPanel | Milestones by month with progress | Duplicate of GoalsCard |
| GoalsCard | Milestones by month with progress | Duplicate of GoalsPanel |
| PlanProgressCard | Progress bar + current milestone | Duplicate of Hero |
| /life-plan page | Full milestone detail view | Separate page for same data |

Additionally, TasksPanel (Missions tab) pulls from `aurora_checklist_items` which feels disconnected from the 90-day plan context.

## The Solution: Single Unified Plan Page

Consolidate everything into **one cohesive, scrollable Plan page** with no tabs and no separate `/life-plan` route. The page tells a clear story from top to bottom:

```text
+------------------------------------------+
|  PLAN PROGRESS HERO (compact)            |
|  Week 3/12 | Month 1 | 0% progress      |
+------------------------------------------+
|                                          |
|  TODAY'S MISSIONS                        |
|  Smart section: overdue + today tasks    |
|  from checklists, contextual to plan     |
|  [progress bar: 2/7 done today]          |
|                                          |
+------------------------------------------+
|                                          |
|  90-DAY ROADMAP                          |
|  Month 1: Foundations  [0/4] ----        |
|    > Week 1 (current)  [expand]          |
|      - title + description               |
|      - tasks with checkboxes             |
|      - XP/Token rewards                  |
|      - [Complete Week] button            |
|    > Week 2                              |
|    > Week 3                              |
|    > Week 4                              |
|  Month 2: Building     [0/4] ----        |
|  Month 3: Momentum     [0/4] ----        |
|                                          |
+------------------------------------------+
|                                          |
|  LIFE ANALYSIS (pie chart)               |
|  Balance index across 8 pillars          |
|                                          |
+------------------------------------------+
```

## Technical Plan

### Step 1: Create unified `PlanRoadmap` component
New file: `src/components/dashboard/plan/PlanRoadmap.tsx`

Combines the best of `GoalsPanel`, `GoalsCard`, and the `/life-plan` page into one component:
- Month accordion sections with themed gradients and icons (seedling, hammer, rocket)
- Week rows inside each month with expand/collapse
- Expanded week shows: description, task checkboxes, XP/token rewards, complete button
- Current week auto-highlighted with "Current" badge
- Completed weeks show green checkmark

Uses a single query (from `GoalsPanel` pattern) to fetch plan + milestones.

### Step 2: Refactor `PlanTab.tsx`
Remove `Tabs` wrapper entirely. Render a clean vertical flow:
1. `PlanProgressHero` (already good, keep as-is)
2. `TasksPanel` (renamed section header to "Today's Missions")
3. `PlanRoadmap` (new unified component)
4. `LifeAnalysisChart` (keep at bottom)

Remove imports: `GoalsPanel`, `GoalsCard`, `PlanProgressCard`, `Tabs/TabsList/TabsTrigger/TabsContent`

### Step 3: Remove `/life-plan` route
- Remove route from `App.tsx`
- Remove lazy import of `LifePlan`
- Remove `navigate('/life-plan')` calls from `PlanProgressHero` "View Plan" button (replace with scroll-to-roadmap or remove entirely since we're already on the plan page)
- Keep `src/pages/LifePlan.tsx` file but it becomes unused (can delete later)

### Step 4: Clean up unused components
- `GoalsCard` - fully replaced by `PlanRoadmap`
- `PlanProgressCard` - fully replaced by `PlanProgressHero`
- `GoalsPanel` - fully replaced by `PlanRoadmap`
- Remove from `src/components/dashboard/v2/index.ts` exports

### Step 5: Polish PlanProgressHero
- Remove the "View Plan" button (no longer needed since roadmap is inline below)
- Keep the week counter, month badge, progress bar, and current milestone preview

### Summary of changes

| Action | File |
|--------|------|
| Create | `src/components/dashboard/plan/PlanRoadmap.tsx` |
| Rewrite | `src/pages/PlanTab.tsx` (remove tabs, linear layout) |
| Edit | `src/components/dashboard/v2/PlanProgressHero.tsx` (remove View Plan button) |
| Edit | `src/App.tsx` (remove `/life-plan` route) |
| Edit | `src/components/dashboard/v2/index.ts` (remove unused exports) |
| Delete refs | `GoalsPanel.tsx`, `GoalsCard.tsx`, `PlanProgressCard.tsx` become unused |

