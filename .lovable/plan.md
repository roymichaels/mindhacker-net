

# Consolidate Coach Hub: Sidebar-First Client Management

## Current State
The Coach Hub has 5 tabs: **מתאמנים** (Clients), **תוכניות AI** (Plans), **מוצרים** (Products), **שיווק** (Marketing), **הגדרות** (Settings). Three of these should be absorbed into sidebars or contextual views rather than standalone tabs.

## New Architecture

### Right Sidebar becomes the Client Manager
The right sidebar already shows client stats and mini avatars. It will expand to include a **scrollable client list** with clickable rows. Clicking a client opens a **Client Profile Panel** in the main content area, replacing the current tab content temporarily.

```text
Right Sidebar (expanded):
+---------------------------+
| MY CLIENTS         [+ Add]|
| Total: 12 | Active: 8     |
|                           |
| [Search clients...]       |
|                           |
| > Yael Cohen    [Active]  |  <-- clickable
| > Amit Levy     [Active]  |
| > Dana Raz      [Done]    |
| > ...                     |
|                           |
| --- ACTIVITY FEED ---     |
| * New client joined       |
| * Review received         |
|                           |
| --- SESSIONS ---          |
| No sessions scheduled     |
+---------------------------+
```

### Client Profile Panel (main content)
When a client is clicked in the sidebar, the main content area shows their profile with:
- Client info (name, join date, status)
- Their **AI Plan** (auto-generated or manually triggered)
- Session history
- Notes area
- "Generate Plan" button if no plan exists yet

This eliminates both the Clients tab and the AI Plans tab.

### AI Plans: Contextual, Not a Tab
- Plans are tied to individual clients, viewed from their profile panel
- When a new client joins, the system can prompt the coach to generate a plan
- The "Generate Plan" dialog (already built in CoachPlansTab) moves into the client profile panel
- Existing plans are displayed inline with Markdown rendering

### Products: Moved to Storefront Route
Products and services are part of the storefront, not the coach management hub. The "חנות" (Store) quick action in the left sidebar already links to `/p/:slug`. Products management will be accessible from the Settings tab under a "Products" sub-section, or directly on the storefront management page.

### Remaining Tabs
After consolidation, only **2 tabs** remain in the main content:
1. **שיווק** (Marketing) -- reviews, testimonials
2. **הגדרות** (Settings) -- storefront config (with products management added as a sub-tab)

When no client is selected, the main area defaults to Marketing. When a client is clicked in the sidebar, the main area swaps to show their profile.

## Changes

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/coach/CoachActivitySidebar.tsx` | Add full scrollable client list with search, clickable rows that emit a `selectedClientId` callback, "Add Client" button at top |
| `src/pages/CoachHub.tsx` | Remove `clients`, `plans`, `products` tabs. Add state for `selectedClientId`. When set, render `ClientProfilePanel` instead of tab content. Default to Marketing tab. |
| `src/components/coach/CoachSettingsTab.tsx` | Add a "Products & Services" sub-tab incorporating the content from CoachProductsTab |
| `src/pages/Coaches.tsx` | Pass `selectedClientId` / `setSelectedClientId` through sidebar props |
| `src/components/coach/CoachesLayoutWrapper.tsx` | Wire the client selection state between sidebar and main content |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/coach/ClientProfilePanel.tsx` | Full client profile view with AI plan display, generate button, session history, notes |

### Files to Remove (code absorbed elsewhere)

| File | Absorbed Into |
|------|--------------|
| `src/components/coach/CoachClientsTab.tsx` | Right sidebar (client list) + ClientProfilePanel (detail view) |
| `src/components/coach/CoachPlansTab.tsx` | ClientProfilePanel (AI plan section) |
| `src/components/coach/CoachProductsTab.tsx` | CoachSettingsTab (new Products sub-tab) |

## State Flow

```text
CoachesLayoutWrapper
  |-- manages: selectedClientId state
  |
  |-- CoachHudSidebar (left) -- unchanged
  |
  |-- CoachHub (main content)
  |     |-- if selectedClientId: <ClientProfilePanel />
  |     |-- else: PillTabNav [Marketing | Settings]
  |
  |-- CoachActivitySidebar (right)
        |-- Client list (clickable)
        |-- onSelectClient -> sets selectedClientId
        |-- Activity feed
        |-- Sessions
```

## Client Profile Panel Layout

```text
+------------------------------------------------+
| <- Back to Hub          [Client Name]  [Status] |
|                                                 |
| +-- Client Info Card --+  +-- AI Plan --------+ |
| | Joined: Jan 2025     |  | [Generate Plan]   | |
| | Status: Active       |  | or                | |
| | Sessions: 4          |  | Plan content      | |
| +----------------------+  | (Markdown render) | |
|                           +-------------------+ |
| +-- Notes ---------------------------------+    |
| | Coach notes for this client...           |    |
| +------------------------------------------+    |
+------------------------------------------------+
```

## Key Behaviors
- Clicking a client in the sidebar highlights them and shows their profile in main content
- Clicking "Back" or deselecting returns to the tab view (Marketing/Settings)
- "Generate Plan" opens the same dialog from the old CoachPlansTab but pre-fills the client name
- The collapsed sidebar still shows client avatar dots (existing behavior)
- Products are accessible via Settings > Products sub-tab or via the storefront link

