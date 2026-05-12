## Restore the header to its intended minimal state

Two items only in the main app header:
1. **App Name Menu** (left) — the existing `AppNameDropdown` component
2. **Play button** (right) — single icon, opens Mission Control

Everything else (notifications, admin, search, avatar side menu, brand label) should NOT be in the header.

---

### Changes

**`src/components/dashboard/DashboardLayout.tsx`**
- Remove `HeaderBrand` import and usage.
- Remove `AppSideMenu` import and usage from the header (both mobile and desktop branches).
- Replace left side with `<AppNameDropdown onOpenSettings={() => setSettingsOpen(true)} compact={isMobile} />`.
- Right side: keep only `<HeaderActions />` (which already renders just the Play button, plus Wallet on FM pages).
- Keep `SettingsModal` mounted as before so the dropdown's settings entry still works.

**`src/components/navigation/HeaderActions.tsx`**
- No change — already renders the Play icon (and conditional Wallet on FM routes).

**`src/components/navigation/HeaderBrand.tsx`**
- Delete the file (was created in the previous step, no longer needed).

**`src/components/navigation/AppNameDropdown.tsx`**
- No change — component already exists with full menu (profile card, blog, guide, white paper, founding, report bug, subscription, settings, language, theme, sign out).

**`src/components/navigation/AppSideMenu.tsx`**
- Leave file in place but unused by the main header (still referenced elsewhere if needed). No deletion to avoid collateral damage; we can remove later if confirmed unused.

---

### Result

Header (mobile + desktop):
```text
[ AppNameDropdown ]                                    [ ▶ Play ]
```

Nothing else. All menu items live inside the AppNameDropdown — exactly the structure you had before.
