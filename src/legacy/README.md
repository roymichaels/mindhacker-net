# Legacy Code

This folder contains deprecated panel pages from the pre-Hub architecture.
They are preserved for reference but are **not actively used** — no routes point to them.

## Contents

These were standalone panel pages that have been superseded by:
- **AdminHub** (`/admin-hub`) — consolidates all admin functionality
- **CoachesLayoutWrapper** (`/coaches`) — replaces the old CoachPanel

## Files moved here

| File | Original Location | Reason |
|------|-------------------|--------|
| `CoachClientPlans.tsx` | `src/pages/panel/` | Unused — coach client plans now in CoachHub sidebar |
| `CoachDashboard.tsx` | `src/pages/panel/` | Unused — replaced by CoachDashboardOverview |
| `CoachTheme.tsx` | `src/pages/panel/` | Unused — theme settings in AdminHub |
| `MyClients.tsx` | `src/pages/panel/` | Unused — client management in CoachHub |
| `MyServices.tsx` | `src/pages/panel/` | Unused — services managed in CoachHub |
| `MyCalendar.tsx` | `src/pages/panel/` | Unused — calendar not yet implemented |
| `MyEarnings.tsx` | `src/pages/panel/` | Unused — earnings in affiliate panel |
| `MyProducts.tsx` | `src/pages/panel/` | Unused — products in AdminHub |
| `CoachContent.tsx` | `src/pages/panel/` | Unused — content in AdminHub |
| `StorefrontSettings.tsx` | `src/pages/panel/` | Unused — storefront settings in CoachHub |
| `CoachReviews.tsx` | `src/pages/panel/` | Unused — reviews on profile page |
| `CoachAnalytics.tsx` | `src/pages/panel/` | Unused — analytics in AdminHub |
| `UserProfile.tsx` | `src/pages/panel/` | Unused — profile in /me or dashboard |
| `UserDashboardView.tsx` | `src/pages/panel/` | Unused — dashboard is unified now |
| `ClientProfile.tsx` | `src/pages/panel/` | Unused — client profile in CoachHub sidebar |
| `AdminPanel.tsx` | `src/components/panel/` | Unused — replaced by AdminHub |
| `CoachPanel.tsx` | `src/components/panel/` | Unused — replaced by CoachesLayoutWrapper |
| `AdminSidebar.tsx` | `src/components/panel/` | Unused — was only used by AdminPanel |
| `CoachSidebar.tsx` | `src/components/panel/` | Unused — was only used by CoachPanel |
| `RoleSwitcher.tsx` | `src/components/panel/` | Unused — roles in AdminHub |

## Can I delete these?

Yes, once you're confident no external links or bookmarks reference the old `/panel/*` routes
(the redirects in App.tsx still catch those and send users to `/admin-hub`).
