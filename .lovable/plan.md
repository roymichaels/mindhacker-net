

# Coach-Specific Sidebars for the Coaches Tab

## The Idea

Right now, when you're on the Coaches tab, you still see the personal dashboard sidebars (your Orb/XP on the left, your 90-day roadmap on the right). These are irrelevant when you're managing your coaching business. Instead, the sidebars should swap to show **coaching-specific content** that mirrors the same glassmorphic, collapsible sidebar pattern.

## What Goes in Each Sidebar

### Left Sidebar: "Coach HUD" (Business Pulse)
Instead of your personal Orb and XP stats, this shows your **business health at a glance**:

- **Coach Avatar/Logo** -- your practitioner profile image or storefront logo (clickable to preview storefront)
- **Quick Stats** (collapsed = icons + numbers, expanded = labeled cards):
  - Active Clients count
  - Average Rating (stars)
  - Total Revenue / Earnings
  - Pending Reviews count
- **Divider**
- **Quick Actions** (3 buttons in a grid, same style as Identity/Direction/Insights on the dashboard):
  - "Add Client" (UserPlus icon)
  - "New Plan" (Brain icon)  
  - "View Storefront" (ExternalLink icon)
- **Collapsed mini view**: Just the avatar + stat numbers stacked vertically with icons

### Right Sidebar: "Client Pipeline" (Activity Feed)
Instead of the 90-day roadmap, this shows your **client activity and pipeline**:

- **Progress circle** at top showing overall client completion rate (same style as roadmap progress %)
- **Mini Client Timeline** -- vertical list of recent client events:
  - New client joined
  - Plan completed
  - Session scheduled
  - Review received
- Each event is a small node on a vertical line (same visual language as the roadmap milestones)
- **Upcoming Sessions** section at the bottom (next 3 scheduled sessions)
- **Collapsed mini view**: Progress circle + event count dots

## How It Works Technically

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/coach/CoachHudSidebar.tsx` | Left sidebar -- business stats, quick actions, coach avatar |
| `src/components/coach/CoachActivitySidebar.tsx` | Right sidebar -- client pipeline, activity feed, upcoming sessions |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/dashboard/DashboardLayout.tsx` | Accept optional `leftSidebar` and `rightSidebar` props to swap sidebars. Default to HudSidebar/RoadmapSidebar |
| `src/App.tsx` | Pass coach sidebars to DashboardLayout when rendering the `/coaches` route |
| `src/pages/Coaches.tsx` | Export a flag or wrap CoachHub with sidebar context |

### Architecture

The `DashboardLayout` gets two new optional props:

```text
DashboardLayout
  props:
    leftSidebar?:  ReactNode  (defaults to <HudSidebar />)
    rightSidebar?: ReactNode  (defaults to <RoadmapSidebar />)
```

In `App.tsx`, the `/coaches` route passes the coach sidebars:

```text
<DashboardLayout
  leftSidebar={isPractitioner ? <CoachHudSidebar /> : undefined}
  rightSidebar={isPractitioner ? <CoachActivitySidebar /> : undefined}
>
  <Coaches />
</DashboardLayout>
```

Non-practitioners still see the landing page with default sidebars.

### Visual Structure (matches dashboard pattern exactly)

```text
+--[ Coach HUD ]--+-----[ Main Content ]-----+--[ Activity ]--+
| [Avatar/Logo]   |  HeroBanner              | [Progress %]   |
| Lv.Pro          |  PillTabNav              | [Event dots]   |
|                 |                           |                |
| Active: 12      |  Tab Content              | * New client   |
| Rating: 4.8     |  (Clients, Plans, etc.)   | * Plan done    |
| Revenue: $2.4k  |                           | * Review       |
| Pending: 3      |                           | * Session      |
|                 |                           |                |
| [Add] [Plan]    |                           | Next Sessions: |
| [Storefront]    |                           | - Mon 10am     |
+-----------------+---------------------------+----------------+
```

### Styling
- Both sidebars use the exact same glassmorphic backdrop-blur styling as HudSidebar/RoadmapSidebar
- Same collapse/expand behavior (collapsed on screens < 1024px, toggle button in same position)
- Same width transitions (collapsed: 64px left / 54px right, expanded: 280-300px)
- Purple/indigo accent colors (matching Coach Hub theme) instead of the default primary color
- Same mini card styling for collapsed stats

### Data Sources
- Client stats: reuse existing `useCoachClientStats` and `useCoachClients` hooks
- Reviews/Rating: query `practitioner_reviews` (already done in CoachMarketingTab)
- Activity feed: query recent entries from `coach_clients` + `practitioner_reviews` ordered by `created_at`
- Upcoming sessions: placeholder for now (no sessions table yet), show "No sessions scheduled"

