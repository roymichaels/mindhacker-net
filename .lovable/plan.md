# Adopt old header/drawer LOOK, drop old shell architecture

## Visual source (kept as reference, not mounted)

- `src/components/shell/OSDrawer.tsx` — right-side `Sheet`, MINDOS brand row, button list, profile/settings/sign-out footer (this is the look in your screenshots).
- `src/components/dashboard/DashboardLayout.tsx` (header block, lines 86–101) — the orb-left / centered-brand / hamburger-right header bar (the look in screenshot IMG_1669).

Both stay on disk only as copy-paste reference until the new components land; then they get hard-blocked from ever mounting on ShellV2 routes.

## New files

### 1. `src/shellv2/ShellV2Drawer.tsx`
Extracted from `OSDrawer` JSX/styles, but:

- Wired to `OverlayController` (`useOverlay`, `kind: 'drawer'`) instead of local `useState` — so "one overlay at a time" is enforced.
- Uses shared `Sheet`/`SheetContent` primitive, side `right` in RTL / `left` in LTR, same `w-[300px] sm:w-[320px]` panel, same `bg-card backdrop-blur-2xl ring-1 ring-white/[0.08]` chrome.
- Items list is **hard-coded**, no `OS_TABS`, no `useHubModal`, no `HubModalContext`:
  - Home  → `navigate('/')`
  - Brain → `navigate('/brain')`
  - Outer World → `navigate('/outer-world')`
  - History → `overlay.open('aion')`
  - Settings → `navigate('/subscriptions')` (or settings modal if available without legacy deps)
  - Account → `navigate('/profile')`
  - Sign out → `supabase.auth.signOut()` + `navigate('/', { replace: true })`
- Footer profile block (avatar circle + display name + "פרופיל"/"Profile") preserved from OSDrawer, but uses `useAuth` only — no `ProfileModalContext` import (navigates to `/profile` instead).

### 2. `src/shellv2/ShellV2Header.tsx` (rewrite)
Replaces the current minimalist top bar with the visual of the old DashboardLayout header:

- Fixed top, `pt-safe`, full-bleed inside `max-w-screen-md`.
- **Left:** small orb badge using `AuroraOrbIcon` (no dropdown, no `AppNameDropdown`). Tap → opens `ShellV2Drawer` (same as hamburger), or no-op — pick one in implementation; default: opens drawer to mirror screenshot.
- **Center:** `מיינד OS` / `Mind OS` (RTL aware via `useTranslation`), no chevron menu attached to it (it was a dropdown in the old shell — we drop the dropdown, keep the visual).
- **Right:** hamburger button → `overlay.open('drawer')`.
- No `MindOSSheet`, no `AppNameDropdown`, no hub launcher, no language/theme toggles inline.

### 3. (none — just edits below)

## Edits

### `src/shellv2/UnifiedOverlayHost.tsx`
- Replace `import ShellV2Menu from './ShellV2Menu'` with `import ShellV2Drawer from './ShellV2Drawer'`.
- Render `<ShellV2Drawer />` in place of `<ShellV2Menu />`.
- Keep `<ChatHistorySheet />`.

### `src/shellv2/ShellV2Menu.tsx`
- Delete (its only consumer is `UnifiedOverlayHost`).

### `src/shellv2/LegacyMountGuard.tsx`
- No code change needed; we just wrap more components below.

### `src/components/shell/OSDrawer.tsx`
- Wrap default export with `withLegacyGuard('OSDrawer', OSDrawer)` so any stray import becomes `null` on ShellV2 routes, with a `console.warn("[LegacyMountGuard] blocked OSDrawer …")`.

### `src/components/shell/MindOSSheet.tsx`
- Same treatment: `withLegacyGuard('MindOSSheet', MindOSSheet)`.

### `src/components/navigation/AppSideMenu.tsx`, `AppNameDropdown.tsx`, `AppNameMenu.tsx`, `DesktopSideNav.tsx`, `TopNavBar.tsx`, `HubModalHost.tsx`
- Same treatment for each default export. They remain importable for legacy routes (`/community`, `/messages`, etc. under `ProtectedAppShell`) but render nothing if a route ever puts them under `/`, `/aurora`, `/brain`, `/outer-world`.

### `src/components/dashboard/DashboardLayout.tsx`
- Already wrapped by `withLegacyGuard`. No further change — but its `OSDrawer` / `MindOSSheet` / `HubModalHost` imports stay (legacy routes still need them). The guard makes the whole layout return `null` on ShellV2 routes, so those imports cannot mount there.

## Active component tree on `/` after the change

```text
SmartRoot (auth)
└─ OnboardingGate
   └─ ShellV2
      ├─ BackgroundLayer
      ├─ ChatLayer        (AuroraChatBubbles + ArtifactLayer)
      ├─ ComposerLayer    (single GlobalChatInput)
      ├─ ChromeLayer
      │  └─ ShellV2Header  ← orb left, "מיינד OS" centered, hamburger right
      ├─ OverlayLayer
      │  └─ UnifiedOverlayHost
      │     ├─ ShellV2Drawer       ← right-side Sheet, curated 7 items + profile/sign-out
      │     └─ ChatHistorySheet
      └─ BlockingLayer
```

No `OSDrawer`, no `MindOSSheet`, no `AppNameDropdown`, no `HubModalHost`, no `DashboardLayout` mount inside this tree.

## Acceptance proof returned after implementation

- File used as visual source: `src/components/shell/OSDrawer.tsx` + header block of `src/components/dashboard/DashboardLayout.tsx`.
- New files: `src/shellv2/ShellV2Drawer.tsx`, rewritten `src/shellv2/ShellV2Header.tsx`.
- Removed import: `ShellV2Menu` from `UnifiedOverlayHost`; `ShellV2Menu.tsx` deleted.
- Confirmation that the only drawer on ShellV2 routes is `ShellV2Drawer` (overlay kind `drawer`), enforced by `OverlayController`.
- Confirmation that `OSDrawer`, `MindOSSheet`, `AppNameDropdown`, `AppSideMenu`, `DesktopSideNav`, `TopNavBar`, `HubModalHost`, `DashboardLayout` all return `null` via `LegacyMountGuard` on `/`, `/aurora`, `/brain`, `/outer-world` (with a `console.warn` if they ever try).
- No dashboard widgets / hub cards / onboarding ceremony / wizard modals are reachable from the ShellV2 tree (no providers like `HubModalProvider` in `ProtectedAppShellV2`).

## Out of scope

- No changes to legacy routes (`/community`, `/messages`, `/coaches`, `/fm`, `/admin-hub`, etc.) — they keep `ProtectedAppShell` + the old chrome.
- No backend / engine deletions. No edge function edits. No DB migrations.
- No new visual design beyond porting the old header + drawer look 1:1 with the curated item list.
