
# Fix "צפה בחנות" (View Storefront) Button

## Problem
The Store button does nothing when clicked because `handleStoreClick` requires `myProfile?.slug` to exist. If the logged-in user is an **admin** (not a practitioner), `useMyPractitionerProfile` returns `null`, so the button silently fails. Since this app was built for a single coach, admins should still be able to view the storefront.

## Solution

### File: `src/components/coach/CoachHudSidebar.tsx`

1. **Add a fallback query** to fetch the first practitioner's slug when `myProfile` is null (admin case):
   - Query `practitioners` table for the first record's slug
   - Use it as fallback: `const storeSlug = myProfile?.slug || fallbackSlug`

2. **Fix `handleStoreClick`** to use the resolved slug and show a toast if no slug is found at all (edge case)

3. **Remove the silent `if` guard** so the button always attempts to navigate and gives feedback if it can't

### File: `src/components/panel/CoachSidebar.tsx` (legacy panel)

4. Apply the same fallback logic so the "הדף שלי" button in `/panel` also works for admins

## What Changes

| Component | Before | After |
|-----------|--------|-------|
| CoachHudSidebar Store btn | Silent no-op for admins | Opens first practitioner's storefront, or shows toast if none exist |
| CoachSidebar (legacy) | Hidden for admins | Shows with fallback slug |

## Technical Detail
- Add a simple `useQuery` that fetches `practitioners.slug` with `limit 1` as a fallback when `myProfile` is null
- The resolved slug is used in both collapsed and expanded Store button variants
- A toast notification is shown if no practitioner exists at all ("No storefront available")
