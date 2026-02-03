
# Project Cleanup: Delete Unused Files

## Overview
After thorough codebase analysis, I identified **9 unused files** that can be safely deleted. These files are not imported anywhere in the project and represent dead code that increases bundle size and maintenance burden.

---

## Files to Delete

### 1. `src/components/CheckoutDialog.tsx` (288 lines)
**Reason**: There's a DIFFERENT `CheckoutDialog.tsx` in `src/components/checkout/` that IS used. This root-level file has a completely different API (uses `isOpen`/`onClose` props vs `open`/`onOpenChange`) and is not imported anywhere.

### 2. `src/services/unifiedVoice.ts` (379 lines)  
**Reason**: Unified voice service that was never integrated. The app uses `src/services/voice.ts` instead.

### 3. `src/hooks/useMultiThreadOrbProfile.ts` (97 lines)
**Reason**: Hook for multi-thread orb profiles. Superseded by `useLiveOrbProfile` which IS actively used.

### 4. `src/hooks/useFeatureAccess.ts` (~80 lines)
**Reason**: Feature gating hook that was never integrated into the UI.

### 5. `src/hooks/useLaunchpadChecklists.ts` (~120 lines)
**Reason**: Checklist creation hook never wired up. The app uses `useChecklistsData` from aurora hooks instead.

### 6. `src/hooks/usePermissions.ts` (~60 lines)
**Reason**: Permissions state hook that was never used. Browser permissions are handled elsewhere.

### 7. `src/lib/jobs.ts` (876 lines)  
**Reason**: Entire RPG job system that was designed but never implemented. This is the largest unused file.

### 8. `src/lib/guestProfilePdfGenerator.ts` (~200 lines)
**Reason**: PDF generator for guests that was replaced by `useGuestPDF` hook.

### 9. `src/components/GlobalBottomNav.tsx` (6 lines)
**Reason**: Returns `null` - navigation handled by sidebar. Still imported in `App.tsx` but does nothing.

---

## Total Impact

| Metric | Value |
|--------|-------|
| Files Removed | 9 |
| Lines Removed | ~2,100+ |
| Effect | Cleaner codebase, smaller bundle, easier maintenance |

---

## Implementation Steps

1. Delete all 9 files listed above
2. Remove `GlobalBottomNav` import and usage from `App.tsx`
3. Verify build succeeds with no import errors

---

## Files NOT Deleted (Verified In Use)

These were initially suspected but confirmed to be used:
- `useLaunchpadData.ts` - Used by ProfileDrawer, ProfileContent
- `useAdminAuroraInsights.ts` - Used by AuroraInsights admin page
- `usePushNotifications.ts` - Used by PWAInstallModal, Install page
- `useHaptics.ts` - Used by hypnosis sessions
- `useDailyHypnosis.ts` - Used by HypnosisLibrary and HypnosisModal
- `useGuestLaunchpadAutoSave.ts` - Used by LaunchpadFlow
