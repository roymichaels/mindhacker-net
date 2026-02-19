

# Admin Hub: Sidebar-Driven Architecture (Like Coaches & Dashboard)

## The Problem
The Admin page currently renders its navigation (6 pill tabs + sub-tabs) inline in the main content area, while Dashboard and Coaches both use the sidebar-driven pattern. This creates visual clutter and inconsistency -- the HeroBanner, pill tabs, sub-tabs, AND the content all compete for space in the center column.

## The Solution
Move all admin navigation into sidebars, matching the Coach and Dashboard pattern exactly:

```text
+------------------+-----------------------------+------------------+
|  AdminHudSidebar |     Main Content Area       | AdminActivity    |
|  (LEFT)          |  (active sub-page only,     |  Sidebar (RIGHT) |
|                  |   clean & focused)          |                  |
|  - Overview      |                             |  - Stats cards   |
|    > Dashboard   |   e.g. Users page renders   |  - Notifications |
|    > Analytics   |   here without any extra    |  - Quick actions  |
|    > Notifications|  nav chrome                |  - Recent activity|
|  - Admin         |                             |                  |
|    > Users       |                             |                  |
|    > Roles       |                             |                  |
|  - Campaigns     |                             |                  |
|  - Content       |                             |                  |
|  - Site          |                             |                  |
|  - System        |                             |                  |
+------------------+-----------------------------+------------------+
```

## What Changes

### 1. Create `AdminHudSidebar` (Left Sidebar)
**File**: `src/components/admin/AdminHudSidebar.tsx`

Same glassmorphic collapsible pattern as `CoachHudSidebar`:
- **Collapsed**: Show icons for the 6 main categories (Overview, Admin, Campaigns, Content, Site, System)
- **Expanded**: Show category groups with expandable sub-items (Dashboard, Analytics, Users, Roles, etc.)
- Active item highlighted with emerald gradient (matching admin theme)
- Emerald/teal color scheme instead of purple/indigo
- "Control Center" header badge (like Coach Hub has "Coach Hub")
- NotificationBell integrated into sidebar header

Navigation is driven by `ADMIN_TABS` from `src/domain/admin/tabConfig.ts` -- no duplication.

### 2. Create `AdminActivitySidebar` (Right Sidebar)
**File**: `src/components/admin/AdminActivitySidebar.tsx`

Same collapsible pattern as `CoachActivitySidebar` / `RoadmapSidebar`:
- **Stats cards**: Total users, unread notifications, new leads, purchases (pulled from the same query `PanelDashboard` uses)
- **Recent activity feed**: Latest admin notifications
- **Quick action buttons**: Jump to Users, Products, Analytics (replacing the current PanelDashboard quick-action cards)
- Emerald/teal color scheme

### 3. Create `AdminLayoutWrapper`
**File**: `src/components/admin/AdminLayoutWrapper.tsx`

Follows the exact `CoachesLayoutWrapper` pattern:
- Manages `activeTab` and `activeSubTab` state
- Creates `AdminHudSidebar` and `AdminActivitySidebar` with the right props
- Passes them as `leftSidebar` / `rightSidebar` to `DashboardLayout`
- Renders `AdminHub` as children with the active sub-tab info

### 4. Simplify `AdminHub.tsx`
Remove from `AdminHub`:
- HeroBanner (admin identity moves to left sidebar header)
- PillTabNav (moved to left sidebar)
- SubTabNav (moved to left sidebar sub-items)
- All nav logic (managed by wrapper)

`AdminHub` becomes a thin shell that receives `activeTab` + `activeSubTab` as props and renders only the active sub-page component via Suspense. Exactly like `CoachHub`.

### 5. Update Route in `App.tsx`
Change the `/admin-hub` route from:
```
<DashboardLayout>
  <AdminHub />
</DashboardLayout>
```
To:
```
<AdminLayoutWrapper />
```
(which internally wraps `DashboardLayout` with admin-specific sidebars)

### 6. Update `PanelDashboard.tsx`
Remove the "Quick Actions" cards section (those links now live in the right sidebar). Keep the welcome message and stats overview cards as the clean dashboard content.

## Technical Details

### Files Created
| File | Purpose |
|------|---------|
| `src/components/admin/AdminHudSidebar.tsx` | Left sidebar with tab/sub-tab navigation |
| `src/components/admin/AdminActivitySidebar.tsx` | Right sidebar with stats + activity |
| `src/components/admin/AdminLayoutWrapper.tsx` | Wrapper passing sidebars to DashboardLayout |

### Files Modified
| File | Change |
|------|--------|
| `src/pages/AdminHub.tsx` | Remove HeroBanner, PillTabNav, SubTabNav; accept tab/sub props |
| `src/App.tsx` | Use `AdminLayoutWrapper` instead of inline `DashboardLayout + AdminHub` |
| `src/components/panel/PanelDashboard.tsx` | Remove quick-action cards (now in sidebar) |

### No Changes To
- Database / RLS
- `src/domain/admin/tabConfig.ts` (sidebar reads from it)
- Any admin sub-pages (`src/pages/admin/*.tsx`)
- Routes or URLs
- Translations

### Color Theme
- Emerald-500 / Teal-600 gradient (matching existing admin identity)
- `border-emerald-500/30`, `bg-emerald-500/15`, `text-emerald-400`

