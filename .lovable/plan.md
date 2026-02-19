
# Package & Unify: ONE Integrated OS

## Overview
This is a structural tightening pass -- no visual redesign, no DB changes. We unify navigation into a single source of truth, clean up dead code, strengthen the Coach domain adapter, and add the "Auto Plan Engine" modal as the one WOW feature using entirely existing infrastructure.

---

## PHASE 1 -- Single Source of Truth: `osNav.ts`

### Create `src/navigation/osNav.ts`
A unified navigation manifest replacing the current split between `navConfig.ts` (top tabs) and `domain/admin/tabConfig.ts` (admin sub-tabs).

```text
osNav.ts defines:
- 5 top-level tabs: dashboard, projects, coaches, business, admin
- Each tab: id, path, icon, labelEn, labelHe, requiredRole?, comingSoon?
- Sub-routes per tab (for sidebars to consume)
- Role gating: admin tab requires 'admin', coaches hub requires 'practitioner'
```

### Consumers updated to import from `osNav.ts`:
- `TopNavBar.tsx` -- replace `APP_TABS` / `ADMIN_TAB` imports
- `BottomTabBar.tsx` -- same
- `navConfig.ts` -- delete (replaced by osNav)
- Admin/Coach/Projects sidebars can optionally import sub-routes from osNav

### Create `docs/APP_MAP.md`
Auto-maintained route map grouped by tab with route, component, role gate, and status.

---

## PHASE 2 -- Domain Naming Unification (Coaches)

### Expand `src/domain/coaches/`

**`types.ts`** -- already done (Coach = Practitioner aliases). No change needed.

**`hooks.ts`** -- already exports useCoaches/useCoach/useMyCoachProfile. Add:
- `useCoachBySlug(slug)` -- wrapper around `usePractitioner(slug)`
- `useCoachServices(coachId)` -- wrapper if not already exposed
- `useCoachReviews(coachId)` -- wrapper

**`mappers.ts`** (new) -- thin identity mappers for future extensibility:
- `toCoach(practitioner)` / `toCoachService(practitionerService)` etc.
- Currently just pass-through, but provides the seam for future domain divergence.

### UI Label Updates
- All user-facing strings: "Practitioner" -> "Coach", "מתקשר" -> "מאמן"
- File `PractitionerProfile.tsx` keeps its filename but the exported page component renders with "Coach" labels
- Translation keys updated in `he.ts` and `en.ts`

### `/coach/:slug` alias route
Add in `App.tsx`:
```
<Route path="/coach/:slug" element={<Navigate to={`/p/${slug}`} replace />} />
```
Uses a tiny wrapper component that reads `useParams().slug` and redirects.

---

## PHASE 3 -- Dead Code Cleanup

