

# Fix Admin Notification Links and Deep Integration

## Problem
When clicking notifications in the admin panel, they navigate to generic list pages (e.g., `/admin/users`) instead of the specific resource (e.g., the user's profile). The notification metadata already contains the needed IDs (`user_id`, `form_id`, etc.) but they aren't used for routing.

## Solution

### 1. Update NotificationPanel to build smart deep links

Modify `src/components/admin/NotificationPanel.tsx` to resolve the correct link based on notification `type` and `metadata`:

| Notification Type | Current Link | New Link |
|---|---|---|
| `new_user` | `/admin/users` | `/panel/users/{user_id}` |
| `new_form_submission` | `/admin/forms` | `/panel/forms/{form_id}/submissions/{submission_id}` (or `/panel/forms` if no specific submission route exists) |
| `new_lead` | `/admin/leads` | `/panel/leads` (with optional query param or scroll-to) |
| `new_consciousness_leap_application` | `/admin/consciousness-leap` | `/panel/consciousness-leap` |
| `new_personal_hypnosis_order` | `/admin/recordings` | `/panel/users/{user_id}` |
| `journey_completion` | Already correct | `/panel/users/{user_id}/dashboard` |

A `resolveNotificationLink` helper function will be created that takes the notification type, stored link, and metadata, then returns the best deep link.

### 2. Update database trigger functions for future notifications

Create a migration to update these trigger functions so they store the correct `/panel/...` links going forward:

- `notify_new_user()` -- change link from `/admin/users` to `/panel/users/{user_id}`
- `notify_new_form_submission()` -- change to `/panel/forms` (keeping form context)
- `notify_new_lead()` -- change to `/panel/leads`
- `notify_consciousness_leap_application()` -- change to `/panel/consciousness-leap`
- `notify_consciousness_leap_lead()` -- change to `/panel/consciousness-leap`
- `notify_personal_hypnosis_order()` -- change to `/panel/users/{user_id}` (to see the ordering user)

### 3. Fix existing notification links in the database

Run an UPDATE to fix the links on existing notifications that have `/admin/...` paths, converting them to the correct `/panel/...` paths using the metadata.

### 4. Add notification type icons

Enhance the `NotificationPanel` to show contextual icons per notification type (user icon for new users, file icon for forms, etc.) instead of just a priority dot.

## Technical Details

### Files to modify:
- `src/components/admin/NotificationPanel.tsx` -- add `resolveNotificationLink()` helper and type-specific icons
- New migration SQL -- update trigger functions and fix existing data

### resolveNotificationLink logic:
```text
function resolveNotificationLink(notification):
  switch notification.type:
    'new_user':
      return /panel/users/{metadata.user_id}
    'new_form_submission':
      return /panel/forms
    'new_personal_hypnosis_order':
      return /panel/users/{metadata.user_id}
    'journey_completion':
      return stored link (already correct)
    default:
      return stored link with /admin/ replaced by /panel/
```

