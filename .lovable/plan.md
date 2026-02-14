
# Deep Integration: Aurora Proactive Coaching + Projects + Notifications

## Problem

The proactive coaching system is completely disconnected:
- `useProactiveAurora` hook exists but is **never used by any component**
- No scheduled cron job exists (`pg_cron` not enabled) so `batch_analyze` never runs
- Projects (`user_projects`) are invisible to Aurora's AI brain
- Proactive queue items never become user notifications (two separate tables, no bridge)
- NextActionBanner has no awareness of projects
- No daily digest or accountability notifications

## Solution: 5-Part Integration

### Part 1: Wire Up Proactive Aurora to the Dashboard

Connect `useProactiveAurora` to the `NextActionBanner` and `UnifiedDashboardView` so proactive coaching messages actually appear in the UI.

- Import and use `useProactiveAurora` in `NextActionBanner`
- Show proactive coaching messages as a high-priority banner action (e.g., "Aurora has a message for you")
- Clicking it opens Aurora chat with the proactive message pre-loaded
- Add dismiss capability directly on the banner

### Part 2: Bridge Proactive Queue to User Notifications

Create a database trigger so that every new `aurora_proactive_queue` item automatically creates a corresponding `user_notification`. This means:

- Proactive coaching messages appear in the notification bell
- Push notifications fire automatically (existing trigger on `user_notifications` handles this)
- Users who don't open the dashboard still get nudged

**New trigger function:**
```text
ON INSERT to aurora_proactive_queue
  -> INSERT into user_notifications (user_id, type='aurora_coaching', title, message, link='/aurora')
```

### Part 3: Add Projects to Aurora's Brain

Update the `aurora-chat` edge function's system prompt to include project context:

- Fetch user's active projects from `user_projects` and inject them into the AI prompt
- Add project-specific action tags (e.g., `[project:update:ProjectName]`)
- Aurora can now discuss, track, and nudge about specific projects

Update the `aurora-proactive` edge function to also analyze projects:

- Check for stalled projects (no progress change in 7+ days)
- Check for projects approaching target dates
- Generate project-specific coaching nudges

### Part 4: Scheduled Daily Analysis (Cron Job)

Enable `pg_cron` and `pg_net` extensions and set up a scheduled job to call `aurora-proactive` with `batch_analyze` every 3 hours. This ensures:

- Morning briefings are queued (7-10am)
- Mid-day progress checks (2-6pm)
- Overdue task nudges throughout the day
- Project deadline reminders
- Weekly reviews (Friday evening)

### Part 5: Project Awareness in Dashboard

Update the `NextActionBanner` priority system to include project-related actions:

| Priority | Condition | Action |
|---|---|---|
| 0 | Consciousness journey incomplete | Continue journey |
| 1 | Aurora has a proactive message | Show coaching nudge |
| 2 | Overdue tasks | View tasks |
| 3 | Stalled project (7+ days no progress) | Update project |
| 4 | Incomplete daily habits | Complete habits |
| 5 | No hypnosis today | Start hypnosis |
| 6 | Active milestone | View plan |
| 7 | All clear | Chat with Aurora |

---

## Technical Details

### Files to create:
- `supabase/migrations/[timestamp].sql` -- pg_cron setup, bridge trigger, project analysis helpers

### Files to modify:
- `src/components/dashboard/v2/NextActionBanner.tsx` -- add proactive message priority + project stall detection
- `src/components/dashboard/UnifiedDashboardView.tsx` -- wire `useProactiveAurora`
- `supabase/functions/aurora-proactive/index.ts` -- add project context analysis (stalled projects, approaching deadlines)
- `supabase/functions/aurora-chat/index.ts` -- inject `user_projects` into system prompt context

### Database changes:
1. Enable `pg_cron` and `pg_net` extensions
2. Create trigger: `aurora_proactive_queue` INSERT -> `user_notifications` INSERT
3. Create cron job: call `aurora-proactive` `batch_analyze` every 3 hours
4. Update `user_notifications` insert policy to allow trigger-based inserts (SECURITY DEFINER function)

### Proactive-to-Notification bridge trigger:
```text
CREATE FUNCTION bridge_proactive_to_notification()
  ON INSERT aurora_proactive_queue
  -> INSERT user_notifications(
       user_id,
       type: 'aurora_coaching',
       title: NEW.title,
       message: NEW.body,
       link: '/aurora'
     )
```

### Aurora-chat project context injection:
The edge function will query `user_projects` for the current user and append a section to the system prompt:
```text
## Active Projects
- "My Startup" (Business, 45% complete, target: March 2026)
  Vision: Build a SaaS platform...
  Blockers: Need funding
- "Learn Guitar" (Personal, 20% complete)
```

### Aurora-proactive project analysis additions:
```text
- Stalled project (no update in 7+ days) -> trigger_type: 'project_stalled', priority: 7
- Project deadline in 14 days -> trigger_type: 'project_deadline', priority: 8
- New project with no milestones -> trigger_type: 'project_setup', priority: 5
```
