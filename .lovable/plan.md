## Goal
Make the homepage feel chat-first like the Lovable mobile app:
1. Fix scroll inside the home AION chat so users can scroll the conversation freely.
2. Replace the bottom tab bar with a Lovable-style **left side menu** triggered from a hamburger in the header.
3. The header's app name (`MindOS`) becomes the menu trigger — clearly looks tappable (chevron + hamburger affordance).
4. Move the avatar/account dropdown (currently top-right) **into the side menu** at the top.

## Findings
- Layout shell: `src/components/dashboard/DashboardLayout.tsx` renders `AppNameDropdown` (left) + `HeaderActions` (right, includes avatar/notification/wallet/admin) + `<BottomTabBar/>` at bottom.
- Bottom tabs come from `src/components/navigation/BottomTabBar.tsx` and drive `HubModalContext` (FM, MindOS, Community, Study). We will keep `HubModalContext` and just expose those same hubs from the side menu instead.
- Avatar dropdown lives inside `AppNameDropdown` (account menu) + `HeaderActions` (notification bell, admin, wallet). All of it relocates to the side menu's header.
- Home AION chat: `src/pages/AuroraPage.tsx` has the conversation in a `flex-1 overflow-y-auto` block with auto-scroll-to-bottom logic in `AuroraChatBubbles`. On mobile the page sits inside `DashboardLayout`'s main `pb-20 md:pb-24` (because of bottom tabs), which eats screen space and visually traps scroll near the composer. Removing the bottom tabs + adjusting that bottom padding restores natural scroll.

## Changes

### 1. New side-menu component
**Create** `src/components/navigation/AppSideMenu.tsx`:
- A `Sheet` (shadcn) that opens from the left (`side="left"`), full-height, `w-screen sm:max-w-sm` so it's full-screen on mobile.
- Solid `bg-background` (100% opaque per existing memory).
- Top section: avatar + display name + email (reuses `useUserAvatarData`, `useAuth`, `AvatarMiniPreview`) — same account chip style as Lovable's bottom-left.
- Below it, the **account dropdown items** currently inside `AppNameDropdown` (Profile, Settings, Subscriptions, Docs, Theme toggle, Language toggle, Admin/Practitioner/Affiliate panels if role, Bug report, Sign out).
- Then a **Hubs** section listing the same 4 entries from `getVisibleTabs` (FM, MindOS, Community, Study). Tapping opens the hub via `useHubModal().openHub(...)`, then closes the sheet.
- Optional "Home" / `/aurora` entry at the very top of the navigation list.

### 2. Header trigger
**Update** `src/components/navigation/AppNameDropdown.tsx` (or replace its usage in `DashboardLayout`):
- New compact header trigger: hamburger icon + bold `MindOS` text + small `ChevronDown`. Clearly reads as a menu.
- Clicking it opens `AppSideMenu` instead of the current dropdown menu.
- Internally we can keep the file but switch its `DropdownMenu` to a state that opens the new `Sheet`. Simpler: keep `AppNameDropdown` for non-mobile/legacy and render the new trigger directly in `DashboardLayout`'s header.

### 3. Layout integration
**Update** `src/components/dashboard/DashboardLayout.tsx`:
- Remove `<BottomTabBar />`.
- Replace mobile/desktop header left side with the new menu trigger (`AppSideMenuTrigger`).
- Right side `HeaderActions`: keep notification bell + wallet (FM page) + admin shortcut visible in header (these are contextual quick actions). The user-account/avatar piece moves into the side menu only.
- Reduce main `pb-20 md:pb-24` → `pb-3` (or `pb-0` when chrome hidden) since there's no bottom bar anymore. Keep FM-specific `pb-16` if `FMTopNav` requires it; otherwise drop.

### 4. Homepage chat scroll fix
**Update** `src/pages/AuroraPage.tsx`:
- The container is already `flex-1 min-h-0 overflow-hidden` with an inner `flex-1 min-h-0 overflow-y-auto`. Once bottom-tab padding is removed in `DashboardLayout`, the conversation surface gains the missing pixels and scroll behaves correctly.
- Add `touch-pan-y` to the conversation div to ensure mobile scroll gestures pass through over chat bubbles.
- Confirm `AuroraChatBubbles` auto-scroll keeps working (no change needed).

### 5. Cleanup
- `BottomTabBar.tsx` stays in repo but no longer imported (left for fallback). If you prefer, delete it — confirm before removing.
- `HubModalContext` and `HubModalHost` remain unchanged (still drive the hub modals).

## Out of scope
- No backend / data changes.
- No restructure of hub pages (FM, Community, Study, MindOS) themselves.
- No change to AION chat engine, edge functions, or model wiring.
- No redesign of the avatar dropdown contents — same items, just relocated.

## Validation
- Open `/aurora`: hamburger + `MindOS` label visible top-left; tapping it slides in a full-screen menu with avatar at top, account actions, then Hubs list.
- Selecting a hub closes the menu and opens the corresponding hub modal.
- The conversation in the home chat scrolls freely on mobile; composer stays pinned at the bottom.
- No bottom tab bar visible anywhere.
