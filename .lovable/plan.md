

# HUD Collapsed Stretch + Roadmap Collapsed Mini-View + Milestone Detail Modal

## Problem

1. **HUD collapsed view** is too cramped -- tiny icons/text crammed at the top, not using the full sidebar height, hard to read.
2. **Roadmap sidebar** shows nothing when collapsed -- just a narrow 10px bar. Users lose all context about their journey.
3. **Milestones are not clickable** -- there's no way to see full details (description, goal, tasks, challenge, rewards) for any milestone.

## Changes

### 1. HudSidebar.tsx -- Stretch collapsed view to full height

**Current**: `gap-2 pt-10` with `text-[8px]`/`text-[9px]` font sizes, all stacked tightly at top.

**New collapsed layout**:
- Widen collapsed width from `w-14` to `w-16` (64px) for better readability
- Use `justify-between` on the flex column so content distributes vertically across the full sidebar height
- Top section: Orb (48px) + Level badge
- Middle section: Stats displayed with larger icons (`w-4 h-4`) and readable text (`text-[10px]`), each stat gets a mini card background with padding
- Bottom section: Modal trigger buttons (Identity/Direction/Insights) anchored to the bottom
- Separators between sections use gradient lines instead of plain 6px bars
- Each stat item gets a tiny rounded background (`bg-muted/30 rounded-lg p-1.5`) for visual separation and readability

### 2. RoadmapSidebar.tsx -- Show mini roadmap when collapsed

**Current**: When collapsed (`w-10`), content is fully hidden.

**New collapsed layout**:
- Widen collapsed width from `w-10` to `w-14` (56px)
- Show a mini vertical timeline with:
  - Small progress circle at top showing completion %
  - Vertical line (3px) with gradient fill showing progress
  - Mini milestone nodes: completed (green dot), current (amber pulsing dot), future (gray dashed circle)
  - Week numbers as tiny labels (`text-[9px]`) next to each node
  - Month divider pills (M1/M2/M3) as horizontal lines
- Each milestone node is **clickable** -- opens the milestone detail modal
- The mini view uses the same `useLifePlanWithMilestones()` hook data

### 3. New: MilestoneDetailModal.tsx

A new dialog component that shows everything about a single milestone:

**Header**:
- Week number badge + completion status indicator
- Milestone title (large, prominent)
- Focus area tag if present

**Body (scrollable)**:
- **Goal**: The milestone's goal text
- **Description**: Full description
- **Tasks**: Checklist of tasks (from the `tasks` string array)
- **Challenge**: Weekly challenge text if present
- **Rewards**: XP and token reward amounts displayed with icons

**Footer**:
- "Mark Complete" button (if not already completed, uses `useCompleteMilestone` hook)
- Completed date if already done

### 4. VerticalRoadmap.tsx -- Make milestones clickable

- Add `onMilestoneClick?: (milestone: MilestoneData) => void` prop
- Both Desktop and Horizontal timeline nodes get `cursor-pointer` + `onClick`
- In the sidebar contexts, clicking opens the MilestoneDetailModal
- In standalone usage (PlanTab), same behavior

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/dashboard/HudSidebar.tsx` | Modify collapsed section -- stretch to full height, larger elements, distributed layout |
| `src/components/dashboard/RoadmapSidebar.tsx` | Add collapsed mini-timeline view with clickable nodes |
| `src/components/dashboard/MilestoneDetailModal.tsx` | Create -- full milestone detail dialog |
| `src/components/dashboard/VerticalRoadmap.tsx` | Add `onMilestoneClick` prop, make nodes clickable, integrate modal |

## Technical Details

- The milestone detail modal uses the existing `Dialog` from `@/components/ui/dialog`
- Milestone data is already fetched via `useLifePlanWithMilestones()` which returns the full `Milestone` type (with `description`, `goal`, `focus_area`, `tasks[]`, `challenge`, `xp_reward`, `tokens_reward`, etc.)
- For the collapsed roadmap, a separate lightweight query is NOT needed -- the `VerticalRoadmap` component already has all the data. Instead, the `RoadmapSidebar` will query directly using `useLifePlanWithMilestones()` and render its own collapsed mini-view
- The `useCompleteMilestone()` mutation hook already exists and handles DB update + toast + cache invalidation

