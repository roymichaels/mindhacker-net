

# Unified Life Control Center — Merge 4 Tabs into 1

## What Changes

The current 4-tab system (Today, Plan, Sessions, Me) creates cognitive fragmentation. Users hop between tabs to see pieces of the same picture. We're merging Today + Plan into a single `/today` "Life Control Center" while keeping Sessions and Me as separate tabs (they serve distinct purposes).

**Why not merge ALL 4?** Sessions (hypnosis library) and Me (identity/profile) are genuinely different functions. Sessions is a media player/library. Me is identity management. Forcing them into the same page would create a 10-screen scroll. The real redundancy is between Today and Plan — both show tasks, missions, habits, and progress. That's the merge.

## Current State vs New State

**Current 4 tabs:**
- Today: Banner slider, NextActionBanner, Habits card, Checklists card
- Plan: Transformation Hero, Tasks (collapsible), 90-Day Roadmap (collapsible)
- Sessions: Daily session hero, stats, quick sessions, recent sessions
- Me: Profile/identity card

**New 3 tabs:**
- **Home** (`/today`): Unified command center with all execution + strategy in one scroll
- **Sessions** (`/hypnosis`): Unchanged
- **Me** (`/me`): Unchanged

## New `/today` Page Structure (Top to Bottom)

### Section 1 — Compact Identity Header
A slim hero bar (not a huge card) showing:
- User name / identity title
- Level + XP progress bar (inline)
- 3 micro-metrics: Focus Score, Energy Score, Momentum Score
- No oversized padding. One line of identity, one line of metrics.

### Section 2 — NextActionBanner
Stays as-is. Already priority-based and excellent.

### Section 3 — Three Module Cards
A responsive grid (`md:grid-cols-3`, stacked on mobile):

**Card 1 — Today (Execution Layer)**
- Today's habits (max 5, toggle to complete)
- Daily streak indicator
- Small progress bar
- Reuses existing `TodaysHabitsCard` component internals

**Card 2 — 90-Day Roadmap (Strategy Layer)**
- Current phase + week number
- % completion + progress bar
- Next milestone preview
- "Expand" toggle to show full roadmap inline
- Reuses data from PlanTab's `planData` query + `PlanRoadmap` component

**Card 3 — Tasks & Systems (Foundation Layer)**
- Active checklists (collapsed, expandable)
- Overall completion %
- Reuses existing `ChecklistsCard` component

### Section 4 — Deep Insights Strip
Horizontal tab strip below the grid:
`[ Stats ] [ AI Analysis ] [ Identity ] [ Values ]`
These render expandable panels inline (no navigation). Reuses existing modal components from ProfileContent (AIAnalysisModal, IdentityModal, TraitsModal, etc.) but rendered as inline expandable sections instead of modals.

## Navigation Changes

### Bottom Tab Bar (3 tabs instead of 4)
| Before | After |
|--------|-------|
| Today, Plan, Sessions, Me | Home, Sessions, Me |

### Route Changes
| Route | Before | After |
|-------|--------|-------|
| `/today` | TodayTab | **New unified Home page** |
| `/plan` | PlanTab | Redirects to `/today` |
| `/dashboard` | Redirects to `/today` | Same |

## Technical Details

### Files Modified (4)

1. **`src/pages/TodayTab.tsx`** — Complete rewrite as unified control center
   - Import and inline: TodaysHabitsCard, ChecklistsCard, PlanRoadmap, plan hero data query
   - Add compact identity header (reuse `useUnifiedDashboard` hook)
   - Add 3-card grid layout
   - Add deep insights tab strip (reuse modal components as inline panels)
   - Remove DashboardBannerSlider (replaced by compact identity header)

2. **`src/components/navigation/BottomTabBar.tsx`** — Remove Plan tab
   - Change from 4 tabs to 3: Home, Sessions, Me
   - Rename "Today" label to "Home" / "בית"

3. **`src/App.tsx`** — Route cleanup
   - Change `/plan` from rendering PlanTab to `<Navigate to="/today" replace />`
   - Keep all other routes unchanged

4. **`src/components/dashboard/v2/NextActionBanner.tsx`** — Minor fix
   - Update any `navigate('/plan')` references to scroll-to behavior (since plan is now inline)

### Files NOT Modified
- `PlanTab.tsx` — Stays in codebase but no longer routed to (available for Pro view later)
- `HypnosisLibrary.tsx` — Unchanged
- `MeTab.tsx` / `ProfileContent.tsx` — Unchanged
- All hooks, data queries, existing card components — Reused as-is

### New Components (2, inside TodayTab)

1. **Compact Identity Header** — Inline component (not a separate file)
   - Uses `useUnifiedDashboard()` for level, xp, streak
   - Compact: `py-3 px-4` with flex row layout
   - 3 micro-metric pills in a row

2. **Roadmap Summary Card** — Inline component
   - Uses the same `planData` query from PlanTab
   - Shows week circle (small, `w-12`), phase, progress
   - Expand toggle renders `<PlanRoadmap />` below

### Responsive Grid
```
Desktop (md+): grid-cols-3 — all 3 cards side by side
Tablet (sm): grid-cols-2 — Today + Roadmap side by side, Tasks below  
Mobile: grid-cols-1 — all stacked vertically
```

### Deep Insights Strip
- Horizontal scrollable pill buttons
- Clicking one expands a panel below the strip (AnimatePresence)
- Content reuses existing dashboard modal components but rendered inline
- Only one panel open at a time

## What Gets Removed
- Plan as a separate tab in bottom navigation
- DashboardBannerSlider from Today page (replaced by compact identity header)
- Duplicate task/habit displays across pages

## What Stays Untouched
- Sessions page (hypnosis library) — distinct media function
- Me page (profile/identity) — distinct identity function  
- All data hooks and queries — reused
- All card components — reused with minor layout adjustments
- Onboarding flow — unchanged
- Aurora chat — unchanged

