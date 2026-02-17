
# Move Daily Pulse Above Habits + Add Vertical Roadmap to Left Column

## What Changes

### 1. Move "Daily Pulse" (דופק יומי) above "Habits" (הרגלים) in COL 2
Currently, the Daily Pulse card sits below Tasks in the middle column (mobile) and in COL 3 (desktop). It will be moved to the very top of COL 2 (the plan modules column), above the Habits collapsible row, on both mobile and desktop.

### 2. Replace COL 3 with a Vertical Milestone Roadmap (Web3-style)
The now-empty right column on desktop will be replaced with a beautiful vertical timeline roadmap showing the user's 12-week (90-day) journey. Inspired by Web3/crypto project roadmaps, it will feature:

- A **vertical glowing line** running down the center-left of the column, with milestone nodes along it
- Each milestone node is a **circle with a pulsing glow** for the current week, filled/checked for completed weeks, and dimmed/outlined for future weeks
- The **current milestone** gets a larger node with an animated ring + golden accent
- Each node connects to a small card showing: week number, milestone title, and completion status
- Completed milestones show a checkmark with a green glow
- Future milestones appear slightly transparent/muted
- A subtle **progress gradient** fills the line from top down to the current position
- Month labels ("Month 1: Foundations", "Month 2: Building", "Month 3: Momentum") divide the roadmap into 3 themed sections with separator lines

## Technical Details

### File: `src/components/dashboard/MobileHeroGrid.tsx`
- Move `<DailyPulseCard />` from COL 3 and the `lg:hidden` mobile position to the top of COL 2 (before the Habits collapsible row)
- Remove the duplicate `lg:hidden` wrapper -- show it in COL 2 on all screen sizes
- Remove the COL 3 desktop-only `<DailyPulseCard />`
- In COL 3, render the new `<VerticalRoadmap />` component instead, using `planData` prop + fetching milestones

### File: `src/components/dashboard/VerticalRoadmap.tsx` (New)
- New component that fetches milestones from `life_plan_milestones` table via the active `life_plans` record
- Renders a vertical timeline with:
  - A continuous gradient line (`bg-gradient-to-b from-amber-500 to-amber-500/20`)
  - Milestone nodes positioned along the line with connecting horizontal arms
  - Current week node has a pulsing amber ring animation (CSS keyframes via framer-motion)
  - Completed nodes: filled amber with checkmark icon
  - Future nodes: border-only, muted opacity
  - Month dividers with themed labels (Foundations/Building/Momentum)
- Supports RTL layout
- Shows "You are here" indicator at the current week
- Compact design that fits the 240-280px column width

### File: `src/components/dashboard/MobileHeroGrid.tsx` (COL 3 update)
- Import and render `<VerticalRoadmap />` in the desktop-only COL 3 container
- On mobile, the roadmap remains accessible through the "90-Day Plan" collapsible row (no change there)

## Layout Result

```text
Desktop (3 columns):
+------------------+-------------------------+------------------+
|   COL 1 (HUD)    |    COL 2 (Plan)         | COL 3 (Roadmap)  |
|                   |                         |                  |
|   [Orb]           |   [Daily Pulse]         |  Month 1         |
|   Identity Title  |   [Habits]              |  o-- Week 1 Done |
|   Badges          |   [90-Day Plan]         |  o-- Week 2 Done |
|   Stats           |   [Tasks]               |  o-- Week 3 Done |
|   Session Stats   |   [Recalibration]       |  *== Week 4 NOW  |
|   [Start Session] |   [Identity/Dir/Ins]    |  Month 2         |
|                   |                         |  o-- Week 5      |
|                   |                         |  o-- Week 6      |
|                   |                         |  ...              |
+------------------+-------------------------+------------------+

Mobile (stacked):
[Daily Pulse]
[Habits]
[90-Day Plan]
[Tasks]
[Recalibration]
[Identity / Direction / Insights]
```
