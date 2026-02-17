
## Fix Dashboard Height to 100% Viewport (No Scroll)

The dashboard content overflows because:
1. The `CollapsiblePlanRow` components use `flex-1` which makes them grow to fill space AND expand beyond it
2. The main content area doesn't account for the fixed AuroraDock and BottomTabBar heights with proper bottom padding
3. On desktop, the grid columns aren't properly constrained

### Changes

**1. `src/components/dashboard/MobileHeroGrid.tsx`**
- Remove `flex-1` from `CollapsiblePlanRow` (line 321) -- this is the main culprit causing rows to expand beyond viewport
- Change the outer wrapper to use `overflow-y-auto` for the plan column on mobile so content scrolls within the constrained space
- Keep the grid as `flex-1 min-h-0 overflow-hidden` to respect parent constraints

**2. `src/components/dashboard/DashboardLayout.tsx`**
- Add bottom padding to the `<main>` element to account for the fixed AuroraDock (~50px) and BottomTabBar (56px on mobile)
- Mobile: `pb-28` (dock + tab bar)
- Desktop: `pb-14` (dock only)

### Technical Detail

The root cause is `flex-1 flex flex-col` on `CollapsiblePlanRow` (line 321). This tells each row to grow equally to fill available space, but since there are 3 rows plus other elements, they collectively exceed the viewport. Removing `flex-1` from the rows and making the plan column (`leftColRef`) scrollable will constrain everything to exactly 100% height.
