
# Make the UI Feel Integrated: 4-Tab Navigation

## The Problem Today

The app currently has a **feature museum** navigation:
- **Sidebar (desktop)**: 5 gradient buttons (Dashboard, My Plan, Aurora Coach, Projects, Progress) plus header icons for Tasks, Goals, Coaches, Hypnosis, Notifications
- **Mobile**: Hamburger menu opens the same sidebar as a sheet, same header icons crammed into the top bar
- **Routes**: 30+ protected routes for 8 pillar hubs, their journeys, projects, hypnosis, community, messages, launchpad, life-plan, etc.
- **No bottom tabs on mobile** -- users must always open the hamburger or tap header icons

Users see a wall of options instead of a story. The fix: 4 tabs maximum, everything else becomes a secondary screen reachable from those.

## The 4 Tabs

| Tab | Icon | Label (EN/HE) | What It Shows |
|-----|------|----------------|---------------|
| **Today** | LayoutDashboard | Today / היום | NextActionBanner + Habits + Checklists (the "1 clear action" screen) |
| **Plan** | Target | Plan / תוכנית | LifePlan + PlanProgressHero + GoalsCard + LifeAnalysisChart + pillar hubs |
| **Coach** | Sparkles | Aurora / אורורה | Full Aurora chat (existing AuroraChatArea) |
| **Me** | User | Me / אני | StatsGrid + Profile + Progress + Settings |

## What Moves Where

| Current Location | New Home |
|-----------------|----------|
| Dashboard (NextActionBanner, Habits, Checklists) | **Today** tab |
| StatsGrid (Level, XP, Streak, Tokens) | **Me** tab |
| LifeAnalysisChart + PlanProgressHero + GoalsCard | **Plan** tab |
| PlanProgressCard (Power-Up / Hypnosis) | **Plan** tab (secondary action) |
| Aurora chat (/aurora) | **Coach** tab |
| Projects (/projects) | Accessible from **Plan** tab as secondary screen |
| Pillar hubs (/consciousness, /health, etc.) | Accessible from **Plan** tab's Life Analysis chart |
| Header icons (Tasks, Goals, Coaches, Hypnosis, Notifications) | Stay as popovers/modals -- accessible from any tab |
| Sidebar navigation | **Replaced** by bottom tabs on mobile, condensed sidebar on desktop |

## Technical Implementation

### 1. Create `BottomTabBar` component
New file: `src/components/navigation/BottomTabBar.tsx`

- Fixed bottom bar (z-50) with 4 tab buttons
- Active tab indicated by color + filled icon
- Renders only on mobile (`useIsMobile()`)
- Uses `useLocation()` to determine active tab
- Tab routes: `/today`, `/plan`, `/aurora`, `/me`
- Safe-area padding for iOS notch devices
- GlobalChatInput moves **inside** the Coach tab only (not floating globally)

### 2. Create `TopNavBar` component for desktop
New file: `src/components/navigation/TopNavBar.tsx`

- Horizontal top bar replacing the sidebar
- 4 tab links on the left, action icons on the right (Tasks, Goals, Coaches, Hypnosis, Notifications, Account dropdown)
- Slim height (h-14), sticky, with backdrop blur

### 3. Create tab page components

**`src/pages/TodayTab.tsx`** (new)
- Renders: DashboardBannerSlider + NextActionBanner + TodaysHabitsCard + ChecklistsCard
- Focused: "What do I do right now?"
- GlobalChatInput pinned at bottom (Aurora is always accessible)

**`src/pages/PlanTab.tsx`** (new)
- Renders: PlanProgressHero + GoalsCard + LifeAnalysisChart + PlanProgressCard
- Links to: /life-plan, /projects, and pillar hubs from the chart segments
- This is the "big picture" view

**`src/pages/MeTab.tsx`** (new)
- Renders: StatsGrid (gamification), ProfileContent (consolidated profile), LifeAnalysisChart mini view
- Links to: Settings, Community profile, Progress history

### 4. Refactor `DashboardLayout`

- **Mobile**: Remove hamburger sidebar entirely. Replace with `BottomTabBar`. Remove floating GlobalChatInput (it lives in Coach tab or stays pinned but slimmer).
- **Desktop**: Replace sidebar with `TopNavBar`. Main content area becomes full-width. Keep header action icons (Tasks, Goals, etc.) in the top bar.
- The layout becomes a simple shell: TopNavBar/BottomTabBar + content area

### 5. Route changes

```
/dashboard -> redirect to /today
/today     -> TodayTab (new default for logged-in users)
/plan      -> PlanTab
/aurora    -> Aurora (Coach tab, unchanged internally)
/me        -> MeTab
/life-plan -> secondary screen (back button returns to /plan)
/projects  -> secondary screen (back button returns to /plan)
/consciousness, /health, etc. -> secondary screens from /plan
```

### 6. Redirect logic
- `ProtectedRoute` default redirect changes from `/dashboard` to `/today`
- `/dashboard` route redirects to `/today` for backwards compat

### Files to Create
1. `src/components/navigation/BottomTabBar.tsx` -- Mobile bottom tab bar (4 tabs)
2. `src/components/navigation/TopNavBar.tsx` -- Desktop horizontal top nav
3. `src/pages/TodayTab.tsx` -- "What do I do now?" view
4. `src/pages/PlanTab.tsx` -- "Big picture" view
5. `src/pages/MeTab.tsx` -- Profile + stats + progress

### Files to Modify
1. `src/components/dashboard/DashboardLayout.tsx` -- Replace sidebar with tab-based layout
2. `src/components/dashboard/DashboardSidebar.tsx` -- Remove or reduce to desktop-only condensed version
3. `src/App.tsx` -- Add new tab routes, redirect /dashboard to /today
4. `src/pages/UserDashboard.tsx` -- Redirect to /today
5. `src/components/dashboard/UnifiedDashboardView.tsx` -- Split into TodayTab and PlanTab content
6. `src/components/ProtectedRoute.tsx` -- Change default redirect to /today

### What Stays the Same
- All pillar hub pages (/consciousness, /health, etc.) -- they become "drill-down" screens
- Aurora chat internals (AuroraChatArea, hooks, edge functions) -- zero changes
- Header popovers (Tasks, Goals, Notifications) -- move into TopNavBar/BottomTabBar overflow
- Admin/Coach/Affiliate panels -- untouched
- GlobalChatInput -- stays pinned at bottom on all tabs (Aurora is always one tap away)

### Mobile Experience Flow

```
User opens app
  -> /today loads
  -> Sees: "Complete your daily habits (2/5)" with one big action button
  -> Taps action -> habit toggles -> XP animation
  -> Bottom bar: [Today*] [Plan] [Coach] [Me]
  -> Taps "Plan" -> sees 90-day progress, life chart, goals
  -> Taps a pie slice -> drills into /health hub
  -> Back button -> /plan
  -> Taps "Coach" -> full Aurora chat
  -> Taps "Me" -> Level 7, 340 XP, 12-day streak, profile card
```

### Desktop Experience

Same 4 sections but rendered as horizontal tabs in a top nav bar. The sidebar is eliminated. Content takes full width. Action icons (Tasks, Goals, Coaches, Hypnosis, Notifications) sit in the top-right of the nav bar, just like today's header icons.
