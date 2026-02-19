

# Cleanup & Repackage Pass — App Map + Rename + Dead Code Removal

## Overview
This is a code organization pass: rename "Practitioner" to "Coach" in user-facing code, remove dead files and routes, create a navigation config, and produce a single-source-of-truth App Map. **No UI/UX changes. No DB schema changes.**

---

## Task A: Create `docs/APP_MAP.md`

A new markdown file documenting:
- All active routes grouped by tab (Dashboard, Projects, Coaches, Business, Admin)
- Which components render each route
- Key DB tables and hooks per route
- Legacy/dead items discovered

This file will be created from scratch based on the full route audit performed during this planning phase.

---

## Task B: "Practitioner" to "Coach" Rename

### Domain Adapter Layer
Create `src/domain/coaches/` with:
- **`types.ts`** — `Coach`, `CoachService`, `CoachReview`, `CoachWithDetails` types that alias the DB-level Practitioner types
- **`hooks.ts`** — `useCoaches`, `useCoach`, `useMyCoachProfile` wrappers around existing `usePractitioners` hooks (old hooks stay as aliases)

### Context Renames
| Old | New | Notes |
|-----|-----|-------|
| `PractitionersModalContext` | `CoachesModalContext` | Old export kept as alias |
| `PractitionerContext` | `CoachStorefrontContext` | Only used by storefront; rename context, keep `usePractitioner` as deprecated alias |
| `PractitionerAuthContext` | `CoachStorefrontAuthContext` | Same approach |

### Component Renames (file-level)
| Old | New |
|-----|-----|
| `src/components/practitioners/` | `src/components/coaches/` (rename folder) |
| `PractitionerCard` | `CoachCard` |
| `PractitionerDetailView` | `CoachDetailView` |
| `FeaturedPractitioners` | `FeaturedCoaches` |
| `PractitionerMiniItemCard` | `CoachMiniItemCard` |
| `PractitionerReviewSlider` | `CoachReviewSlider` |
| `PractitionerBookingView` | `CoachBookingView` |
| `PractitionersModal` | `CoachesModal` |

### Page Renames
| Old | New |
|-----|-----|
| `PractitionerProfile.tsx` | Keep file, but update export name and internal references |

### Route labels
- `/practitioner/:slug` and `/practitioners/:slug` remain as redirects
- `/p/:practitionerSlug` stays (storefront)
- All user-facing labels already say "Coaches" in nav bars -- confirmed

### What stays unchanged
- DB table names: `practitioners`, `practitioner_services`, `practitioner_reviews`, `practitioner_specialties`
- Hook file `usePractitioners.ts` stays (domain layer wraps it)
- `usePractitioner` from `PractitionerContext` stays (storefront internal use), just re-exported under new name

---

## Task C: Remove Dead Code

### Dead lazy imports in App.tsx (imported but no route uses them)
These 15 imports and their source files are **completely unreachable** -- no route renders them, AdminHub has its own lazy imports for the 2 it uses:

| Dead Import in App.tsx | Source File | Action |
|------------------------|------------|--------|
| `CoachClientPlans` | `src/pages/panel/CoachClientPlans.tsx` | Move to `src/legacy/` |
| `CoachDashboard` | `src/pages/panel/CoachDashboard.tsx` | Move to `src/legacy/` |
| `CoachTheme` | `src/pages/panel/CoachTheme.tsx` | Move to `src/legacy/` |
| `MyClients` | `src/pages/panel/MyClients.tsx` | Move to `src/legacy/` |
| `MyServices` | `src/pages/panel/MyServices.tsx` | Move to `src/legacy/` |
| `MyCalendar` | `src/pages/panel/MyCalendar.tsx` | Move to `src/legacy/` |
| `MyEarnings` | `src/pages/panel/MyEarnings.tsx` | Move to `src/legacy/` |
| `MyProducts` | `src/pages/panel/MyProducts.tsx` | Move to `src/legacy/` |
| `CoachContent` | `src/pages/panel/CoachContent.tsx` | Move to `src/legacy/` |
| `StorefrontSettingsPanel` | `src/pages/panel/StorefrontSettings.tsx` | Move to `src/legacy/` |
| `CoachReviews` | `src/pages/panel/CoachReviews.tsx` | Move to `src/legacy/` |
| `CoachAnalytics` | `src/pages/panel/CoachAnalytics.tsx` | Move to `src/legacy/` |
| `UserProfile` | `src/pages/panel/UserProfile.tsx` | Move to `src/legacy/` |
| `UserDashboardView` | `src/pages/panel/UserDashboardView.tsx` | Move to `src/legacy/` |
| `ClientProfile` | `src/pages/panel/ClientProfile.tsx` | Move to `src/legacy/` |

Also remove from App.tsx:
- `AdminPanel` import (no route)
- `CoachPanel` import (no route -- `/coach/*` redirects to `/coaches`)
- `AffiliatePanel` stays (has route at `/affiliate`)

