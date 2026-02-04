
# Plan: Dashboard Optimization - Command Center

## Current State Analysis

The dashboard currently has:
1. **Sidebar** (left): Character HUD + Search + Navigation (Dashboard, Personality, Business)
2. **Main Area**: Welcome message + Quick Access Grid (Tasks, Personality, Business, PDF, Focus) + Sessions
3. **Right Panel** (hidden on most pages): Courses, Recordings, Sessions, Affiliate
4. **Bottom**: Global Aurora Chat

### Issues Identified:
- Quick Access Grid duplicates sidebar navigation (Personality, Business links)
- Sessions are buried at the bottom
- No clear "next action" or daily priority system
- Limited visibility of user progress and achievements
- PDF download is low-value prime real estate
- Missing quick access to hypnosis sessions
- No unified view of "what should I do today"

## Proposed Dashboard Architecture

### Design Philosophy
Transform the dashboard into an **Action-Oriented Command Center** with three zones:

```text
+------------------+--------------------------------+
|                  |        TODAY'S FOCUS           |
|    SIDEBAR       +--------------------------------+
|                  |                                |
|  - HUD           |     QUICK ACTIONS GRID         |
|  - Search        |     (4-6 primary actions)      |
|  - Nav           +--------------------------------+
|                  |                                |
|                  |     PROGRESS & INSIGHTS        |
|                  |     (2 columns on desktop)     |
|                  |                                |
+------------------+--------------------------------+
|           AURORA CHAT INPUT (sticky)              |
+---------------------------------------------------+
```

## Detailed Changes

### 1. Today's Focus Card (NEW - Top Priority)

A dynamic card at the very top showing:
- **If has active focus plan**: Show focus title + days remaining + progress
- **If has uncompleted daily tasks**: "You have X tasks today"
- **If on a streak**: Motivational streak message
- **If idle**: Suggestion to start hypnosis or chat with Aurora

This replaces the generic "Welcome back" message.

### 2. Redesigned Quick Actions Grid

Replace current grid with **6 action-oriented cards** in 2 rows:

**Row 1 - Primary Actions:**
| Aurora Chat | Hypnosis | My Tasks |
|-------------|----------|----------|
| Direct chat | Quick session | Today's tasks |

**Row 2 - Progress & Tools:**
| 90-Day Plan | Launchpad | More Tools |
|-------------|-----------|------------|
| View progress | Edit journey | Dropdown with PDF, Settings |

Remove Personality/Business from quick actions (already in sidebar nav).

### 3. Progress & Insights Section (2 Columns)

**Column 1 - Active Progress:**
- **90-Day Plan Mini-Card**: Current week, completion %, next milestone
- **Streak & Achievements**: Visual streak counter, recent achievements

**Column 2 - Scheduled & Upcoming:**
- **Upcoming Sessions**: Next hypnosis or coaching sessions
- **Weekly Suggestions**: AI-generated tasks/suggestions from Aurora

### 4. Smart Suggestions Row (AI-Powered)

A horizontal scrollable row of contextual suggestions:
- "Complete your evening anchors"
- "You're 2 days from a 7-day streak!"
- "Time for your focus session"
- "Finish Week 4 to unlock rewards"

### 5. Sidebar Enhancements

Keep the Character HUD and add:
- **Daily Streak Flame** indicator (always visible)
- **Notification badge** on navigation items (e.g., "3 tasks")

### 6. Remove Duplications

- Remove Personality & Business from QuickAccessGrid (in sidebar)
- Remove PDF from main grid (move to "More Tools" dropdown)
- Keep Sessions compact at bottom OR integrate into main grid

## Files to Modify

### Modify:
1. `src/pages/UserDashboard.tsx` - Restructure layout
2. `src/components/dashboard/UnifiedDashboardView.tsx` - New section structure
3. `src/components/dashboard/QuickAccessGrid.tsx` - Redesign with 6 action cards

### Create:
1. `src/components/dashboard/TodaysFocusCard.tsx` - Dynamic focus display
2. `src/components/dashboard/ProgressSection.tsx` - 2-column progress view
3. `src/components/dashboard/SmartSuggestionsRow.tsx` - AI suggestions carousel
4. `src/components/dashboard/QuickActionsCard.tsx` - New card component

## New Component Details

### TodaysFocusCard.tsx
```tsx
// Shows contextual "What's important today" based on:
// - Active focus plan
// - Pending tasks count
// - Current streak
// - Time of day (morning/evening anchors)
```

### SmartSuggestionsRow.tsx
```tsx
// Horizontal scroll of action chips:
// - Pulls from useSmartSuggestions hook (already exists)
// - Each chip is clickable and triggers the action
```

### ProgressSection.tsx
```tsx
// Two-column layout:
// Left: 90-day progress mini-view + streak visual
// Right: Upcoming sessions + next steps
```

## Implementation Order

1. **Phase 1: TodaysFocusCard**
   - Create new component
   - Replace welcome message
   - Test with various user states

2. **Phase 2: QuickActionsGrid Redesign**
   - Update to 6-card layout
   - Remove duplicate nav items
   - Add "More Tools" dropdown

3. **Phase 3: ProgressSection**
   - Create 2-column layout
   - Integrate 90-day mini view
   - Add streak visualization

4. **Phase 4: SmartSuggestions**
   - Create horizontal scroll component
   - Connect to useSmartSuggestions
   - Style as action chips

5. **Phase 5: Final Polish**
   - Mobile optimization
   - Animation polish
   - Test all flows

## Mobile Considerations

- TodaysFocusCard: Full width, compact
- QuickActionsGrid: 2x3 grid (smaller cards)
- ProgressSection: Stack vertically
- SmartSuggestions: Horizontal swipe

## Visual Preview

```text
+----------------------------------------+
|  TODAY'S FOCUS                    [→]  |
|  🎯 "Productivity Mode" - Day 5 of 14  |
|  ████████░░░░░░░ 35%                   |
+----------------------------------------+

+------------+ +------------+ +------------+
| 💬 Aurora  | | 🧘 Hypnosis| | ✅ Tasks   |
| Chat now   | | Start      | | 3 pending  |
+------------+ +------------+ +------------+
+------------+ +------------+ +------------+
| 📋 90-Day  | | 🚀 Journey | | ⚙️ More    |
| Week 4/12  | | Edit       | | Tools ▼    |
+------------+ +------------+ +------------+

+-------------------+ +-------------------+
| 📈 PROGRESS       | | 📅 UPCOMING       |
|                   | |                   |
| Week 4 of 12      | | Tomorrow 10:00    |
| ████░░░░ 33%      | | Coaching Session  |
|                   | |                   |
| 🔥 5-day streak   | | Friday 18:00      |
|                   | | Hypnosis Session  |
+-------------------+ +-------------------+

→ Complete evening anchors | Start focus | +3 to 7-day streak! →

+----------------------------------------+
|  💬 Ask Aurora anything...        [→]  |
+----------------------------------------+
```

## Translation Keys to Add

```json
{
  "dashboard.todaysFocus": "המיקוד של היום / Today's Focus",
  "dashboard.noFocusSet": "לא הוגדר מיקוד / No focus set",
  "dashboard.startSession": "התחל סשן / Start Session",
  "dashboard.viewPlan": "צפה בתוכנית / View Plan",
  "dashboard.moreTools": "כלים נוספים / More Tools",
  "dashboard.progress": "התקדמות / Progress",
  "dashboard.upcoming": "קרוב / Upcoming",
  "dashboard.suggestions": "הצעות / Suggestions"
}
```
