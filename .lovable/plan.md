

# Final Tightening Pass: One Organism

## What's Left (the grep truth)

| Smell | Count | Risk |
|-------|-------|------|
| UI components calling `.from('practitioner_*')` directly (bypassing domain) | 8 files | Drift guarantee |
| `src/components/practitioners/` folder still exists (7 files) | 7 files | Vocabulary confusion |
| `PractitionersModalContext.tsx` still exists (duplicate of CoachesModalContext) | 1 file | Two modal systems |
| Translation keys using `practitioners.*` / `practitionerLanding.*` | 2 files | User-facing label leak |
| `PractitionerContext.tsx` / `PractitionerAuthContext.tsx` naming | 2 files | Internal confusion |
| Panel barrel imports still referenced | 2 files | Dead weight |

---

## Action 1: Route all coach DB access through domain layer

**Files to update** (move `.from('practitioner_*')` calls into `src/domain/coaches/hooks.ts`):

- `src/components/coach/CoachDashboardOverview.tsx` -- uses `practitioner_reviews` directly. Replace with `useCoachReviews` from domain.
- `src/components/coach/CoachActivitySidebar.tsx` -- uses `practitioner_clients` and `practitioner_reviews` directly. Create `useCoachActivityFeed` in domain hooks.
- `src/components/coach/CoachProductsTab.tsx` -- uses `practitioner_services` directly. Replace with `useCoachServices`.
- `src/components/coach/CoachSettingsTab.tsx` -- uses `practitioners` and `practitioner_settings` directly. Create `useCoachSettings` in domain hooks.
- `src/components/coach/CoachMarketingTab.tsx` -- uses `practitioner_reviews` directly. Replace with `useCoachReviews`.
- `src/components/coaches/CoachBookingView.tsx` -- uses `practitioner_availability` directly. Create `useCoachAvailability` in domain hooks.
- `src/hooks/useCoachClients.ts` -- uses `practitioner_clients` directly. Move query logic into domain layer, re-export from there.

The base `src/hooks/usePractitioners.ts` stays as-is -- it IS the domain data layer. But it gets re-exported only through `src/domain/coaches/hooks.ts`.

**New hooks added to `src/domain/coaches/hooks.ts`:**
- `useCoachReviewStats(coachId)` -- replaces inline review queries
- `useCoachActivityFeed(coachId)` -- replaces inline activity queries
- `useCoachSettings()` -- replaces inline settings queries
- `useCoachAvailability(coachId)` -- replaces inline availability query

---

## Action 2: Eliminate duplicate practitioners components/context

**Delete `src/contexts/PractitionersModalContext.tsx`**
- Only imported by `FeaturedPractitioners.tsx`
- `CoachesModalContext.tsx` already re-exports `usePractitionersModal` as deprecated alias

**Update `src/components/practitioners/FeaturedPractitioners.tsx`**
- Change import from `PractitionersModalContext` to `CoachesModalContext`
- Rename `openPractitioners` call to `openCoaches`

**Consolidate `src/components/practitioners/` folder:**
- These 7 files are legacy duplicates of `src/components/coaches/` equivalents
- `PractitionersModal.tsx` -> already duplicated by `CoachesModal.tsx`
- `PractitionerCard.tsx` -> already duplicated by `CoachCard.tsx`
- `PractitionerDetailView.tsx` -> already duplicated by `CoachDetailView.tsx`
- `PractitionerBookingView.tsx` -> already duplicated by `CoachBookingView.tsx`
- `PractitionerReviewSlider.tsx` -> already duplicated by `CoachReviewSlider.tsx`
- `PractitionerMiniItemCard.tsx` -> check if imported; if only by practitioners folder, delete
- `FeaturedPractitioners.tsx` -> update imports to use coaches versions, rename to `FeaturedCoaches.tsx`
- Delete `src/components/practitioners/index.ts`

After: the `src/components/practitioners/` folder is deleted entirely.

---

## Action 3: Rename storefront contexts (internal naming)

**`src/contexts/PractitionerContext.tsx`:**
- Rename exports: `usePractitioner` -> `useCoachStorefront`, `PractitionerProvider` -> `CoachStorefrontProvider`
- Add deprecated re-exports for safety
- Update all 10 storefront consumers

**`src/contexts/PractitionerAuthContext.tsx`:**
- Rename exports: `usePractitionerAuth` -> `useCoachAuth`, `PractitionerAuthProvider` -> `CoachAuthProvider`
- Add deprecated re-exports
- Update all 6 storefront consumers

---

## Action 4: Translation key cleanup

**In both `en.ts` and `he.ts`:**

