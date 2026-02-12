

# Project Cleanup and Integration Hardening Plan

## 1. Dead Files to Remove

The following files have **zero imports** anywhere in the codebase and are safe to delete:

### Components
| File | Reason |
|---|---|
| `src/components/HeroPortraitEffect.tsx` | Not imported anywhere |
| `src/components/HeroVideo.tsx` | Not imported anywhere |
| `src/components/TrustBadges.tsx` | Not imported anywhere |
| `src/components/DecryptText.tsx` | Not imported anywhere |
| `src/components/dashboard/CommandCenterGrid.tsx` | Not imported anywhere |
| `src/components/dashboard/QuickAccessGrid.tsx` | Not imported anywhere |
| `src/components/dashboard/ProgressSection.tsx` | Not imported anywhere |
| `src/components/dashboard/TodaysFocusCard.tsx` | Not imported anywhere |
| `src/components/dashboard/SmartSuggestionsRow.tsx` | Not imported anywhere |
| `src/components/dashboard/MyRecordings.tsx` | Not imported anywhere |
| `src/components/business/BusinessDashboardModals.tsx` | Not imported anywhere |
| `src/components/orb/MultiThreadOrb.tsx` | Not imported by any component (only referenced by lib types) |

### Lib/Utils
| File | Reason |
|---|---|
| `src/lib/orbVisualSystem.ts` | Not imported anywhere |
| `src/utils/profileTranslations.ts` | Not imported anywhere |

**Total: ~14 dead files**

---

## 2. Architectural Weaknesses Found

### A. Duplicate Profile Components (3 versions doing the same thing)
- `ProfileModal.tsx` -- used only in AuroraAccountDropdown
- `ProfileDrawer.tsx` -- used in DashboardLayout
- `ProfileContent.tsx` -- used in ProfileDrawer

These share nearly identical code (same imports, same Orb rendering, same profile data fetching). They should be consolidated so `ProfileDrawer` and `ProfileModal` both render the shared `ProfileContent`.

### B. DashboardModals.tsx is an orphan bridge
`DashboardModals.tsx` imports `LifePlanExpanded` and many unified cards, but is **not imported by any page or component**. It appears to be a legacy wrapper that was superseded by `UnifiedDashboardView`. Safe to remove.

### C. ChatAssistant admin page references deleted edge function
Per the architecture memory, the `chat-assistant` edge function was deleted. However:
- `src/pages/admin/ChatAssistant.tsx` still exists and is routed at `/panel/chat-assistant`
- It manages settings for a non-existent backend function
- Should be either removed or repurposed to configure Aurora settings

### D. AdminLogin.tsx is likely dead
With the `/admin` -> `/panel` redirect and `RoleRoute` protecting `/panel`, the standalone `AdminLogin.tsx` page may be unreachable. Needs verification, but likely safe to remove.

### E. Inconsistent auth pattern in UserDashboard
`UserDashboard.tsx` manually calls `supabase.auth.getUser()` instead of using the existing `useAuth()` context from `AuthContext.tsx`. This is redundant since the route is already wrapped in `<ProtectedRoute>` which handles auth checking. The manual check should be removed.

---

## 3. Integration Improvements

### A. Remove manual auth check from UserDashboard
Since the route is protected by `<ProtectedRoute>`, the `checkAuth` + loading state in `UserDashboard.tsx` is redundant. Remove it to simplify the component and eliminate a flash of skeleton on every dashboard load.

### B. Consolidate Profile rendering
Make `ProfileModal` and `ProfileDrawer` both render `ProfileContent` internally instead of duplicating hundreds of lines of identical profile UI code.

### C. Clean up ChatAssistant or repurpose for Aurora config
Either remove the dead admin page or rewire it to configure Aurora's system prompt, knowledge base, and greeting messages (which are the settings it already manages -- just need to ensure they connect to `aurora-chat` instead of the deleted `chat-assistant` function).

---

## Technical Implementation Steps

1. **Delete 14+ dead files** listed in Section 1, plus `DashboardModals.tsx`
2. **Simplify UserDashboard.tsx**: Remove `checkAuth`, `loading` state, and skeleton fallback since `ProtectedRoute` already handles auth
3. **Consolidate Profile components**: Have `ProfileModal` and `ProfileDrawer` both render `ProfileContent` as their body, removing duplicate code
4. **Verify ChatAssistant**: Check if its DB writes (to `site_settings`) are consumed by `aurora-chat` -- if yes, keep and rename; if not, remove
5. **Verify AdminLogin.tsx**: Check if any link points to it -- if dead, remove

Estimated scope: ~15 file deletions, 3 file edits, no database changes needed.
