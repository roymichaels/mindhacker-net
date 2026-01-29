
# Unified Life Model + Gamification Dashboard

## Overview

Create a **single unified dashboard** that combines:
1. **Aurora Life Model** - Life direction, values, focus plans, daily anchors, insights
2. **Libero Gamification** - Levels, XP, streaks, tokens, ego states, achievements

This replaces the separate `AuroraDashboardView` with a holistic view that shows all user transformation data in one place.

---

## Current State Analysis

### What We Have (Scattered)

| Component | Location | Data |
|-----------|----------|------|
| `AuroraDashboardView` | Modal only | Life Model (direction, focus, values, energy patterns) |
| `GameStatsCard` | Not integrated | Level, XP, Streak, Tokens, Ego State |
| `LevelProgress` | Standalone | XP bar visualization |
| `StreakCounter` | Standalone | Flame + day count |
| `TokenBalance` | Standalone | Coin icon + balance |
| `WeeklyProgressCard` | User Dashboard | Sessions, chats, insights, XP |
| `LifeDirectionCard` | User Dashboard | Life direction quote + clarity |
| `DailyAnchorsCard` | User Dashboard | Daily minimum checkboxes |
| `RecentInsightsCard` | User Dashboard | Identity elements list |

### Target State

A **single `UnifiedDashboardView`** component that can be used:
1. Inside the Aurora sidebar as a panel/modal
2. In the main user dashboard page (`/dashboard`)
3. Anywhere else needed

---

## Implementation Plan

### Phase 1: Create Unified Dashboard Component

**New File: `src/components/dashboard/UnifiedDashboardView.tsx`**

A comprehensive dashboard that merges all data sources:

```text
+----------------------------------------------------------+
|  HEADER: Avatar + Name + Level Badge                     |
|  XP Progress Bar (full width)                            |
+----------------------------------------------------------+
|  STATS ROW:                                              |
|  [Streak: 7 days] [Tokens: 125] [Sessions: 42]           |
+----------------------------------------------------------+
|  LIFE DIRECTION CARD (highlighted)                       |
|  "Your purpose..." with clarity score                    |
+----------------------------------------------------------+
|  2-COLUMN GRID:                                          |
|  +---------------------------+---------------------------+|
|  | Current Focus             | Weekly Progress          ||
|  | Active plan with days     | Sessions, Chats, XP      ||
|  +---------------------------+---------------------------+|
|  | Daily Anchors             | Identity Profile         ||
|  | Checkbox list             | Values, Principles       ||
|  +---------------------------+---------------------------+|
+----------------------------------------------------------+
|  RECENT INSIGHTS (horizontal scroll or list)             |
+----------------------------------------------------------+
|  ACHIEVEMENTS (unlocked badges, compact)                 |
+----------------------------------------------------------+
```

### Phase 2: Create Unified Hook

**New File: `src/hooks/useUnifiedDashboard.ts`**

Combines data from:
- `useGameState()` - Level, XP, streak, tokens, ego state
- `useLifeModel()` - Life direction, focus plans, daily minimums, patterns
- `useDashboard()` - Identity elements, visions, commitments
- `useOnboardingProgress()` - Progress tracking

Returns a single object with all computed values.

### Phase 3: Create Sub-Components

**New Files in `src/components/dashboard/unified/`:**

1. **`StatsBar.tsx`** - Horizontal bar with Streak, Tokens, Sessions, Level
2. **`LifeDirectionHighlight.tsx`** - Prominent life direction card with clarity
3. **`CurrentFocusCard.tsx`** - Active focus plan with progress
4. **`IdentityProfileCard.tsx`** - Values, principles, self-concepts
5. **`AchievementsBadges.tsx`** - Compact unlocked achievements display

### Phase 4: Update Aurora Dashboard Modal

**Update: `src/components/aurora/AuroraDashboardModal.tsx`**

Replace `AuroraDashboardView` with `UnifiedDashboardView` to show the full unified data.

### Phase 5: Simplify User Dashboard Page

**Update: `src/pages/UserDashboard.tsx`**

Replace the 4 separate cards (LifeDirection, Weekly, DailyAnchors, Insights) with the unified `UnifiedDashboardView` component for a consistent experience.

---

## Component Details

### StatsBar Component

```tsx
// Horizontal stats display
<div className="flex items-center justify-between p-4 glass-card">
  <div className="flex items-center gap-2">
    <Flame className="text-orange-500" />
    <span className="font-bold">7</span>
    <span className="text-muted-foreground text-sm">days</span>
  </div>
  <div className="flex items-center gap-2">
    <Coins className="text-amber-500" />
    <span className="font-bold">125</span>
  </div>
  <div className="flex items-center gap-2">
    <Target className="text-purple-500" />
    <span className="font-bold">42</span>
    <span className="text-muted-foreground text-sm">sessions</span>
  </div>
  <div className="flex items-center gap-2">
    <span className="font-bold">Lv. 8</span>
  </div>
</div>
```

