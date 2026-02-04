
# Dashboard Redesign Plan: Stats-First Command Center

## Current Problem
The dashboard has multiple disconnected components:
- `TodaysFocusCard` - Shows focus/tasks/streak status (somewhat useful)
- `SmartSuggestionsRow` - Scrollable chips (good concept, poor visibility)  
- `CommandCenterGrid` - 6 generic action cards (navigation, not actionable)
- `ProgressSection` - Two cards with basic progress (too static)
- `CompactSessions` - Scheduled sessions (rarely used)

**Result:** User sees "options" but not **what to do next**. No at-a-glance stats or visual progress.

---

## New Vision: "One-Glance Command Center"

Think of it as a **personal cockpit** that instantly tells the user:
1. **Where they are** (stats/graphs)
2. **What's next** (the single most important action)
3. **How they're doing** (trends over time)

---

## New Component Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  NEXT ACTION BANNER                                          │
│  "🎯 היום: השלם את ההרגל היומי שלך" + [כפתור פעולה]            │
│  Dynamic based on: overdue tasks > habits > hypnosis > plan │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│   LEVEL      │   STREAK     │   WEEKLY XP  │   TOKENS     │
│   Lvl 5      │   🔥 7 days  │   +320 XP    │   💎 45      │
│   [progress] │   [fire anim]│   [+14% ↑]   │              │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  WEEKLY ACTIVITY GRAPH (Recharts Area/Bar)                  │
│  Shows: Hypnosis sessions, Habits completed, Tasks done     │
│  Last 7 days - simple visual trend                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────┐
│  TODAY'S HABITS              │  90-DAY PLAN PROGRESS        │
│  ☑ Morning meditation        │  ████████░░░░ 67% Week 8/12  │
│  ☐ Drink 8 glasses water     │  Current: "שינה איכותית"      │
│  ☐ 20 min exercise           │  [View Full Plan →]          │
│  Progress: 1/3 (33%)         │                              │
└──────────────────────────────┴──────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  QUICK ACTIONS (Minimal - Only 4 Essential)                 │
│  [💬 Aurora] [🧘 Hypnosis] [✅ Missions] [📊 Insights]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

### New Components

```text
src/components/dashboard/v2/
├── NextActionBanner.tsx       # Dynamic priority-based "do this now"
├── StatsGrid.tsx              # 4-stat cards (level, streak, XP, tokens)
├── WeeklyActivityChart.tsx    # Recharts line/area graph
├── TodaysHabitsCard.tsx       # Compact habit checklist with inline toggle
├── PlanProgressCard.tsx       # 90-day plan mini-view
├── QuickActionsBar.tsx        # Minimal 4-button bar
└── index.ts                   # Export all
```

### Data Hooks

```text
src/hooks/
├── useWeeklyActivity.ts       # Aggregate hypnosis, habits, tasks by day
└── useDashboardStats.ts       # Level, XP, streak, tokens in one call
```

### Files to Modify

1. **UserDashboard.tsx** - Replace `UnifiedDashboardView` + `CompactSessions` with new layout
2. **UnifiedDashboardView.tsx** - Complete overhaul with new v2 components

---

## Technical Implementation Details

### 1. NextActionBanner.tsx
**Logic:** Priority-based single action:
```typescript
const priority = [
  { condition: overdueTasks > 0, action: 'complete_task', icon: '⚠️' },
  { condition: !didHypnosisToday, action: 'hypnosis', icon: '🧘' },
  { condition: incompleteHabits > 0, action: 'habits', icon: '✨' },
  { condition: currentMilestone, action: 'milestone', icon: '🎯' },
  { condition: true, action: 'aurora_chat', icon: '💬' }, // fallback
];
```
**UI:** Full-width gradient card with icon, text, and CTA button.

### 2. StatsGrid.tsx
**Data sources:**
- Level/XP: `useGameState()` → `gameState.level`, `gameState.experience`
- Streak: `useGameState()` → `gameState.sessionStreak`
- Tokens: `useGameState()` → `gameState.tokens`
- Weekly XP: Calculate from `xp_events` last 7 days

**UI:** 4 equal cards in grid, each with:
- Large number
- Label
- Micro-animation (XP progress bar, streak fire)

### 3. WeeklyActivityChart.tsx
**Data query:**
```sql
-- Aggregate daily activity for last 7 days
SELECT 
  DATE(created_at) as day,
  COUNT(*) FILTER (WHERE source = 'hypnosis') as hypnosis,
  COUNT(*) FILTER (WHERE source = 'habit') as habits,
  COUNT(*) FILTER (WHERE source = 'task') as tasks
FROM xp_events
WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day
```