| Old Key | New Key | Action |
|---------|---------|--------|
| `header.practitionerPanel` | `header.coachPanel` | Rename |
| `practitioners.*` (whole section) | `coaches.*` | Rename section key |
| `practitionerLanding.*` | `coachLanding.*` | Rename section key |
| `panel.role.practitioner` | `panel.role.coach` | Rename |
| `panel.roleDescription.practitioner` | `panel.roleDescription.coach` | Rename |
| `homepage.featuredPractitionersTitle` | `homepage.featuredCoachesTitle` | Rename |
| `homepage.featuredPractitionersSubtitle` | `homepage.featuredCoachesSubtitle` | Rename |
| `homepage.viewAllPractitioners` | `homepage.viewAllCoaches` | Rename |
| User-facing strings: "Practitioner not found" | "Coach not found" | Update value |
| User-facing strings: "Featured Practitioners" | "Featured Coaches" | Update value |
| User-facing strings: "No practitioners found" | "No coaches found" | Update value |

All consumers using `t('practitioners.*')` updated to `t('coaches.*')` (or keep old keys as aliases during transition).

---

## Action 5: Canonical route comment block

Add a clear comment block in `App.tsx` routing section:

```text
/* ── Canonical Routes ──
 * /p/:slug          -> Coach public profile (CANONICAL)
 * /coach/:slug      -> Alias, redirects to /p/:slug
 * /practitioners    -> Alias, redirects to /coaches
 * /panel/*          -> Legacy, all redirect to /admin-hub
 * /coach/*          -> Legacy, all redirect to /coaches
 */
```

Remove `/practitioner/:slug` if it exists. Only `/p/:slug` (canonical) and `/coach/:slug` (alias) remain.

---

## Action 6: Clean deprecated re-exports in coaches barrel

**`src/components/coaches/index.ts`** -- remove deprecated practitioner aliases:
- Remove `export { default as PractitionerReviewSlider }`
- Remove `export { default as PractitionerBookingView }`
- Remove `export { PractitionersModal }`

**`src/domain/coaches/index.ts`** -- ensure clean exports, no practitioner naming leaking.

---

## Files Summary

### Created
| File | Purpose |
|------|---------|
| None new -- all changes go into existing files | |

### Modified (~25 files)
| File | Change |
|------|--------|
| `src/domain/coaches/hooks.ts` | Add useCoachReviewStats, useCoachActivityFeed, useCoachSettings, useCoachAvailability |
| `src/components/coach/CoachDashboardOverview.tsx` | Use domain hooks instead of direct DB |
| `src/components/coach/CoachActivitySidebar.tsx` | Use domain hooks |
| `src/components/coach/CoachProductsTab.tsx` | Use domain hooks |
| `src/components/coach/CoachSettingsTab.tsx` | Use domain hooks |
| `src/components/coach/CoachMarketingTab.tsx` | Use domain hooks |
| `src/components/coaches/CoachBookingView.tsx` | Use domain hooks |
| `src/hooks/useCoachClients.ts` | Move core queries to domain, keep as re-export |
| `src/contexts/PractitionerContext.tsx` | Rename exports to Coach* |
| `src/contexts/PractitionerAuthContext.tsx` | Rename exports to Coach* |
| 6x storefront files | Update imports to new context names |
| `src/i18n/translations/en.ts` | Rename practitioner keys to coach |
| `src/i18n/translations/he.ts` | Same |
| `src/components/coaches/index.ts` | Remove deprecated aliases |
| `src/App.tsx` | Add canonical route comments, clean aliases |

### Deleted (~9 files)
| File | Reason |
|------|--------|
| `src/contexts/PractitionersModalContext.tsx` | Duplicate of CoachesModalContext |
| `src/components/practitioners/PractitionersModal.tsx` | Duplicate of CoachesModal |
| `src/components/practitioners/PractitionerCard.tsx` | Duplicate of CoachCard |
| `src/components/practitioners/PractitionerDetailView.tsx` | Duplicate of CoachDetailView |
| `src/components/practitioners/PractitionerBookingView.tsx` | Duplicate of CoachBookingView |
| `src/components/practitioners/PractitionerReviewSlider.tsx` | Duplicate of CoachReviewSlider |
| `src/components/practitioners/PractitionerMiniItemCard.tsx` | Unused or duplicate |
| `src/components/practitioners/FeaturedPractitioners.tsx` | Replaced by FeaturedCoaches (in coaches/) |
| `src/components/practitioners/index.ts` | Folder deleted |

### NOT Changed
- Database tables (all stay as `practitioner_*`)
- `src/hooks/usePractitioners.ts` (stays as base data layer, only accessed via domain)
- Edge functions
- Visual layouts / sidebar structure
- RLS policies

---

## Rule After This Pass

> **No file outside `src/domain/coaches/` and `src/hooks/usePractitioners.ts` may call `.from('practitioner_*')`.** All coach data flows through the domain adapter layer.

This eliminates the vocabulary split and guarantees the next feature build won't fight legacy naming.
