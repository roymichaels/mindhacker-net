## Goal

Make the AION chat the home base of the app. Tapping any of the four bottom tabs (Free Market, MindOS, Community, Study) opens that hub as a 100% width × 100% height modal overlay on top of the chat instead of navigating to a separate page. Closing the modal returns the user to the chat.

## What changes

### 1. AION chat becomes the main page
- Logged-in users land on the AION chat surface (today this is `AIONPage` at `/mindos/chat`).
- Update the post-login redirect in `src/pages/Index.tsx` from `/mindos/tactics` → `/mindos/chat`.
- Update legacy `Navigate` redirects in `src/App.tsx` (`/now`, `/plan`, `/play`, `/profile`, `/mindos` index) to point to `/mindos/chat`.
- The AION chat page becomes the persistent backdrop — bottom tabs no longer take you away from it.

### 2. Bottom tabs become full-screen modal triggers
- Replace navigation in `src/components/navigation/BottomTabBar.tsx`. Tapping a tab no longer calls `navigate(tab.path)`; instead it opens a global fullscreen modal for that hub.
- Introduce a single `HubModalContext` (`src/contexts/HubModalContext.tsx`) exposing `{ activeHub, openHub(hubId), closeHub() }`. `hubId` is one of `'fm' | 'mindos' | 'community' | 'study'`.
- Provider mounted in `DashboardLayout` (or AppShell) so it's available everywhere the bottom bar lives.

### 3. New `HubModalHost` component
- New `src/components/navigation/HubModalHost.tsx` renders a single fullscreen overlay (`fixed inset-0 z-[60] w-screen h-screen`) when `activeHub` is set.
- Inside it lazy-renders the existing hub page component for the active tab:
  - `fm` → existing FM hub page
  - `mindos` → MindOS Tactics page (`MindOSTacticsPage`)
  - `community` → existing Community layout
  - `study` → existing Learn page
- Header inside the modal: hub title + close button (X). Close button calls `closeHub()`.
- Body: `100% w × 100% h`, scrollable, themed to match the tab color (existing `TAB_COLORS`).
- Mount the host inside `DashboardLayout` so it overlays the chat.

### 4. Cleanup of related behaviour
- Existing `StorySurfaceHost` modal-shell behaviour for these surfaces is superseded by the new modal host on the chat page. Leave `StorySurfaceHost` in place for routes that still use it directly (deep links), but the bottom-tab path goes through `HubModalHost` only.
- Active-tab highlight in `BottomTabBar` switches from "matches current route" to "matches `activeHub` from context"; chat (no hub open) shows no tab as active.
- Keep the deep-link routes (`/fm`, `/community`, `/learn`, `/mindos/tactics`) intact so direct URLs and existing internal `navigate(...)` calls keep working. They render the same hub pages standalone (no modal wrapper).

### 5. Out of scope
- No changes to hub page internals (FM, Community, Study, Tactics). They render as-is inside the modal.
- No changes to AION chat content, quick actions, or input.
- No changes to the floating AION orb widget — it continues to work as today.
- No changes to header, settings modal, or AuroraDock.

## Files touched

- `src/pages/Index.tsx` — redirect to `/mindos/chat`.
- `src/App.tsx` — legacy redirects → `/mindos/chat`.
- `src/contexts/HubModalContext.tsx` — new.
- `src/components/navigation/HubModalHost.tsx` — new.
- `src/components/navigation/BottomTabBar.tsx` — open hub modal instead of navigating.
- `src/components/dashboard/DashboardLayout.tsx` — mount `HubModalProvider` + `HubModalHost`.

## Open question

The "MindOS" bottom tab today goes to the Tactics page. Since the chat itself is the MindOS surface now, do you want the MindOS tab to:
- (A) Open the **Tactics** hub as the modal (recommended — keeps Tactics reachable), or
- (B) Be removed from the bottom bar (since the chat already is MindOS)?

Default in this plan: **(A)**.
