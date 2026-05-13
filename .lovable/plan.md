## Goal

One menu, one shell. Make `ShellV2Drawer` the only drawer in the app, route every authenticated page through `ProtectedAppShellV2`, and delete the legacy `DashboardLayout` chrome (`OSDrawer`, `MindOSSheet`, `AppNameDropdown`, `AppNameMenu`, `AppSideMenu`, `TopNavBar`, `BottomTabBar`, `BottomHudBar`, `HubModalHost`, `FMTopNav`).

## What exists today

- **ShellV2** (`/`, `/aurora`, `/brain`, `/outer-world`): `ShellV2Header` (orb left, MindOS center, hamburger right) opens `ShellV2Drawer` — 6 items: Home, Brain, Outer World, History, Settings, Account.
- **Legacy `DashboardLayout`** (everything else): header mounts `OSDrawer` (right-side Sheet, items from `OS_TABS` = Free Market, Strategy, Hypnosis, Journal, Community, Study + Profile/Settings/Logout), `MindOSSheet`, `AIONPresenceButton`, plus `HubModalHost`. Uses `HubModalContext` to open hubs as modals instead of routes.
- The two drawers have different navigation models: ShellV2 routes (`navigate('/...')`), legacy hubs (`openHub('strategy' | 'hypnosis' | …)`).

## Approach

1. **Expand `ShellV2Drawer` to the union of menu items** — add the legacy hub destinations as plain routes so nothing is lost when the legacy drawer goes away. New item list:
   - Home (`/`)
   - Outer World (`/outer-world`)
   - Brain (`/brain`)
   - Free Market (`/fm` → already redirected to `/outer-world`, keep as discoverable label or drop — decide once)
   - Strategy (`/strategy`)
   - Hypnosis (`/hypnosis`)
   - Journal (`/journal`)
   - Community (`/community`)
   - Learn (`/learn`)
   - History (overlay `aion`)
   - Settings (`/subscriptions`)
   - Account (`/profile`)
   - Sign out
   Hebrew/English labels reused from `OS_TABS`. Section dividers (Core / Practice / Account) inside the same drawer.

2. **Route every authenticated page through `ProtectedAppShellV2`** — change `App.tsx` so the `<Route element={<ProtectedAppShell />}>` block becomes `<Route element={<ProtectedAppShellV2 />}>`. Since `ShellV2` renders `children ?? <ChatLayer />`, page routes already provide their own `<Outlet />`-rendered content as the chat slot. Keep the `OnboardingGate` wrapping (already in V2).

3. **Quarantine + delete legacy menu surface**:
   - Move to `src/_legacy/shell/`: `components/shell/OSDrawer.tsx`, `components/shell/MindOSSheet.tsx`, `components/shell/AIONPresenceButton.tsx`, `components/dashboard/DashboardLayout.tsx`, `components/dashboard/DashboardLayoutWrapper.tsx`, `components/layout/ProtectedAppShell.tsx`, `components/navigation/HubModalHost.tsx`, `components/navigation/AppNameDropdown.tsx`, `components/navigation/AppNameMenu.tsx`, `components/navigation/AppSideMenu.tsx`, `components/navigation/TopNavBar.tsx`, `components/navigation/BottomTabBar.tsx`, `components/navigation/BottomHudBar.tsx`, `components/fm/FMTopNav.tsx`.
   - Drop the lazy imports in `App.tsx`.
   - Leave `HubModalContext` in place only if other features still call `useHubModal()` for non-nav reasons (will audit; if unused, delete too).

4. **Reconcile `ChromeVisibilityProvider` + `SidebarProvider`** — these were owned by the legacy `ProtectedAppShell`. Audit which surviving pages still call `useChromeVisibility` / `useSidebars` and either:
   - mount the providers inside `ProtectedAppShellV2`, or
   - replace the calls with no-ops since ShellV2 chrome is constant.

5. **`FloatingBackButton`** — unchanged, already global, keeps "back" affordance for inner pages.

## Acceptance

- Tapping the hamburger anywhere in the app opens the same `ShellV2Drawer`.
- Legacy "MINDOS" right-side drawer (the screenshot) never appears again.
- Strategy / Hypnosis / Journal / Community / Learn / Free Market are reachable from the merged drawer.
- `rg "OSDrawer|MindOSSheet|AppNameMenu|AppSideMenu|TopNavBar|BottomTabBar|BottomHudBar|AppNameDropdown|HubModalHost|FMTopNav|DashboardLayout"` returns only `_legacy/`, the drawer file, and `LegacyMountGuard`.

## Out of scope

- AION orb / `InteractiveAIONHost` (already global).
- Composer (`ComposerLayer`) — stays.
- Visual redesign of the drawer beyond merging items and adding section labels.
