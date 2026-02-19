

# Admin Domain Layer — Same Pattern as Coaches

## Overview
Apply the exact same domain-layer approach used for Coaches to the Admin system: create `src/domain/admin/` with types, hooks, tab config, and barrel exports. Move the inline tab configuration out of `AdminHub.tsx` into the domain layer. Clean up dead panel files.

---

## 1. Create `src/domain/admin/types.ts`

Define domain types for admin entities used across the hub:

- `AdminNotification` (re-export from `useAdminNotifications`)
- `AdminUserData` (re-export from `useAdminUserView`)
- `AdminTabConfig`, `AdminSubTab` (extracted from inline `TabConfig` in `AdminHub.tsx`)

---

## 2. Create `src/domain/admin/hooks.ts`

Re-export admin hooks under clean domain-layer naming:

- `useAdminNotifications` (already named well, just re-export)
- `useAdminAuroraInsights` (re-export)
- `useAdminUserView` (re-export)

Tagged with JSDoc `@module domain/admin/hooks`.

---

## 3. Create `src/domain/admin/tabConfig.ts`

Extract the `ADMIN_TABS` array (currently inline in `AdminHub.tsx` lines 53-127) into its own file:

- Move all lazy imports for admin sub-pages here
- Export `ADMIN_TABS` constant
- Export `AdminTabConfig` and `AdminSubTabConfig` types

This makes `AdminHub.tsx` a thin shell (just renders the tab system), matching how CoachHub works.

---

## 4. Create `src/domain/admin/index.ts`

Barrel export:
```
export * from './types';
export * from './hooks';
export * from './tabConfig';
```

---

## 5. Simplify `AdminHub.tsx`

- Remove all 25 lazy imports (moved to `tabConfig.ts`)
- Remove `TabConfig` interface (moved to `types.ts`)
- Remove `ADMIN_TABS` array (moved to `tabConfig.ts`)
- Import from `@/domain/admin`
- Add JSDoc tag: `@tab Admin`, `@purpose Unified admin control center`

The page becomes ~60 lines (just the rendering logic).

---

## 6. Tag All Admin Sub-Pages

Add JSDoc blocks to each file in `src/pages/admin/`:
```typescript
/**
 * @tab Admin
 * @purpose [specific purpose]
 * @data [hooks/tables used]
 */
```

---

## 7. Move Dead Panel Files to Legacy

Files confirmed dead (zero imports):
- `src/components/panel/AdminPanel.tsx` -> `src/legacy/`
- `src/components/panel/AdminSidebar.tsx` -> `src/legacy/`
- `src/components/panel/RoleSwitcher.tsx` -> `src/legacy/`

(`CoachPanel.tsx` and `CoachSidebar.tsx` should also move but were part of the previous pass scope)

---

## 8. Update `docs/APP_MAP.md`

Add the new `src/domain/admin/` layer to the architecture section.

---

## Summary of Changes

| Action | File |
|--------|------|
| Create | `src/domain/admin/types.ts` |
| Create | `src/domain/admin/hooks.ts` |
| Create | `src/domain/admin/tabConfig.ts` |
| Create | `src/domain/admin/index.ts` |
| Simplify | `src/pages/AdminHub.tsx` (remove inline config, import from domain) |
| Tag | All 25 files in `src/pages/admin/*.tsx` |
| Move to legacy | `AdminPanel.tsx`, `AdminSidebar.tsx`, `RoleSwitcher.tsx` |
| Update | `docs/APP_MAP.md` |

No UI changes. No DB changes. No route changes.

