

# Launch Readiness Tighten Pass -- Analysis & Patch Plan

---

## TASK A: Route & Redirect Audit

### Complete Route Table (from App.tsx)

| Route | Target | Status | Notes |
|-------|--------|--------|-------|
| `/` | Index | CANONICAL | |
| `/signup` | Redirect -> `/` | ALIAS | Auth is modal-based |
| `/login` | Redirect -> `/` | ALIAS | Auth is modal-based |
| `/courses` | Courses | CANONICAL | |
| `/courses/:slug` | CourseDetail | CANONICAL | |
| `/courses/:slug/watch` | CourseWatch | CANONICAL | |
| `/subscriptions` | Subscriptions | CANONICAL | |
| `/install` | Install | CANONICAL | |
| `/audio/:token` | AudioPlayer | CANONICAL | |
| `/video/:token` | VideoPlayer | CANONICAL | |
| `/personal-hypnosis` | PersonalHypnosisLanding | CANONICAL | |
| `/consciousness-leap` | ConsciousnessLeapLanding | CANONICAL | |
| `/consciousness-leap/apply/:token` | ConsciousnessLeapApply | CANONICAL | |
| `/form/:token` | FormView | CANONICAL | |
| `/privacy-policy` | PrivacyPolicy | CANONICAL | |
| `/terms-of-service` | TermsOfService | CANONICAL | |
| `/affiliate-signup` | AffiliateSignup | CANONICAL | |
| `/onboarding` | Onboarding | CANONICAL | |
| `/go` | Go | CANONICAL | |
| `/start` | Redirect -> `/onboarding` | LEGACY | |
| `/free-journey` | Redirect -> `/onboarding` | LEGACY | |
| `/free-journey/start` | Redirect -> `/onboarding` | LEGACY | |
| `/free-journey/complete` | Redirect -> `/launchpad/complete` | LEGACY | |
| `/practitioners` | Redirect -> `/coaches` | LEGACY | |
| `/marketplace` | Redirect -> `/coaches` | LEGACY | |
| `/practitioner/:slug` | CoachProfile (renders directly) | **PROBLEM** | Should redirect to `/p/:slug`, not render |
| `/practitioners/:slug` | CoachProfile (renders directly) | **PROBLEM** | Should redirect to `/p/:slug`, not render |
| `/coach/:slug` | CoachSlugRedirect -> `/p/:slug` | ALIAS | Correct behavior |
| `/affiliate-dashboard` | Redirect -> `/affiliate` | LEGACY | |
| `/unsubscribe` | Unsubscribe | CANONICAL | |
| `/community` | Community (protected) | CANONICAL | |
| `/community/post/:id` | CommunityPost | CANONICAL | |
| `/community/events` | CommunityEvents | CANONICAL | |
| `/community/members` | CommunityMembers | CANONICAL | |
| `/community/leaderboard` | CommunityLeaderboard | CANONICAL | |
| `/community/profile/:userId` | CommunityProfile | CANONICAL | |
| `/messages` | Messages (protected) | CANONICAL | |
| `/messages/ai` | MessageThread | CANONICAL | |
| `/messages/:conversationId` | MessageThread | CANONICAL | |
| `/hypnosis` | Redirect -> `/dashboard` | LEGACY | |
| `/lp/:slug` | DynamicLandingPage | CANONICAL | |
| `/p/:practitionerSlug` | StorefrontLayout (nested) | CANONICAL | Route param still named `practitionerSlug` |
| `/p/:practitionerSlug/login` | StorefrontLogin | CANONICAL | |
| `/p/:practitionerSlug/signup` | StorefrontSignup | CANONICAL | |
| `/p/:practitionerSlug/courses` | StorefrontCourses | CANONICAL | |
| `/p/:practitionerSlug/dashboard` | StorefrontClientDashboard | CANONICAL | |
| `/personal-hypnosis/success` | PersonalHypnosisSuccess | CANONICAL | |
| `/personal-hypnosis/pending` | PersonalHypnosisPending | CANONICAL | |
| `/dashboard` | DashboardLayout > UserDashboard | CANONICAL | |
| `/today` | Redirect -> `/dashboard` | LEGACY | |
| `/plan` | Redirect -> `/dashboard` | LEGACY | |
| `/me` | Redirect -> `/dashboard` | LEGACY | |
| `/projects` | ProjectsLayoutWrapper | CANONICAL | |
| `/coaches` | CoachesLayoutWrapper | CANONICAL | |
| `/admin-hub` | AdminLayoutWrapper | CANONICAL | |
| `/launchpad` | Redirect -> `/onboarding` | LEGACY | |
| `/launchpad/complete` | LaunchpadComplete | CANONICAL | |
| `/quests` | Redirect -> `/onboarding` | LEGACY | |
| `/quests/:pillar` | QuestRunnerPage | CANONICAL | |
| `/coaching/journey` | CoachingJourney | CANONICAL | |
| `/coaching/journey/:journeyId` | CoachingJourney | CANONICAL | |
| `/admin/journey` | AdminJourney | CANONICAL | **Conflict**: `/admin/*` also redirects to `/admin-hub` but this specific route is defined first so it works |
| `/admin/journey/:journeyId` | AdminJourney | CANONICAL | Same note |
| `/projects/journey` | ProjectsJourney | CANONICAL | |
| `/projects/journey/:journeyId` | ProjectsJourney | CANONICAL | |
| `/business` | Business | CANONICAL | |
| `/business/journey` | BusinessJourney | CANONICAL | |
| `/business/journey/:journeyId` | BusinessJourney | CANONICAL | |
| `/business/:businessId` | BusinessDashboard | CANONICAL | |
| `/consciousness` | Consciousness | CANONICAL | |
| `/health` | Health | CANONICAL | |
| `/health/journey` | HealthJourney | CANONICAL | |
| `/health/journey/:journeyId` | HealthJourney | CANONICAL | |
| `/health/plan` | HealthPlan | CANONICAL | |
| `/relationships` | Relationships | CANONICAL | |
| `/relationships/journey` | RelationshipsJourney | CANONICAL | |
| `/relationships/journey/:journeyId` | RelationshipsJourney | CANONICAL | |
| `/finances` | Finances | CANONICAL | |
| `/finances/journey` | FinancesJourney | CANONICAL | |
| `/finances/journey/:journeyId` | FinancesJourney | CANONICAL | |
| `/learning` | Learning | CANONICAL | |
| `/learning/journey` | LearningJourney | CANONICAL | |
| `/learning/journey/:journeyId` | LearningJourney | CANONICAL | |
| `/purpose` | Purpose | CANONICAL | |
| `/purpose/journey` | PurposeJourney | CANONICAL | |
| `/purpose/journey/:journeyId` | PurposeJourney | CANONICAL | |
| `/hobbies` | Hobbies | CANONICAL | |
| `/hobbies/journey` | HobbiesJourney | CANONICAL | |
| `/hobbies/journey/:journeyId` | HobbiesJourney | CANONICAL | |
| `/success` | Success | CANONICAL | |
| `/admin` | Redirect -> `/admin-hub` | LEGACY | |
| `/admin/*` | Redirect -> `/admin-hub` | LEGACY | |
| `/panel` | Redirect -> `/admin-hub` | LEGACY | |
| `/panel/*` (16 specific routes) | Redirect -> `/admin-hub?tab=...` | LEGACY | |
| `/panel/*` (catch-all) | Redirect -> `/admin-hub` | LEGACY | |
| `/coach` | Redirect -> `/coaches` | LEGACY | |
| `/coach/*` | Redirect -> `/coaches` | LEGACY | |
| `/affiliate` | AffiliatePanel (nested) | CANONICAL | Role-gated |
| `/affiliate/links` | MyLinks | CANONICAL | |
| `/affiliate/referrals` | MyReferrals | CANONICAL | |
| `/affiliate/payouts` | MyPayouts | CANONICAL | |
| `/dev/orb-gallery` | OrbGallery | CANONICAL | Dev only |
| `*` | NotFound | CANONICAL | Catch-all |