### Files to DELETE (no imports found anywhere):
| File | Reason |
|------|--------|
| `src/pages/panel/CoachDashboard.tsx` | Legacy -- replaced by CoachHub |
| `src/pages/panel/CoachAnalytics.tsx` | Legacy -- no route, no import |
| `src/pages/panel/CoachContent.tsx` | Legacy -- no route, no import |
| `src/pages/panel/CoachReviews.tsx` | Legacy -- no route, no import |
| `src/pages/panel/CoachTheme.tsx` | Legacy -- no route, no import |
| `src/pages/panel/MyClients.tsx` | Legacy -- replaced by CoachActivitySidebar |
| `src/pages/panel/ClientProfile.tsx` | Legacy -- replaced by ClientProfilePanel |
| `src/pages/panel/CoachClientPlans.tsx` | Legacy -- replaced by CoachPlansTab |
| `src/pages/panel/MyCalendar.tsx` | Legacy -- no route |
| `src/pages/panel/MyEarnings.tsx` | Legacy -- no route |
| `src/pages/panel/MyProducts.tsx` | Legacy -- no route |
| `src/pages/panel/MyServices.tsx` | Legacy -- no route |
| `src/pages/panel/StorefrontSettings.tsx` | Legacy -- no route |
| `src/pages/panel/UserProfile.tsx` | Legacy -- no route |
| `src/pages/panel/UserDashboardView.tsx` | Legacy -- no route |
| `src/components/panel/CoachPanel.tsx` | Legacy layout shell -- /coach/* redirects to /coaches |
| `src/components/panel/CoachSidebar.tsx` | Legacy nav -- replaced by CoachHudSidebar |
| `src/components/panel/AdminSidebar.tsx` | Partially used in Header mobile menu -- needs replacement |
| `src/components/panel/RoleSwitcher.tsx` | Check if imported -- if not, delete |

### Files to MOVE to `src/legacy/`:
- `src/components/panel/AdminSidebar.tsx` -- still imported by Header.tsx for mobile admin nav. Replace with AdminHudSidebar usage first, then move.

### Community routes
Community pages (`/community/*`) ARE routed in App.tsx and reachable. Keep them. They are a valid feature even if not in the main 5 tabs.

### `src/components/panel/index.ts`
Update to only export what's still used (AffiliatePanel, AffiliateSidebar).

### Output: `docs/CLEANUP_REPORT.md`
Lists every deleted/moved file with rationale.

---

## PHASE 4 -- Coaches Tab "WOW Packaging"

### A) Coach Command Center (CoachDashboardOverview upgrade)

Enhance the existing `CoachDashboardOverview.tsx` (center content when dashboard tab is active) to show:
- **Leads count** -- query `practitioner_clients` where status = 'pending'
- **Active clients** -- already have via `useCoachClientStats`
- **Next sessions** -- query `bookings` filtered by practitioner, upcoming
- **Revenue snapshot** -- query `content_purchases` or show placeholder "$--"
- **"Create Offer" shortcut** -- button that opens a modal (offers table exists)
- **"Generate Plan" shortcut** -- button opening the Auto Plan Engine modal

All cards use the existing glassmorphic card pattern. No new pages -- everything opens modals.

### B) Auto Plan Engine Modal

The infrastructure already exists (`generate-coach-plan` edge function + `coach_client_plans` table + `ClientProfilePanel` already has the generate flow). 

Create a standalone modal component `AutoPlanEngineModal.tsx` that:
1. Lets coach select a client from dropdown (from `useCoachClients`)
2. Choose coaching style (from `coaching_journeys` step data or freeform)
3. Enter client goals/background
4. Calls `generate-coach-plan` edge function
5. Saves to `coach_client_plans`
6. **NEW**: On success, converts plan phases into `action_items` (tasks + milestones) assigned to the client user -- this makes the plan "playable" on the client's dashboard

This modal is accessible from:
- CoachDashboardOverview "Generate Plan" card
- CoachActivitySidebar "Plan" quick action
- ClientProfilePanel (already exists there)

### C) Coach Public Profile Enhancement

In `PractitionerProfileHeader` (used by both `/p/:slug` and the profile modal):
- Add a "Coach Signature" mini-section: 2-3 line summary pulled from `practitioner_settings.methodology` or `coaching_journeys` completion data
- Add "Best For" tags from `practitioner_specialties`
- "Results" section already exists (reviews/testimonials)
- CTAs already exist (Book / Message / Buy)

Minimal changes -- mostly rearranging existing data blocks.

### D) Messaging Integration

The messaging system already exists (`/messages`, conversations table). Add a "Message Coach" button to the public profile that:
- Creates or finds existing conversation between viewer and coach
- Opens `/messages/:conversationId` or a modal

---

## PHASE 5 -- Admin Tab Cleanup

Minimal changes:
- `/admin-hub` route already uses `AdminRoute` -- verify it checks `admin` role
- Remove the catch-all `<Route path="/admin/*">` redirect that could conflict with `/admin/journey`
- Replace `AdminSidebar` usage in `Header.tsx` mobile menu with a simplified admin nav or reuse `AdminHudSidebar`
- Keep all `/panel/*` redirects (they work correctly)

---

## PHASE 6 -- Translations

Add/update keys in `he.ts` and `en.ts`:
- `coaches.commandCenter` / `coaches.autoPlan` / `coaches.generatePlan`
- `coaches.leadsCount` / `coaches.revenue` / `coaches.nextSessions`
- `coaches.coachSignature` / `coaches.bestFor`
- `nav.dashboard` / `nav.projects` / `nav.coaches` / `nav.business` / `nav.admin`
- Remove `practitionerPanel` references, replace with `coachHub`

---

## Technical Summary

### Files Created
| File | Purpose |
|------|---------|
| `src/navigation/osNav.ts` | Single source of truth for all 5 tabs + sub-routes |
| `src/domain/coaches/mappers.ts` | Identity mappers (future extensibility seam) |
| `src/components/coach/AutoPlanEngineModal.tsx` | Standalone plan generation modal |
| `src/components/coach/CoachSlugRedirect.tsx` | Tiny component for /coach/:slug -> /p/:slug |
| `docs/APP_MAP.md` | Route map |
| `docs/CLEANUP_REPORT.md` | Deletion/move report |

### Files Modified
| File | Change |
|------|--------|
| `src/navigation/navConfig.ts` | Delete (replaced by osNav) |
| `src/components/navigation/TopNavBar.tsx` | Import from osNav |
| `src/components/navigation/BottomTabBar.tsx` | Import from osNav |
| `src/domain/coaches/hooks.ts` | Add useCoachBySlug, useCoachServices, useCoachReviews |
| `src/components/coach/CoachDashboardOverview.tsx` | Add command center cards |
| `src/App.tsx` | Add /coach/:slug redirect, clean admin/* route |
| `src/components/Header.tsx` | Replace AdminSidebar with simplified admin nav |
| `src/components/panel/index.ts` | Remove dead exports |
| `src/i18n/translations/he.ts` | Coach naming + new keys |
| `src/i18n/translations/en.ts` | Coach naming + new keys |
| `src/pages/PractitionerProfile.tsx` | Update labels to "Coach" |

### Files Deleted (~15 dead panel pages)
All legacy `/coach/*` panel pages that have no routes and no imports.

### No Changes To
- Database schema (no migrations)
- Existing RLS policies
- DashboardLayout / sidebar architecture
- Storefront routes (`/p/:slug`)
- Edge functions
- Journey system