**Alternative simpler approach:**
- Fetch from `hypnosis_sessions` (count per day)
- Fetch from `daily_habit_logs` (count per day)
- Merge into chart data

**Chart type:** Stacked area chart or grouped bar (Recharts)

### 4. TodaysHabitsCard.tsx
**Data:** Use existing `useDailyHabits()` hook
**UI:** Compact card with:
- List of habits with checkbox
- Inline toggle (no modal)
- Progress indicator at bottom

### 5. PlanProgressCard.tsx
**Data:** Use existing `ProgressSection` query
**UI:** Simplified:
- Progress bar with percentage
- Current week/milestone title
- "View Plan" link

### 6. QuickActionsBar.tsx
**Actions:** Only 4 essentials:
1. Aurora (chat)
2. Hypnosis
3. Missions (tasks modal)
4. Insights (navigate to /personality or stats)

---

## Mobile-First Layout

```text
Mobile (< 640px):
┌────────────────────┐
│ Next Action Banner │
├────────────────────┤
│ Stats (2x2 grid)   │
├────────────────────┤
│ Weekly Chart       │
├────────────────────┤
│ Today's Habits     │
├────────────────────┤
│ 90-Day Progress    │
├────────────────────┤
│ Quick Actions Bar  │
└────────────────────┘

Desktop (≥ 768px):
┌─────────────────────────────────────┐
│ Next Action Banner                  │
├─────────┬─────────┬────────┬────────┤
│ Level   │ Streak  │ XP     │ Tokens │
├─────────┴─────────┴────────┴────────┤
│ Weekly Activity Chart               │
├──────────────────┬──────────────────┤
│ Today's Habits   │ 90-Day Progress  │
├──────────────────┴──────────────────┤
│ Quick Actions Bar                   │
└─────────────────────────────────────┘
```

---

## Translations Required

New keys for `useTranslation`:
```typescript
{
  'dashboard.v2.nextAction': { he: 'הפעולה הבאה שלך', en: 'Your Next Action' },
  'dashboard.v2.completeNow': { he: 'בצע עכשיו', en: 'Complete Now' },
  'dashboard.v2.weeklyActivity': { he: 'פעילות שבועית', en: 'Weekly Activity' },
  'dashboard.v2.todaysHabits': { he: 'ההרגלים של היום', en: "Today's Habits" },
  'dashboard.v2.planProgress': { he: 'התקדמות בתוכנית', en: 'Plan Progress' },
  'dashboard.v2.weekOf': { he: 'שבוע', en: 'Week' },
  'dashboard.v2.of': { he: 'מתוך', en: 'of' },
  // Stats
  'stats.level': { he: 'רמה', en: 'Level' },
  'stats.streak': { he: 'רצף', en: 'Streak' },
  'stats.weeklyXp': { he: 'XP שבועי', en: 'Weekly XP' },
  'stats.tokens': { he: 'טוקנים', en: 'Tokens' },
}
```

---

## Implementation Order

### Phase 1: Core Components
1. Create `useWeeklyActivity.ts` hook (aggregate data)
2. Create `StatsGrid.tsx` (4 stat cards)
3. Create `NextActionBanner.tsx` (priority logic)
4. Create `WeeklyActivityChart.tsx` (Recharts integration)

### Phase 2: Action Components  
5. Create `TodaysHabitsCard.tsx` (inline toggle)
6. Create `PlanProgressCard.tsx` (compact 90-day view)
7. Create `QuickActionsBar.tsx` (4 buttons)

### Phase 3: Integration
8. Create `DashboardV2.tsx` wrapper component
9. Update `UserDashboard.tsx` to use new layout
10. Remove/deprecate old components (keep for reference)

---

## Key Design Principles

1. **Single Source of Truth:** One banner tells user what to do
2. **Visual First:** Graphs and progress bars over text
3. **Inline Actions:** Toggle habits without modals
4. **Mobile-Optimized:** Touch-friendly, stack on narrow screens
5. **Theme-Aware:** Uses semantic colors (primary, muted, etc.)
6. **RTL Support:** All components respect `isRTL`

---

## Success Metrics

After implementation, user should be able to:
- See their level/streak/XP in 1 second
- Know exactly what to do next in 2 seconds  
- View weekly trend without scrolling
- Complete a habit with 1 tap
- Access any core action in 2 taps max
