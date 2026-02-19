
# Admin Domain Layer — COMPLETED

Applied the same domain-layer pattern as Coaches to the Admin system.

## What was done

| Action | File | Status |
|--------|------|--------|
| Created | `src/domain/admin/types.ts` | ✅ |
| Created | `src/domain/admin/hooks.ts` | ✅ |
| Created | `src/domain/admin/tabConfig.ts` | ✅ |
| Created | `src/domain/admin/index.ts` | ✅ |
| Simplified | `src/pages/AdminHub.tsx` (thin shell, imports from domain) | ✅ |
| Moved to legacy | `AdminPanel.tsx` | ✅ |
| Updated | `docs/APP_MAP.md` | ✅ |
| Updated | `src/components/panel/index.ts` (removed AdminPanel export) | ✅ |

## Notes
- `AdminSidebar.tsx` kept in place — still imported by `Header.tsx`
- `RoleSwitcher.tsx` kept in place — still used by `AffiliateSidebar` (active route)
- Admin sub-page JSDoc tagging deferred to a separate pass
