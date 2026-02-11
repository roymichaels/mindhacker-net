

# Mission System & 90-Day Plan Overhaul + Aurora Coaching Engine

## Overview
Transform the current missions dropdown from a simple categorized checklist into a **calendar-driven 90-day timeline** with daily task views, and build an **Aurora proactive coaching engine** that holds users accountable by checking in on task progress and motivating action.

---

## Part 1: Calendar-Based Mission Timeline

### Current Problems
- Missions are grouped by category (personal/business/health) with no date visibility
- No calendar or day-by-day view despite `due_date` existing on checklist items
- Milestones have `start_date`/`end_date` but aren't shown as timeline segments
- Users can't see "what do I need to do today/tomorrow/this week"

### New Design: 90-Day Calendar View

Replace the current tabs (daily/weekly/monthly) with a **timeline-first layout**:

1. **Today's Focus Panel** (top section)
   - Shows all tasks due today with checkboxes
   - Overdue tasks highlighted in red
   - Quick progress bar for the day

2. **Weekly Calendar Strip** (scrollable week view)
   - 7 columns showing each day of the current week
   - Each day shows task count and completion status (dot indicators)
   - Tap a day to expand and see its tasks
   - Current day highlighted

3. **90-Day Timeline** (collapsible month sections)
   - Month 1 / Month 2 / Month 3 accordion sections
   - Inside each month: 4 weekly milestone cards
   - Each week shows its milestone title, tasks, and completion %
   - Expandable to show day-by-day breakdown within the week
   - Current week auto-expanded with highlight

4. **Task Distribution Logic**
   - Query `life_plan_milestones` for each week's tasks
   - Distribute milestone tasks across the week's days using `aurora_checklist_items.due_date`
   - Recurring items (where `is_recurring = true`) show on every applicable day

### Files to Create/Modify
- **New**: `src/components/dashboard/missions/TodayFocus.tsx` - Today's task panel
- **New**: `src/components/dashboard/missions/WeekCalendarStrip.tsx` - Scrollable week view
- **New**: `src/components/dashboard/missions/MonthTimeline.tsx` - 90-day accordion
- **New**: `src/components/dashboard/missions/DayTaskList.tsx` - Expanded day view
- **Modify**: `src/components/dashboard/missions/MissionsRoadmap.tsx` - Replace current layout with new calendar-driven structure
- **Modify**: `src/hooks/useMissionsRoadmap.ts` - Add date-based querying, group tasks by date

---

## Part 2: Aurora Proactive Coaching Engine

### What It Does
Aurora periodically checks the user's task progress and sends proactive messages:

- **Morning kick-off**: "Good morning! You have 5 tasks today. Let's start with..."
- **Mid-day check-in**: "You've completed 2/5 tasks. Keep going!"
- **Missed tasks nudge**: "I noticed you didn't complete X yesterday. Want to reschedule it?"
- **Streak motivation**: "3 days in a row completing all tasks! Amazing!"
- **Suggestion engine**: "Based on your progress in Health, I suggest adding..."

### Implementation

#### A. Edge Function: `aurora-proactive`
- **New**: `supabase/functions/aurora-proactive/index.ts`
- Accepts actions: `analyze`, `get_pending`, `dismiss`
- `analyze` action:
  - Queries user's tasks for today, overdue items, completion streaks
  - Uses Lovable AI (gemini-3-flash-preview) to generate personalized coaching messages in Hebrew
  - Inserts results into `aurora_proactive_queue` with appropriate scheduling
- `get_pending` action: Returns unsent/undismissed items
- `dismiss` action: Marks items as dismissed

#### B. Proactive Message Types (new column on `aurora_proactive_queue`)
Add `trigger_type` categories:
- `morning_briefing` - Daily morning task overview
- `progress_check` - Mid-day progress update  
- `missed_task_nudge` - Reminder for overdue tasks
- `streak_celebration` - Completion streak recognition
- `task_suggestion` - AI-suggested new tasks/improvements
- `weekly_review` - End-of-week summary

#### C. Frontend Integration
- **Modify**: `src/hooks/aurora/useProactiveAurora.tsx` - Connect to the new edge function
- Aurora chat will display proactive messages as coaching bubbles
- Include action buttons: "Do it now", "Reschedule", "Skip"

#### D. Database Migration
- Add `title` and `body` text columns to `aurora_proactive_queue` (for storing the AI-generated message content)
- Add index on `(user_id, scheduled_for)` for efficient polling

---

## Part 3: Task Suggestion & Auto-Generation

### Aurora Suggests More Tasks
When a user completes a milestone or shows consistent progress, Aurora proactively suggests:
- New tasks related to their life pillars
- Intensified challenges ("You mastered morning routine - try adding cold showers")
- Tasks from other life domains they're neglecting

This uses the existing `aurora_checklists` + `aurora_checklist_items` tables with `origin: 'aurora'`.

---

## Technical Details

### Database Migration
```sql
-- Add columns to aurora_proactive_queue if missing
ALTER TABLE aurora_proactive_queue 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS body text;

-- Index for efficient polling
CREATE INDEX IF NOT EXISTS idx_proactive_queue_user_scheduled 
  ON aurora_proactive_queue(user_id, scheduled_for) 
  WHERE dismissed_at IS NULL AND sent_at IS NULL;
```

### Edge Function Flow
```text
User opens app
  --> useProactiveAurora polls every 5 min
  --> Edge function checks:
      1. Overdue tasks count
      2. Today's completion rate
      3. Streak data
      4. Last message sent (avoid spam)
  --> Generates coaching message via Lovable AI
  --> Returns to frontend as Aurora bubble
```

### New Component Hierarchy
```text
MissionsRoadmap (refactored)
  +-- TodayFocus (today's tasks + overdue)
  +-- WeekCalendarStrip (7-day strip, tap to expand)
  |     +-- DayTaskList (tasks for selected day)
  +-- MonthTimeline (3 months accordion)
        +-- WeekMilestoneCard (per-week milestone + tasks)
              +-- DayTaskList (expandable days within week)
```

### Config Update
- Add `aurora-proactive` to `supabase/config.toml` with `verify_jwt = false`

---

## Implementation Order
1. Database migration (add columns to proactive queue)
2. Refactor `useMissionsRoadmap` hook for date-based grouping
3. Build new calendar UI components (TodayFocus, WeekCalendarStrip, MonthTimeline, DayTaskList)
4. Replace MissionsRoadmap layout
5. Create `aurora-proactive` edge function
6. Connect proactive system to Aurora chat
