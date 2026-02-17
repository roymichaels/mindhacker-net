

# Phase 3: UX Polish -- Consistent Header, Dedupe Dashboards, Aurora Dock States

## Summary of Current State

**Duplicate dashboards:** `UnifiedDashboardView` (src/components/dashboard/UnifiedDashboardView.tsx) is a legacy superset -- it renders StatsGrid, PlanProgressHero, GoalsCard, etc. all in one view. It is only used inside `DashboardModal` (opened by Aurora's `openDashboard()` command). Meanwhile, the actual tabs (`TodayTab`, `PlanTab`, `MeTab`) are the real UI. Decision: **v2 components are the winners. UnifiedDashboardView is legacy.**

**QuickActionsBar:** Exported from v2/index.ts but imported by nobody. Dead code.

**Aurora Dock:** Currently has 2 states: collapsed (just the input bar) and expanded (chat bubbles appear). There is no "minimized orb" state. The dock is always visible as a full-width input bar on non-Aurora tabs.

**Header:** Mobile and desktop headers are embedded directly in `DashboardLayout.tsx` with inline icon buttons (Tasks, Goals, Coaches, Hypnosis, Notifications). No shared "primary action" concept.

---

## Changes

### 1. Delete Dead Code

| File | Action |
|------|--------|
| `src/components/dashboard/v2/QuickActionsBar.tsx` | Delete |
| `src/components/dashboard/v2/index.ts` | Remove QuickActionsBar export |
| `src/components/dashboard/UnifiedDashboardView.tsx` | Delete |
| `src/components/dashboard/DashboardModal.tsx` | Simplify to just ProfileContent (no more dashboard view inside a modal inside the app) |
| `src/contexts/AuroraActionsContext.tsx` | Remove `openDashboard`/`closeDashboard`/`dashboardModalOpen`/`dashboardInitialView` -- the dashboard IS the app now, not a modal |

### 2. Aurora Dock: 3 States

Refactor `GlobalChatInput` + `AuroraChatBubbles` interaction in `DashboardLayout` into a single `AuroraDock` component with 3 explicit states:

| State | Trigger | UI |
|-------|---------|-----|
| **Minimized** (orb) | Default on page load, tap X on peek | Small floating orb button (bottom-right on desktop, bottom-center above tab bar on mobile). Shows unread indicator dot if Aurora has unsent nudges. |
| **Peek** (input bar) | Tap orb, or type starts | Current GlobalChatInput appears. If there are recent messages, AuroraChatBubbles shows last 2-3 inline above input. |
| **Full chat** | Tap "expand" icon on peek header, or navigate to /aurora tab | Navigate to /aurora tab (full AuroraChatArea). On /aurora tab, dock is hidden entirely. |

State management lives in `AuroraChatContext` (already has `isChatExpanded`; add `dockState: 'orb' | 'peek' | 'full'`).

New file: `src/components/aurora/AuroraDock.tsx` -- composes the orb, GlobalChatInput, and AuroraChatBubbles based on state.

### 3. Consistent Header

Create a shared `HeaderActions` component used by both mobile and desktop headers in DashboardLayout:

```text
src/components/navigation/HeaderActions.tsx

Props: compact (boolean, for mobile sizing)

Renders (in order):
  - TasksPopover
  - GoalsPopover  
  - CoachesButton (pink circle, opens practitioners modal)
  - PowerUpButton (violet circle, opens hypnosis modal)
  - NotificationBell

Mobile: Same icons, same order, compact sizing (h-8 w-8)
Desktop: Same icons, same order, standard sizing (h-9 w-9)
```

This replaces the duplicated inline icon buttons in both mobile header and TopNavBar's right section.

### 4. Suggestion Tap Behavior

In `AuroraWelcome.tsx` (and any smart suggestion chips), when user taps a suggestion:
- Parse it through `parseAllTags` from the command bus
- If it produces commands and all are `safe` risk: execute immediately via `dispatchCommands`, show receipt toast
- If it produces `moderate`/`destructive` commands: send as chat message (current behavior, Aurora will respond with confirmation cards)
- If no tags detected (plain text suggestion): send as chat message (current behavior)

This leverages the Phase 2 command bus directly -- no new infrastructure needed.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/aurora/AuroraDock.tsx` | Unified 3-state dock (orb/peek/full) |
| `src/components/navigation/HeaderActions.tsx` | Shared header action icons |

## Files Modified

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardLayout.tsx` | Replace inline header icons with HeaderActions; replace GlobalChatInput+AuroraChatBubbles with AuroraDock |
| `src/components/navigation/TopNavBar.tsx` | Replace inline right-side icons with HeaderActions |
| `src/contexts/AuroraChatContext.tsx` | Add `dockState` to context (orb/peek/full) |
| `src/contexts/AuroraActionsContext.tsx` | Remove dashboard modal state (openDashboard, etc.) |
| `src/components/dashboard/DashboardModal.tsx` | Remove UnifiedDashboardView, keep only profile view |
| `src/components/dashboard/v2/index.ts` | Remove QuickActionsBar export |
| `src/components/aurora/AuroraWelcome.tsx` | Add command bus integration for suggestion taps |

## Files Deleted

| File | Reason |
|------|--------|
| `src/components/dashboard/v2/QuickActionsBar.tsx` | Dead code, never imported |
| `src/components/dashboard/UnifiedDashboardView.tsx` | Legacy superset, replaced by tab pages |

## What Does NOT Change

- `TodayTab.tsx`, `PlanTab.tsx`, `MeTab.tsx`, `Aurora.tsx` -- tab content unchanged
- `BottomTabBar.tsx` -- 4-tab nav unchanged
- `AuroraChatArea.tsx`, `AuroraChatBubbles.tsx`, `GlobalChatInput.tsx` -- internal logic unchanged, just composed differently by AuroraDock
- Command bus (`commandBus.ts`, `useCommandBus.tsx`) -- used as-is
- All v2 dashboard cards -- unchanged
- Database / Edge functions -- no backend changes

