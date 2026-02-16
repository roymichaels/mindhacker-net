

# Unified Data Model: "ActionItem" as the Single Source of Truth

## The Problem Today

Your data is scattered across 6+ tables, each with its own schema, its own queries, and its own UI components:

```
aurora_checklists (11,374) + aurora_checklist_items (47,631) -- Tasks
aurora_daily_minimums (15) + daily_habit_logs (0) -- Habits
life_plan_milestones (360) -- Goals
hypnosis_sessions (64) -- Sessions
aurora_reminders (0) + aurora_proactive_queue (15) -- Nudges
xp_events (146) -- Rewards
```

29 files across the frontend query these tables independently. Every new feature means touching multiple tables and writing new query logic.

## The Solution: One Table to Rule Them All

Create a single `action_items` table that unifies all actionable things in the system. Everything becomes a view/filter over ActionItems.

### New Table: `action_items`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| **type** | text | `task`, `habit`, `session`, `milestone`, `reflection` |
| **source** | text | `plan`, `user`, `aurora`, `coach`, `system` |
| **status** | text | `todo`, `doing`, `done`, `skipped` |
| title | text | Display title |
| description | text | Optional details |
| **due_at** | timestamptz | When it's due (nullable for habits) |
| **recurrence_rule** | text | `daily`, `weekly`, `monthly`, or null (one-time) |
| **pillar** | text | `consciousness`, `business`, `health`, `relationships`, `finances`, `learning`, `purpose`, `hobbies`, or null |
| project_id | uuid | FK to user_projects (nullable) |
| plan_id | uuid | FK to life_plans (nullable) |
| milestone_id | uuid | FK to life_plan_milestones (nullable) |
| parent_id | uuid | Self-reference for checklist grouping (nullable) |
| ego_state | text | Associated ego state (nullable) |
| tags | text[] | Flexible tagging |
| xp_reward | integer | XP awarded on completion (default 10) |
| token_reward | integer | Tokens awarded on completion (default 0) |
| order_index | integer | Sort order within parent |
| metadata | jsonb | Flexible extra data (duration_seconds for sessions, script_data, etc.) |
| completed_at | timestamptz | When completed |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### How Every Feature Becomes a Filter

| Feature | Filter |
|---------|--------|
| Dashboard "Today" | `type IN ('task','habit') AND (due_at = today OR recurrence_rule IS NOT NULL) AND status != 'done'` |
| Habits page | `type = 'habit'` |
| Checklist card | `parent_id = [checklist_action_item_id]` |
| Goals/Milestones | `type = 'milestone'` |
| Power-Up (Hypnosis) | `type = 'session' AND status = 'done' AND DATE(completed_at) = today` |
| Proactive coaching | Aurora creates ActionItems with `source = 'aurora'` |
| Gamification | `xp_reward` + `token_reward` columns, awarded on status -> 'done' |
| Plan progress | `plan_id = [active_plan] AND status = 'done'` / total |
| Weekly review | `completed_at BETWEEN week_start AND week_end` |

### Migration Strategy (Zero Downtime)

This is a large structural change. We do it in 3 phases to avoid breaking anything:

**Phase 1: Create + Populate (this implementation)**
1. Create `action_items` table with RLS policies
2. Create a migration function that copies existing data:
   - Each `aurora_checklist_items` row becomes a `type='task'` ActionItem, with `parent_id` pointing to a `type='task'` ActionItem created from its parent `aurora_checklists` row
   - Each `aurora_daily_minimums` row becomes a `type='habit'` ActionItem with `recurrence_rule='daily'`
   - Each `life_plan_milestones` row becomes a `type='milestone'` ActionItem
   - Each `hypnosis_sessions` row becomes a `type='session'` ActionItem with session data in `metadata`
3. Create database trigger that auto-awards XP when status changes to 'done'
4. Create helper views: `v_today_actions`, `v_habits`, `v_milestones`

**Phase 2: Dual-Write Adapter Layer (this implementation)**
1. Create `src/services/actionItems.ts` -- a single service with typed queries:
   - `getTodayActions(userId)` -- today's tasks + habits
   - `getHabits(userId)` -- all habits
   - `getMilestones(userId, planId)` -- plan milestones
   - `completeAction(id)` -- mark done + award XP
   - `createAction(data)` -- create any type
   - `getByParent(parentId)` -- checklist items
2. Create `src/hooks/useActionItems.ts` -- React Query hook wrapping the service
3. Update `UnifiedDashboardView` to use the new hook instead of separate queries

**Phase 3: Migrate All Consumers (follow-up)**
- Gradually replace the 29 files querying old tables with `useActionItems` filters
- Update edge functions (`aurora-chat`, `aurora-proactive`, `generate-hypnosis-script`) to read/write `action_items`
- Once all consumers migrated, old tables become read-only archives

### Files to Create
1. **Database migration** -- `action_items` table, RLS, data migration function, XP trigger, views
2. **`src/services/actionItems.ts`** -- Typed query service (single source for all action item operations)
3. **`src/hooks/useActionItems.ts`** -- React Query hooks with filter presets

### Files to Modify
1. **`src/components/dashboard/UnifiedDashboardView.tsx`** -- Wire up PlanProgressHero + StatsGrid to use action_items counts
2. **`src/components/dashboard/v2/NextActionBanner.tsx`** -- Query `action_items` instead of separate tables
3. **`src/components/dashboard/unified/ChecklistsCard.tsx`** -- Read from `action_items WHERE parent_id IS NOT NULL`
4. **`src/components/dashboard/v2/GoalsCard.tsx`** -- Read from `action_items WHERE type='milestone'`
5. **`src/components/dashboard/v2/TodaysHabitsCard.tsx`** -- Read from `action_items WHERE type='habit'`
6. **`src/services/unifiedContext.ts`** -- Add action_items summary to AI context

### RLS Policies
- `SELECT`: Users can only read their own action_items
- `INSERT`: Users can only create action_items for themselves
- `UPDATE`: Users can only update their own action_items
- `DELETE`: Users can only delete their own action_items

### XP Auto-Award Trigger
```
When action_items.status changes to 'done':
  1. Set completed_at = now()
  2. Call award_unified_xp(user_id, xp_reward, 'action_item', title)
  3. If token_reward > 0, add tokens
```

### Data Volume Estimate
- ~47,631 task items + ~11,374 task parents + ~15 habits + ~360 milestones + ~64 sessions = ~59,444 rows migrated
- All with proper indexing on (user_id, type, status, due_at)

### What This Enables
- **One query** to get everything a user needs to do today
- **One mutation** to complete anything and get rewarded
- Aurora AI creates/suggests ActionItems instead of writing to 3 different tables
- Plan progress is just `COUNT(*) WHERE plan_id = X AND status = 'done'` / total
- Weekly reviews are just `WHERE completed_at BETWEEN dates`
- The entire gamification engine is a single trigger, not scattered across hooks

