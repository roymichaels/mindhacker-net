

# Consolidate Dashboard Modals -- Remove Redundancy

## Problem
The dashboard currently has **6 buttons in 2 rows** that open modals, but the second row is entirely redundant:
- "ID Card" (כרטיס זהות) -- already inside the "Identity" (זהות) modal as a tab
- "90-Day Plan" (תוכנית 90 יום) -- already inside the "Direction" (כיוון) modal as a tab
- "AI Analysis" (ניתוח AI) -- already inside the "Insights" (תובנות) modal as a tab

Additionally, the Diagnostics modal (6 scores) lives separately but belongs inside Insights.

## Solution

### 1. Remove the redundant second row of buttons
Delete the entire second `grid grid-cols-3` block (lines 349-372) from `MobileHeroGrid.tsx` -- the one with "כרטיס זהות", "תוכנית 90 יום", "ניתוח AI".

### 2. Merge Diagnostics into the Insights modal
Add a 4th tab "Diagnostics" (אבחון) to `MergedInsightsModal` in `MergedModals.tsx`. This tab will show the 6 diagnostic scores (Energy Stability, Recovery Debt, etc.) using the same data-fetching logic currently in `DiagnosticsModal.tsx`. The tab grid becomes `grid-cols-4`: AI Analysis | Consciousness | Diagnostics | Stats.

### 3. Wire diagnostic cards in COL 3 to the Insights modal
Update the 6 diagnostic score buttons in the desktop right column to open the Insights modal with the Diagnostics tab pre-selected, instead of a standalone DiagnosticsModal. Add `initialTab` prop to `MergedInsightsModal`.

### 4. Remove standalone DiagnosticsModal
Remove the `DiagnosticsModal` import and instance from `MobileHeroGrid.tsx`. The `LifePlanModal` import/instance can also be removed since 90-Day Plan already lives inside the Direction modal.

### 5. Clean up unused modals in DashboardModals.tsx
The standalone `LifePlanModal`, `AIAnalysisModal`, and other single-purpose modals in `DashboardModals.tsx` that are now fully covered by the merged modals can be marked for cleanup (they may still be used in ProfileContent's insights grid, so we verify references first).

## Files Changed

| File | Change |
|------|--------|
| `src/components/dashboard/MergedModals.tsx` | Add Diagnostics tab to `MergedInsightsModal` (4th tab with 6 score cards + bars + interpretations). Add `initialTab` prop. |
| `src/components/dashboard/MobileHeroGrid.tsx` | Remove second row of 3 buttons. Remove `DiagnosticsModal` and `LifePlanModal` imports/instances. Update diagnostic card clicks to open `insights` modal with `initialTab='diagnostics'`. Remove `diagnostics` and `plan` from `ModalType`. |
| `src/components/dashboard/DiagnosticsModal.tsx` | No longer imported from dashboard (can be kept for other potential uses or deleted). |

## Result
- **3 buttons** instead of 6: Identity, Direction, Insights
- Diagnostics scores accessible via Insights modal (4th tab) AND from the desktop right-column cards
- Zero redundancy -- every piece of content has exactly one entry point
- Cleaner, more premium feel

