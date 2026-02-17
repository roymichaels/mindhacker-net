
# Merge All 4 Tabs into One Dashboard Page

## Overview
Combine **Today**, **Plan**, **Sessions**, and **Me** into a single scrollable `/dashboard` page. Remove the bottom tab bar entirely — everything lives in one unified view.

## New `/dashboard` Page Structure (Top to Bottom)

### 1. Profile Identity Card (from Me tab)
- Personalized Orb + Identity Title
- Level, Tokens, Streak pills
- 3 metric cards: Readiness %, Clarity %, Consciousness score
- 3 quick-access buttons: Direction, Traits, Values
- Insights grid (8 tool buttons)

### 2. Next Action Banner (from Today tab)
- Priority-based action prompt (unchanged)

### 3. Sessions Section (from Sessions/Hypnosis tab)
- Daily Session hero card (Start Now CTA)
- 4-column stats row (Level, XP, Minutes, Sessions)
- 4 quick session cards (Calm, Focus, Energy, Sleep)
- Recent sessions list

### 4. Three Module Grid (from Today tab)
- Today's Habits card
- 90-Day Roadmap card (expandable)
- Tasks/Checklists card

### 5. Deep Insights Strip (from Today tab)
- Stats, AI Analysis, Identity, Values tab pills

## Navigation Changes

### Bottom Tab Bar
**Deleted entirely.** No more tabs — single page.

### Routes
| Route | Change |
|-------|--------|
| `/dashboard` | New unified page (no longer redirects) |
| `/today` | Redirect to `/dashboard` |
| `/plan` | Redirect to `/dashboard` |
| `/hypnosis` | Redirect to `/dashboard` |
| `/me` | Redirect to `/dashboard` |

## Technical Details

### Files Modified

1. **`src/pages/UserDashboard.tsx`** — Complete rewrite as the unified dashboard
   - Merge content from TodayTab, HypnosisLibrary, MeTab, and PlanTab
   - Import ProfileContent, TodaysHabitsCard, ChecklistsCard, PlanRoadmap, RecentSessions, NextActionBanner
   - Single scrollable PageShell with all sections stacked vertically
   - Keep all existing data hooks (useUnifiedDashboard, useGameState, useDailyHypnosis, etc.)

2. **`src/App.tsx`** — Route consolidation
   - `/dashboard` renders DashboardLayout + new UserDashboard (no longer redirects to /today)
   - `/today`, `/plan`, `/me` all redirect to `/dashboard`
   - `/hypnosis` redirects to `/dashboard` (keep `/hypnosis/session` for the actual player)

3. **`src/components/navigation/BottomTabBar.tsx`** — Delete or empty out
   - Remove all tab buttons since there's only one page now

4. **`src/components/dashboard/DashboardLayout.tsx`** — Remove BottomTabBar rendering
   - Since there are no tabs, the layout no longer needs the bottom nav

### Component Reuse
- **ProfileContent** — rendered inline (not as a separate page)
- **TodaysHabitsCard**, **ChecklistsCard**, **PlanRoadmap** — reused from Today tab
- **NextActionBanner** — reused as-is
- **RecentSessions** + Quick Sessions grid — pulled from HypnosisLibrary
- **HypnosisModal** — kept for session launch

### What Gets Removed
- Bottom tab bar (3 tabs gone)
- Separate TodayTab, PlanTab, MeTab page components (kept in codebase but no longer routed)
- HypnosisLibrary as a standalone page (content merged into dashboard)

### What Stays Untouched
- `/hypnosis/session` route (actual session player)
- All data hooks and queries
- Aurora chat (globally docked)
- Admin routes
- All other routes