### XP Progress Section

Full-width XP bar with level indication and XP numbers:

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="flex items-center gap-2">
      <span className="text-2xl">🏆</span>
      <span className="font-bold">Level {level}</span>
    </span>
    <span className="text-muted-foreground">{current}/{required} XP</span>
  </div>
  <Progress value={percentage} className="h-3" />
</div>
```

### Active Ego State Display

Show current ego state with icon and colors:

```tsx
<div className="flex items-center gap-3 p-3 rounded-lg" 
     style={{ background: `linear-gradient(135deg, ${ego.colors.primary}20, ${ego.colors.secondary}20)` }}>
  <span className="text-2xl">{ego.icon}</span>
  <div>
    <p className="font-medium">{ego.name}</p>
    <p className="text-xs text-muted-foreground">Active Ego State</p>
  </div>
</div>
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/dashboard/UnifiedDashboardView.tsx` | **CREATE** | Main unified dashboard component |
| `src/hooks/useUnifiedDashboard.ts` | **CREATE** | Combined data hook |
| `src/components/dashboard/unified/StatsBar.tsx` | **CREATE** | Horizontal stats (streak, tokens, etc.) |
| `src/components/dashboard/unified/XpProgressSection.tsx` | **CREATE** | Level + XP bar |
| `src/components/dashboard/unified/EgoStateDisplay.tsx` | **CREATE** | Current ego state card |
| `src/components/dashboard/unified/AchievementsBadges.tsx` | **CREATE** | Compact achievements |
| `src/components/aurora/AuroraDashboardModal.tsx` | **UPDATE** | Use UnifiedDashboardView |
| `src/pages/UserDashboard.tsx` | **UPDATE** | Simplify to use unified view |
| `src/i18n/translations/en.ts` | **UPDATE** | Add new translation keys |
| `src/i18n/translations/he.ts` | **UPDATE** | Add Hebrew translations |

---

## New Translation Keys

```typescript
unified: {
  dashboard: {
    title: "Your Journey",
    statsBar: {
      streak: "Streak",
      tokens: "Tokens", 
      sessions: "Sessions",
      level: "Level",
    },
    xpProgress: "Experience Progress",
    egoState: "Active Ego State",
    achievements: "Achievements",
    viewAll: "View All",
    noAchievements: "Complete activities to earn achievements",
    // Hebrew
    title_he: "המסע שלך",
    ...
  }
}
```

---

## Data Flow

```text
┌─────────────────────────────────────────────────────────┐
│                   useUnifiedDashboard()                 │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ useGameState │  │ useLifeModel │  │ useDashboard │  │
│  │ - level      │  │ - direction  │  │ - values     │  │
│  │ - xp         │  │ - focus      │  │ - principles │  │
│  │ - streak     │  │ - minimums   │  │ - visions    │  │
│  │ - tokens     │  │ - patterns   │  │ - commits    │  │
│  │ - egoState   │  └──────────────┘  └──────────────┘  │
│  │ - sessions   │                                       │
│  └──────────────┘  ┌──────────────────────────────────┐ │
│                    │  useOnboardingProgress           │ │
│                    │  - progressPercentage            │ │
│                    │  - hasDirection, hasIdentity     │ │
│                    └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  UnifiedDashboardView   │
              │  - StatsBar             │
              │  - XpProgressSection    │
              │  - EgoStateDisplay      │
              │  - LifeDirectionCard    │
              │  - CurrentFocusCard     │
              │  - DailyAnchorsCard     │
              │  - IdentityProfileCard  │
              │  - InsightsList         │
              │  - AchievementsBadges   │
              └─────────────────────────┘
```

---

## Technical Notes

1. **RTL Support**: All components inherit `isRTL` from translation hook and apply proper text alignment and layout flipping.

2. **Loading States**: Show skeleton placeholders while data loads from multiple sources.

3. **Empty States**: Display encouraging messages when sections are empty (e.g., "Start a hypnosis session to earn XP").

4. **Responsive Design**:
   - Desktop: 2-column grid for cards
   - Tablet: 2-column with smaller gaps
   - Mobile: Single column stack

5. **Animation**: Subtle entrance animations using Framer Motion for cards appearing.

6. **Gamification Context**: Ensure `GameStateProvider` wraps the dashboard for access to game state.

---

## Summary

This plan creates a **unified dashboard** that brings together:
- Level, XP, and progression from Libero gamification
- Life Model insights from Aurora coaching
- Streak and token economy
- Ego state personality system
- Achievements and milestones

The result is a single, cohesive view of the user's transformation journey that can be accessed from Aurora or the main dashboard.