### Issues Found

1. **`/practitioner/:slug` and `/practitioners/:slug` render CoachProfile directly** instead of redirecting to `/p/:slug`. This creates duplicate rendering of the same page at 3 different URLs -- bad for SEO and inconsistent with the `/coach/:slug` redirect pattern.

2. **Unused lazy import**: `RolesManager` is imported on line 103 of App.tsx but never used in any `<Route>`. It is only consumed by `src/domain/admin/tabConfig.ts` which has its own lazy import.

3. **Route param naming**: `/p/:practitionerSlug` still uses the old name. This cascades into `PractitionerContext.tsx` and all storefront components reading `practitionerSlug`. This is a medium-risk rename (many files touch it).

4. **Hardcoded links to `/practitioners`**: `PractitionerProfile.tsx` line 84 and `PractitionerProfileHeader.tsx` line 47 link to `/practitioners` (works via redirect, but should point to `/coaches`).

---

## TASK B: Naming & Domain Boundary Audit

### Remaining "practitioner" references outside allowed zones

| File | What | Classification |
|------|------|----------------|
| `src/components/practitioner-landing/` (15 files) | Entire folder with Practitioner-named components | **SHOULD RENAME** to `coach-landing/` or `coach-profile/` |
| `src/pages/PractitionerProfile.tsx` | Page file + component name | **SHOULD RENAME** to `CoachProfile.tsx` |
| `src/contexts/PractitionerContext.tsx` | File name (exports already renamed) | **SHOULD RENAME** file to `CoachStorefrontContext.tsx` |
| `src/contexts/PractitionerAuthContext.tsx` | File name (exports already renamed) | **SHOULD RENAME** file to `CoachAuthContext.tsx` |
| `src/components/coach/CoachHudSidebar.tsx` | Imports from `practitioner-landing`, calls `usePractitioner` directly, calls `.from('practitioners')` and `.from('practitioner_reviews')` directly | **SHOULD FIX** -- use domain hooks |
| `src/pages/storefront/StorefrontHome.tsx` | Calls `.from('practitioner_services')` and `.from('practitioner_reviews')` directly | **SHOULD FIX** -- use domain hooks |
| `src/hooks/useCoachClients.ts` | Calls `.from('practitioner_clients')` directly (4 places) | **SHOULD FIX** -- move to domain hooks |
| `src/hooks/useCoachClientView.ts` | Calls `.from('practitioners')` directly | **SHOULD FIX** -- use domain hooks |
| `src/components/coaches/CoachDetailView.tsx` | Uses `t('practitionerLanding.*')` translation keys, prop named `practitioner` | **SHOULD FIX** keys; prop rename is low priority |
| `src/components/coaches/FeaturedCoaches.tsx` | Deprecated `FeaturedPractitioners` re-export | **DELETE** alias |
| `src/components/coaches/CoachDetailView.tsx` | Deprecated `PractitionerDetailView` re-export | **DELETE** alias |
| `src/components/coaches/CoachMiniItemCard.tsx` | Deprecated `PractitionerMiniItemCard` re-export | **DELETE** alias |
| `src/i18n/translations/en.ts` + `he.ts` | Duplicate keys: `featuredPractitionersTitle`, `featuredPractitionersSubtitle`, `viewAllPractitioners` alongside Coach versions | **DELETE** old keys |
| Route param `practitionerSlug` | In App.tsx, PractitionerContext, and 10 storefront files | **SHOULD RENAME** to `coachSlug` |
| `src/pages/Coaches.tsx` | Calls `useMyPractitionerProfile` directly | **SHOULD FIX** -- use `useMyCoachProfile` from domain |
| `src/components/coach/CoachPlansTab.tsx` | Calls `useMyPractitionerProfile` directly | **SHOULD FIX** -- use domain hook |