### Dead admin page imports in App.tsx
These are lazy-imported in App.tsx but only used inside AdminHub.tsx (which has its own lazy imports):
- `Analytics`, `NotificationCenter`, `Settings`, `FAQs`, `AdminOffers`, `Testimonials`, `Purchases`, `Users`, `Leads`, `Content`, `MenuManagement`, `Recordings`, `Forms`, `Newsletter`, `HomepageSections`, `ChatAssistant`, `Videos`, `AdminProducts`, `AdminAffiliates`, `AdminTheme`, `LandingPages`, `LandingPageBuilder`, `AuroraInsights`, `BugReports`, `Businesses`

**Action**: Remove all these dead imports from App.tsx (AdminHub handles its own lazy loading).

### Legacy panel components
- `src/components/panel/AdminPanel.tsx` — no route uses it; move to `src/legacy/`
- `src/components/panel/CoachPanel.tsx` — no route uses it (redirects to `/coaches`); move to `src/legacy/`
- `src/components/panel/AdminSidebar.tsx` — only imported by `AdminPanel` and `Header.tsx`; check Header usage, likely removable from Header
- `src/components/panel/CoachSidebar.tsx` — used by `CoachPanel` only; move with it
- `src/components/panel/RoleSwitcher.tsx` — check usage, likely dead

### Dead route cleanup in App.tsx
The `/panel/*` redirects are comprehensive (lines 659-685). These stay as safety nets. But the `/coach` and `/coach/*` redirects (lines 688-689) can stay too.

### Legacy folder
Create `src/legacy/` with a `README.md` explaining these are deprecated panel pages from the pre-Hub architecture, preserved for reference.

---

## Task D: Navigation & Layout Consolidation

### Create `src/navigation/navConfig.ts`
Centralized tab definitions currently duplicated in `BottomTabBar.tsx` and `TopNavBar.tsx`:

```typescript
export const APP_TABS = [
  { id: 'dashboard', path: '/dashboard', icon: 'LayoutDashboard', labelEn: 'Dashboard', labelHe: 'דאשבורד' },
  { id: 'projects', path: '/projects', icon: 'FolderKanban', labelEn: 'Projects', labelHe: 'פרויקטים' },
  { id: 'coaches', path: '/coaches', icon: 'Store', labelEn: 'Coaches', labelHe: 'מאמנים' },
  { id: 'business', path: '/business', icon: 'Briefcase', labelEn: 'Business', labelHe: 'עסקים', comingSoon: true },
];
export const ADMIN_TAB = { id: 'admin', path: '/admin-hub', icon: 'Shield', labelEn: 'Admin', labelHe: 'ניהול' };
```

Update `BottomTabBar` and `TopNavBar` to import from `navConfig` instead of defining inline.

### Sidebar inventory (no changes to layout)
Current sidebars and their active usage:
- `HudSidebar` — Dashboard default left sidebar (active)
- `RoadmapSidebar` — Dashboard default right sidebar (active)
- `CoachHudSidebar` — Coaches tab left sidebar (active)
- `CoachActivitySidebar` — Coaches tab right sidebar (active)
- `DashboardSidebar` — check if dead or used elsewhere
- `AdminSidebar` — used in legacy AdminPanel + Header; audit Header usage
- `CoachSidebar` — used in legacy CoachPanel only; move to legacy
- `AffiliateSidebar` — used in AffiliatePanel (active route)

**No layout changes** — same AppShell pattern via `DashboardLayout` continues.

---

## Task E: Standardized Tags

Add a comment block at the top of each page file:

```typescript
/**
 * @tab Coaches
 * @purpose Public coach profile page (Instagram-style)
 * @data usePractitioner, community_posts, offers, testimonials
 */
```

Applied to all active page files (not legacy ones).

---

## Task F: Smoke Test Checklist

After implementation, verify:
1. `/dashboard` loads with sidebars
2. Onboarding flow completes
3. Aurora chat works
4. Hypnosis modal opens
5. Orb renders
6. `/projects` loads
7. `/coaches` loads (both landing and coach hub views)
8. `/practitioner/:slug` profile works
9. `/p/:slug` storefront works
10. `/admin-hub` loads with all sub-tabs
11. `/affiliate` loads
12. Build compiles with zero errors

---

## Deliverables Summary

1. **`docs/APP_MAP.md`** — Complete route/component/data map
2. **`src/domain/coaches/`** — Types + hook wrappers (Coach vocabulary over Practitioner DB)
3. **`src/navigation/navConfig.ts`** — Single source of truth for tabs
4. **`src/legacy/`** — 15+ dead panel pages + README
5. **Cleaned App.tsx** — ~40 dead imports removed, cleaner route section
6. **Renamed components** — `practitioners/` folder becomes `coaches/`, contexts renamed with aliases
7. **Tagged pages** — JSDoc comment blocks on all active pages

### TODO for Next Pass (not implemented now)
- Merge storefront (`/p/:slug`) into coach profile (`/practitioner/:slug`) as a single unified coach page
- Add "Highlights" / story circles row to coach profile
- Add follow/unfollow functionality
- Build coach post creation from dashboard
- Consolidate `DashboardLayout` sidebar logic into a `useTabLayout` hook per tab
- Consider custom domain support for coach storefronts

