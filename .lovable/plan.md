

# Coach Pro: Unified In-Tab Experience

## Overview

Transform the "מאמנים" (Coaches) tab from a static landing page into a **dual-purpose view**:
- **Non-coaches** see the current landing/enrollment page (no change)
- **Active coaches** see their full Coach Panel directly inside the tab -- no more navigating to a separate `/coach` route

This eliminates the context switch between the main app and the coach panel, making coaching tools feel native to the platform rather than a separate admin area.

## Current Problems
1. The Coach Panel lives at `/coach` -- a completely separate layout with its own sidebar, header, and navigation. Coaches must leave their dashboard to manage their business.
2. Many panel pages are placeholder stubs (MyServices, MyCalendar, MyEarnings) with no real functionality.
3. The AI Plan Builder UI is minimal -- just a name + textarea, no rich plan viewing.
4. The `/coaches` landing page shows the same content to coaches who are already subscribed.

## Architecture

The `/coaches` route will conditionally render based on the user's practitioner status:

```text
/coaches route
  |
  +-- User has practitioner role?
  |     YES --> CoachHub (tabbed panel inside DashboardLayout)
  |     NO  --> Current landing page (Coaches.tsx)
```

### Phase 1: Embed Coach Panel in the Coaches Tab

**What changes:**
- Create a new `CoachHub.tsx` component that replaces the full-page CoachPanel with a tabbed interface that fits inside `DashboardLayout`
- The hub uses horizontal tabs (not a sidebar) for navigation: **Dashboard, Clients, Plans, Services, Content, Settings**
- Update `/coaches` route to conditionally render `CoachHub` for practitioners or the landing page for non-practitioners
- Remove or redirect the standalone `/coach/*` routes to `/coaches` for practitioners

**Tabs inside CoachHub:**
1. **Dashboard** -- Overview stats (clients, sessions, earnings, satisfaction) + quick actions
2. **Clients** -- Full client management (existing MyClients + add client flow)
3. **AI Plans** -- AI Plan Builder with rich plan viewer (markdown rendering instead of raw JSON)
4. **Products** -- Services, courses, and digital products management
5. **Marketing** -- Testimonials, reviews, leads, newsletter (consolidated)
6. **Settings** -- Profile, storefront, theme, domain (consolidated)

### Phase 2: Upgrade Stub Pages to Real Functionality

**Clients page improvements:**
- Add "Invite Client" flow: generate a unique invite link the coach can share
- Client search and filtering
- Quick-action buttons that actually work (send message, schedule session)

**AI Plan Builder improvements:**
- Add coaching niche and methodology context (auto-populated from coach profile)
- Rich plan viewer with collapsible phases, session cards, and progress tracking
- Render plan_data as structured cards instead of raw JSON/pre blocks
- Add "Duplicate Plan" and "Edit Plan" actions
- Client background field in the generation dialog

**Services page:**
- Create/edit service form (title, description, price, duration, type)
- Toggle active/inactive
- Drag-to-reorder

**Earnings page:**
- Connect to actual purchase/payment data from `practitioner_clients` and any payment records
- Show real revenue charts instead of hardcoded zeros

### Phase 3: Polish and Edge Cases

- Smooth tab transitions with preserved scroll position
- Mobile: tabs become a horizontal scrollable strip
- "View Storefront" button accessible from the hub header
- Deep-linking support: `/coaches?tab=clients` 
- Keep `/coach` routes working as redirects to `/coaches?tab=...` for backward compatibility

## Technical Details

### New/Modified Files

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/CoachHub.tsx` | Create | Main tabbed coach interface inside DashboardLayout |
| `src/pages/Coaches.tsx` | Modify | Conditionally render CoachHub vs landing page |
| `src/App.tsx` | Modify | Update routing -- `/coaches` handles both views, `/coach/*` redirects |
| `src/components/coach/CoachDashboardTab.tsx` | Create | Dashboard overview tab content |
| `src/components/coach/CoachClientsTab.tsx` | Create | Clients management tab (refactored from MyClients) |
| `src/components/coach/CoachPlansTab.tsx` | Create | Enhanced AI Plans tab with rich viewer |
| `src/components/coach/CoachProductsTab.tsx` | Create | Consolidated products/services tab |
| `src/components/coach/CoachMarketingTab.tsx` | Create | Consolidated marketing tools |
| `src/components/coach/CoachSettingsTab.tsx` | Create | Consolidated settings |
| `src/components/coach/PlanCard.tsx` | Create | Rich plan rendering component |

### Routing Changes
- `/coaches` -- dual-purpose (landing or hub)
- `/coach` -- redirect to `/coaches`
- `/coach/clients` -- redirect to `/coaches?tab=clients`
- All other `/coach/*` sub-routes follow the same redirect pattern

### No Database Changes Required
All existing tables (`practitioner_clients`, `coach_client_plans`, `practitioner_services`, `practitioner_settings`, `content_products`) already support the needed functionality. The edge function `generate-coach-plan` is already deployed and working.

