

# Admin Notifications Fix

## Issues Found

1. **"View all notifications" link goes to wrong route** -- `NotificationPanel.tsx` line 224 navigates to `/admin/notifications`, which gets caught by `<Route path="/admin/*">` and redirects to `/admin-hub` without query params. The user lands on the default dashboard tab instead of the Notifications sub-page.

2. **Missing type labels in NotificationCenter** -- The `getTypeLabel()` function in `NotificationCenter.tsx` is missing entries for `onboarding_completed`, `new_lead`, `journey_completion`, `user_milestone`, `new_consciousness_leap_application`, `new_personal_hypnosis_order`, and `affiliate_referral`. These render as raw English strings in the Hebrew UI.

3. **Missing filter options in NotificationCenter** -- The type dropdown filter only has 6 options and is missing `onboarding_completed` and other active types.

4. **`new_form_submission` in UI code** -- Already fully removed from UI code. Only remains in `types.ts` (auto-generated, untouchable). No action needed.

5. **Onboarding completion trigger** -- Already correctly configured to fire `onboarding_completed` with `/admin-hub?tab=admin&sub=users` link. No action needed.

## Changes

### File 1: `src/components/admin/NotificationPanel.tsx`
- **Line 224**: Change `navigate('/admin/notifications')` to `navigate('/admin-hub?tab=overview&sub=notifications')` so the "View all" button lands on the correct NotificationCenter sub-page.

### File 2: `src/pages/admin/NotificationCenter.tsx`
- **Lines 46-60**: Add missing type labels to `getTypeLabel()`:
  - `onboarding_completed`: 'השלמת כיול'
  - `new_lead`: 'ליד חדש'
  - `journey_completion`: 'השלמת מסע'
  - `user_milestone`: 'אבן דרך'
  - `new_consciousness_leap_application`: 'בקשת קפיצת תודעה'
  - `new_personal_hypnosis_order`: 'הזמנת היפנוזה'
  - `affiliate_referral`: 'הפניית שותף'
- **Lines 176-182**: Add `onboarding_completed` and `new_lead` to the filter dropdown so admins can filter by these active notification types.

## Risk
LOW -- Two files, display-only changes. No logic, no DB, no schema.
