
# Admin & Coach Panel Integration Plan

## Problem Summary

The current system has two parallel admin implementations causing confusion and broken functionality:

1. **Old Admin** (`src/components/admin/AdminSidebar.tsx`) - Feature-rich but unused (routes redirect)
2. **New Panel** (`src/components/panel/AdminSidebar.tsx`) - Simplified, missing key features

Additionally, there are path mismatches, missing Role Switcher in admin, and incorrect links in dashboards.

---

## Strategy: Consolidate to Unified Panel System

Keep the `/panel`, `/coach`, `/affiliate` route structure (as per memory) but upgrade the panel sidebars with the best features from both systems.

---

## Changes Required

### 1. Upgrade Admin Panel Sidebar (`src/components/panel/AdminSidebar.tsx`)

**Add from old admin:**
- Notification badge counts (unread notifications)
- New leads count badges
- Draft campaigns count badges
- Quick action buttons ("New Campaign", "View Leads")
- Translation key usage instead of hardcoded labels
- Role Switcher component at top

**Structure to match:**
```text
┌─────────────────────────────────┐
│  [Role Switcher - if multi-role]│
├─────────────────────────────────┤
│  Quick Actions:                 │
│  [+ New Campaign] [📧 Leads (3)]│
├─────────────────────────────────┤
│  ▼ Overview                     │
│    • Dashboard                  │
│    • Analytics                  │
├─────────────────────────────────┤
│  ▼ Administration               │
│    • Users                      │
│    • Roles                      │
│    • Practitioners              │
│    • Leads (3)                  │
│    • Aurora Insights            │
├─────────────────────────────────┤
│  ▼ Campaigns                    │
│    • Affiliates                 │
│    • Newsletter (2)             │
├─────────────────────────────────┤
│  ▼ Content                      │
│    • Products                   │
│    • Content                    │
│    • Recordings                 │
├─────────────────────────────────┤
│  ▼ Site                         │
│    • Settings                   │
│    • Theme                      │
│    • Landing Pages              │
└─────────────────────────────────┘
│  [Account Dropdown]             │
└─────────────────────────────────┘
```

### 2. Add Missing Routes to Admin Panel

Current `/panel/*` routes are missing some pages the old admin had. Add:
- `/panel/notifications` - Notification Center
- `/panel/forms` - Forms management
- `/panel/videos` - Video management
- `/panel/faqs` - FAQ management
- `/panel/testimonials` - Testimonials
- `/panel/purchases` - Purchase management
- `/panel/homepage` - Homepage sections

### 3. Fix Coach Panel Links in PanelDashboard

The `PanelDashboard.tsx` shows quick action cards for practitioners linking to wrong paths:
- `/panel/my-clients` should be `/coach/clients`
- `/panel/my-calendar` should be `/coach/calendar`
- `/panel/my-earnings` should be `/coach/earnings`

Actually, `PanelDashboard` is only used in `/panel` (admin) route, so these practitioner cards shouldn't appear there. The coach uses `CoachDashboard`.

**Fix:** Remove practitioner/affiliate cards from `PanelDashboard` since it's admin-only, OR fix the links to go to `/coach/*` routes.

### 4. Add RoleSwitcher to Admin Sidebar

Currently only Coach sidebar has `RoleSwitcher`. Add it to Admin sidebar too for consistency.

### 5. Use Translation Keys

Replace hardcoded strings in `src/components/panel/AdminSidebar.tsx` with `t()` calls using existing `admin.*` translation keys.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/panel/AdminSidebar.tsx` | Major rewrite - add badges, quick actions, translations, RoleSwitcher |
| `src/components/panel/PanelDashboard.tsx` | Fix links or remove non-admin cards |
| `src/App.tsx` | Add missing panel routes (notifications, forms, videos, etc.) |

---

## Files to Delete (Cleanup)

| File | Reason |
|------|--------|
| `src/pages/AdminDashboard.tsx` | Unused - admin routes redirect to /panel |
| `src/components/admin/AdminSidebar.tsx` | Deprecated - replaced by panel version |

---

## Implementation Details

### AdminSidebar.tsx Upgrade

```typescript
// Add queries for badge counts
const { data: unreadCount = 0 } = useQuery({
  queryKey: ['admin-unread-notifications'],
  queryFn: async () => {
    const { count } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    return count || 0;
  },
});

const { data: newLeadsCount = 0 } = useQuery({
  queryKey: ['admin-new-leads'],
  queryFn: async () => {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    return count || 0;
  },
});

// Add RoleSwitcher import and use at top of sidebar
import RoleSwitcher from './RoleSwitcher';

// Add Quick Actions section
<div className="p-3 border-b border-border">
  <div className="flex gap-2">
    <Button size="sm" onClick={() => navigate('/panel/newsletter')}>
      <Plus /> {t('admin.quickActions.newCampaign')}
    </Button>
    <Button size="sm" onClick={() => navigate('/panel/leads')}>
      <Mail /> {newLeadsCount > 0 && <Badge>{newLeadsCount}</Badge>}
    </Button>
  </div>
</div>
```

### Route Additions to App.tsx

```tsx
<Route path="notifications" element={<NotificationCenter />} />
<Route path="forms" element={<Forms />} />
<Route path="videos" element={<Videos />} />
<Route path="faqs" element={<FAQs />} />
<Route path="testimonials" element={<Testimonials />} />
<Route path="purchases" element={<Purchases />} />
<Route path="homepage" element={<HomepageSections />} />
<Route path="offers" element={<AdminOffers />} />
<Route path="chat-assistant" element={<ChatAssistant />} />
```

### Sidebar Navigation Update

Add missing items to navGroups array with proper badges:
```typescript
{ to: '/panel/notifications', icon: Bell, label: 'Notifications', labelHe: 'התראות', badge: unreadCount },
{ to: '/panel/leads', icon: Mail, label: 'Leads', labelHe: 'לידים', badge: newLeadsCount },
```

---

## Summary of Changes

1. **Merge features** from old admin sidebar into new panel sidebar
2. **Add missing routes** for all admin pages
3. **Fix/remove** incorrect practitioner links in PanelDashboard
4. **Add RoleSwitcher** to admin panel sidebar
5. **Use translations** instead of hardcoded strings
6. **Clean up** deprecated files

This consolidation maintains the role-based panel separation (`/panel`, `/coach`, `/affiliate`) while ensuring all admin features work correctly through the new `/panel/*` routes.
