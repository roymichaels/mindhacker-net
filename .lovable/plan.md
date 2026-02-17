
# Merge Insight Buttons into 3 Unified Modals

## What Changes

### 1. Remove the 4 small insight buttons from the Dashboard
Delete the entire "Deep Insights Strip" section from `UserDashboard.tsx` (the סטטיסטיקה, ניתוח AI, זהות, ערכים buttons and their expandable content panels). This section is redundant since the 3 merged modal buttons (זהות, כיוון, תובנות) already exist in `ProfileContent.tsx`.

### 2. Redistribute content into the 3 Merged Modals

**Identity Modal (זהות)** - already has: Identity Card, Traits, Patterns
- Add a **"Values" tab** (ערכים) showing the values + principles lists (currently in the deleted "ערכים" insight button)
- Remove redundant Orb + regenerate button from `IdentityProfileCard` (already shown in the HUD grid and ProfileContent hero)
- Clean up layout: remove duplicate `showActions` buttons

**Insights Modal (תובנות)** - already has: AI Analysis, Consciousness
- Add a **"Stats" tab** (סטטיסטיקה) showing Level, Streak, Sessions, Tokens grid (currently in the deleted "סטטיסטיקה" insight button)
- This is the natural home since stats are analytical data

**Direction Modal (כיוון)** - already has: 90-Day Plan, Commitments, Anchors
- No changes needed, content is complete

### 3. Fix Modal Layout Quality
- Remove outer `Card` wrappers from tab content components when rendered inside modals (they're already in a Dialog) to avoid card-inside-card nesting
- Ensure consistent padding and spacing across all tabs
- Pass `showActions={false}` to `IdentityProfileCard` inside the modal to prevent duplicate CTA buttons

## Technical Details

### Files Modified
1. **`src/pages/UserDashboard.tsx`**: Delete lines 105-235 (insightTabs array, state, and the entire Section 5 render block). Remove unused imports (`BarChart3`, `Brain`, `Shield`, `Heart`, `Card`, `CardContent`, `AnimatePresence`, `motion`, `cn`, `activeInsight` state).

2. **`src/components/dashboard/MergedModals.tsx`**: 
   - **MergedIdentityModal**: Add 4th tab "Values" showing values badges + principles list (move from deleted insight panel). Pass `showActions={false}` to `IdentityProfileCard`.
   - **MergedInsightsModal**: Add "Stats" tab showing the 2x2 gamification stats grid (Level, Streak, Sessions, Tokens) using data from `useUnifiedDashboard`.

3. **`src/components/dashboard/unified/IdentityProfileCard.tsx`**: When `showActions={false}`, also hide the redundant Orb display at the top (it's already visible in the HUD grid and ProfileContent hero).