### Allowed (DB layer only -- no action needed)

| File | Reason |
|------|--------|
| `src/hooks/usePractitioners.ts` | Base data layer (accessed only via domain re-exports) |
| `src/domain/coaches/hooks.ts` | Domain adapter -- calls `.from('practitioner_*')` by design |
| `src/domain/coaches/types.ts` | Type aliases over Practitioner types |
| `src/domain/coaches/mappers.ts` | Identity mappers |

---

## TASK C: Dead Code & Unused Exports

| Item | Status | Safety Check |
|------|--------|--------------|
| `RolesManager` lazy import in App.tsx (line 103) | **DEAD** -- not used in any Route; admin uses its own lazy import via tabConfig | Confirm no other file imports from App.tsx |
| Deprecated `FeaturedPractitioners` export in `FeaturedCoaches.tsx` | **DEAD** -- no file imports it (old `src/components/practitioners/` was deleted) | Search confirms 0 external imports |
| Deprecated `PractitionerDetailView` export in `CoachDetailView.tsx` | **DEAD** | Same |
| Deprecated `PractitionerMiniItemCard` export in `CoachMiniItemCard.tsx` | **DEAD** | Same |
| Duplicate translation keys (`featuredPractitionersTitle`, etc.) | **DEAD** -- Coach versions exist | Verify no `t('homepage.featuredPractitionersTitle')` calls remain |

---

## Patch Plan (Numbered Steps)

### Step 1: Convert `/practitioner/:slug` and `/practitioners/:slug` from render to redirect
**Files**: `src/App.tsx` (lines 215-216)
**Change**: Replace `<CoachProfile />` with `<Navigate to={'/p/' + slug} replace />` using a small redirect component (or inline redirect similar to CoachSlugRedirect)
**Risk**: LOW -- these routes already work; changing to redirect just consolidates to canonical URL

### Step 2: Remove unused `RolesManager` lazy import from App.tsx
**File**: `src/App.tsx` (line 103)
**Change**: Delete the line `const RolesManager = lazy(() => import("./pages/panel/RolesManager"));`
**Risk**: LOW -- it's never referenced in any Route

### Step 3: Move `CoachHudSidebar.tsx` direct DB calls to domain hooks
**File**: `src/components/coach/CoachHudSidebar.tsx`
**Change**: Replace `.from('practitioners')` and `.from('practitioner_reviews')` calls with `useMyCoachProfile` and `useCoachReviewStats` from domain. Replace import of `usePractitioner` with `useCoach` from domain. Replace import from `practitioner-landing` with domain-level or re-exported components.
**Risk**: LOW -- functional behavior unchanged

### Step 4: Move `StorefrontHome.tsx` direct DB calls to domain hooks
**File**: `src/pages/storefront/StorefrontHome.tsx`
**Change**: Replace `.from('practitioner_services')` and `.from('practitioner_reviews')` with `useCoachServices` and `useCoachReviews` from domain hooks.
**Risk**: LOW

### Step 5: Move `useCoachClients.ts` DB calls into domain layer
**File**: `src/hooks/useCoachClients.ts`
**Change**: Move the 4 `.from('practitioner_clients')` calls into a new `useCoachClientsData` hook in `src/domain/coaches/hooks.ts`. Keep `useCoachClients.ts` as a thin re-export.
**Risk**: LOW

### Step 6: Move `useCoachClientView.ts` DB call into domain layer
**File**: `src/hooks/useCoachClientView.ts`
**Change**: Replace `.from('practitioners')` call with `useMyCoachProfile` from domain.
**Risk**: LOW

### Step 7: Fix direct `useMyPractitionerProfile` calls in UI
**Files**: `src/pages/Coaches.tsx`, `src/components/coach/CoachPlansTab.tsx`
**Change**: Replace `import { useMyPractitionerProfile } from '@/hooks/usePractitioners'` with `import { useMyCoachProfile } from '@/domain/coaches'`
**Risk**: LOW

### Step 8: Rename route param `practitionerSlug` -> `coachSlug`
**Files**: `src/App.tsx` (line 310), `src/contexts/PractitionerContext.tsx` (3 refs), `src/pages/storefront/StorefrontLayout.tsx` (1 ref), all storefront components that destructure `practitionerSlug` from context (10 files)
**Change**: Rename param in route definition and update all consumers. Context property rename with deprecated alias.
**Risk**: MEDIUM -- many files touched, but purely mechanical rename. Must be done atomically.

### Step 9: Rename context files (file names only, exports already renamed)
**Files**: 
- `src/contexts/PractitionerContext.tsx` -> `src/contexts/CoachStorefrontContext.tsx`
- `src/contexts/PractitionerAuthContext.tsx` -> `src/contexts/CoachAuthContext.tsx`
**Change**: Rename files. Update all 10 import paths in storefront components.
**Risk**: LOW -- purely path renames, no logic change

### Step 10: Rename `src/components/practitioner-landing/` folder
**Change**: Rename folder to `src/components/coach-landing/`. Rename component files from `Practitioner*` to `Coach*`. Update barrel `index.ts`. Update 2 consumers (`PractitionerProfile.tsx`, `CoachHudSidebar.tsx`).
**Risk**: MEDIUM -- 15 files renamed, internal cross-references. But no logic change.

### Step 11: Rename `src/pages/PractitionerProfile.tsx` to `CoachProfile.tsx`
**File**: Rename file + update App.tsx lazy import path (line 95)
**Change**: Also update internal component name and translation keys (`practitioners.notFound` -> `coaches.notFound`, `practitionerLanding.backToDirectory` -> `coachLanding.backToDirectory`). Fix link from `/practitioners` to `/coaches`.
**Risk**: LOW

### Step 12: Delete deprecated re-exports and duplicate translation keys
**Files**: 
- `src/components/coaches/FeaturedCoaches.tsx` -- remove `FeaturedPractitioners` export
- `src/components/coaches/CoachDetailView.tsx` -- remove `PractitionerDetailView` export
- `src/components/coaches/CoachMiniItemCard.tsx` -- remove `PractitionerMiniItemCard` export
- `src/i18n/translations/en.ts` + `he.ts` -- remove `featuredPractitionersTitle`, `featuredPractitionersSubtitle`, `viewAllPractitioners` duplicate keys
**Risk**: LOW -- confirmed no consumers

### Step 13: Update translation key references in UI components
**Files**: `src/components/coaches/CoachDetailView.tsx` and any component using `t('practitionerLanding.*')`
**Change**: Update to `t('coachLanding.*')` (these keys already exist from previous pass or need to be added as aliases)
**Risk**: LOW -- verify keys exist before changing

---

### Recommended execution order

**Phase 1 (safe, independent)**:  Steps 1, 2, 7, 12 -- zero risk, no cascading effects

**Phase 2 (domain boundary)**:  Steps 3, 4, 5, 6 -- enforces the adapter rule

**Phase 3 (rename wave, do atomically)**: Steps 8, 9, 10, 11, 13 -- all the `practitioner` -> `coach` naming

