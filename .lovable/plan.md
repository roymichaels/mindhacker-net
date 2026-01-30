

# תוכנית: פאנל מאוחד עם מערכת הרשאות וניהול תפקידים

## סקירה כללית

המטרה: יצירת פאנל אחד מאוחד (`/panel`) שמשרת את כל התפקידים (Admin, Practitioner, Affiliate) עם התאמה אוטומטית של הניווט והתוכן לפי הרשאות המשתמש.

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       UNIFIED PANEL                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    Same Layout, Different Access Levels                             │
│                                                                     │
│    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│    │   ADMIN     │   │ PRACTITIONER│   │  AFFILIATE  │            │
│    ├─────────────┤   ├─────────────┤   ├─────────────┤            │
│    │ • Analytics │   │ • Analytics │   │ • My Links  │            │
│    │ • Users     │   │ • My Clients│   │ • Referrals │            │
│    │ • All Prcts │   │ • Services  │   │ • Payouts   │            │
│    │ • Products  │   │ • Products  │   │ • Stats     │            │
│    │ • Settings  │   │ • Calendar  │   │             │            │
│    │ • Roles Mgmt│   │ • Profile   │   │             │            │
│    │ • Site      │   │ • Earnings  │   │             │            │
│    │ • Content   │   │             │   │             │            │
│    │ • Affiliates│   │             │   │             │            │
│    └─────────────┘   └─────────────┘   └─────────────┘            │
│                                                                     │
│    User with multiple roles sees combined navigation                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ארכיטקטורת ההרשאות

### 1. סכמת תפקידים נוכחית

כבר קיים במערכת:
- `app_role` enum: `'admin' | 'user' | 'practitioner'`
- טבלת `user_roles` עם יחס user → role
- פונקציית `has_role()` לבדיקה

### 2. הוספת role `affiliate` 

```sql
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'affiliate';
```

### 3. מבנה הרשאות דינמי

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      PERMISSIONS SYSTEM                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Roles Table (user_roles):                                          │
│  ┌──────────────┬────────────────┬─────────────┐                   │
│  │   user_id    │     role       │  assigned_at │                   │
│  ├──────────────┼────────────────┼─────────────┤                   │
│  │ dean-uuid    │ admin          │ 2025-01-01  │                   │
│  │ dean-uuid    │ practitioner   │ 2025-01-01  │                   │
│  │ john-uuid    │ practitioner   │ 2025-02-01  │                   │
│  │ sara-uuid    │ affiliate      │ 2025-03-01  │                   │
│  └──────────────┴────────────────┴─────────────┘                   │
│                                                                     │
│  * משתמש יכול להחזיק מספר תפקידים                                   │
│  * Dean = admin + practitioner                                      │
│  * מאמן אחר = practitioner בלבד                                     │
│  * שותף = affiliate בלבד                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. טבלת הרשאות גרנולריות (חדש!)

```sql
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key TEXT NOT NULL,      -- "users.view", "products.edit"
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_key)
);

-- Default permissions per role
INSERT INTO role_permissions (role, permission_key) VALUES
-- Admin - Full access
('admin', 'dashboard.view'),
('admin', 'analytics.view'),
('admin', 'users.view'),
('admin', 'users.edit'),
('admin', 'users.roles'),
('admin', 'practitioners.view'),
('admin', 'practitioners.edit'),
('admin', 'practitioners.approve'),
('admin', 'products.view'),
('admin', 'products.edit'),
('admin', 'products.create'),
('admin', 'content.view'),
('admin', 'content.edit'),
('admin', 'site.settings'),
('admin', 'affiliates.view'),
('admin', 'affiliates.manage'),
('admin', 'leads.view'),
('admin', 'leads.manage'),
('admin', 'aurora.insights'),

-- Practitioner
('practitioner', 'dashboard.view'),
('practitioner', 'analytics.own'),
('practitioner', 'clients.view'),
('practitioner', 'clients.manage'),
('practitioner', 'services.view'),
('practitioner', 'services.edit'),
('practitioner', 'products.own'),
('practitioner', 'calendar.view'),
('practitioner', 'calendar.edit'),
('practitioner', 'earnings.view'),
('practitioner', 'profile.edit'),

-- Affiliate
('affiliate', 'dashboard.view'),
('affiliate', 'links.view'),
('affiliate', 'referrals.view'),
('affiliate', 'payouts.view'),
('affiliate', 'stats.view');
```

---

## מבנה הפאנל המאוחד

### 1. Route Structure

```typescript
// Routes in App.tsx
<Route
  path="/panel"
  element={
    <RoleRoute allowedRoles={['admin', 'practitioner', 'affiliate']}>
      <UnifiedPanel />
    </RoleRoute>
  }
>
  {/* Shared routes */}
  <Route index element={<PanelDashboard />} />
  <Route path="analytics" element={<AnalyticsView />} />
  <Route path="settings" element={<AccountSettings />} />
  
  {/* Admin-only routes */}
  <Route path="users" element={<RequirePermission permission="users.view"><Users /></RequirePermission>} />
  <Route path="roles" element={<RequirePermission permission="users.roles"><RolesManager /></RequirePermission>} />
  <Route path="practitioners" element={<RequirePermission permission="practitioners.view"><PractitionersAdmin /></RequirePermission>} />
  <Route path="site/*" element={<RequirePermission permission="site.settings">...</RequirePermission>} />
  
  {/* Practitioner routes */}
  <Route path="my-clients" element={<RequirePermission permission="clients.view"><MyClients /></RequirePermission>} />
  <Route path="my-services" element={<RequirePermission permission="services.view"><MyServices /></RequirePermission>} />
  <Route path="my-products" element={<RequirePermission permission="products.own"><MyProducts /></RequirePermission>} />
  <Route path="my-calendar" element={<RequirePermission permission="calendar.view"><MyCalendar /></RequirePermission>} />
  <Route path="my-profile" element={<RequirePermission permission="profile.edit"><PractitionerProfile /></RequirePermission>} />
  <Route path="my-earnings" element={<RequirePermission permission="earnings.view"><MyEarnings /></RequirePermission>} />
  
  {/* Affiliate routes */}
  <Route path="my-links" element={<RequirePermission permission="links.view"><AffiliateLinks /></RequirePermission>} />
  <Route path="my-referrals" element={<RequirePermission permission="referrals.view"><MyReferrals /></RequirePermission>} />
  <Route path="my-payouts" element={<RequirePermission permission="payouts.view"><MyPayouts /></RequirePermission>} />
</Route>
```

### 2. סיידבר דינמי לפי תפקיד

```typescript
// UnifiedSidebar.tsx
const navGroups = useMemo(() => {
  const groups: NavGroup[] = [];
  
  // Dashboard - for everyone
  groups.push({
    id: 'dashboard',
    label: t('panel.dashboard'),
    icon: LayoutDashboard,
    items: [
      { to: '/panel', icon: Home, label: t('panel.home') },
      hasPermission('analytics.view') && { to: '/panel/analytics', icon: BarChart3, label: t('panel.analytics') },
    ].filter(Boolean)
  });
  
  // Admin section
  if (hasRole('admin')) {
    groups.push({
      id: 'admin',
      label: t('panel.administration'),
      icon: Shield,
      items: [
        { to: '/panel/users', icon: Users, label: t('panel.users') },
        { to: '/panel/roles', icon: Key, label: t('panel.roles') },
        { to: '/panel/practitioners', icon: UserCog, label: t('panel.practitioners') },
        { to: '/panel/leads', icon: Mail, label: t('panel.leads') },
        { to: '/panel/aurora-insights', icon: Brain, label: 'Aurora Insights' },
      ]
    });
    // ... more admin groups (campaigns, content, site)
  }
  
  // Practitioner section
  if (hasRole('practitioner')) {
    groups.push({
      id: 'my-practice',
      label: t('panel.myPractice'),
      icon: Briefcase,
      items: [
        { to: '/panel/my-clients', icon: Users, label: t('panel.clients') },
        { to: '/panel/my-services', icon: Package, label: t('panel.services') },
        { to: '/panel/my-calendar', icon: Calendar, label: t('panel.calendar') },
        { to: '/panel/my-products', icon: ShoppingBag, label: t('panel.products') },
        { to: '/panel/my-earnings', icon: DollarSign, label: t('panel.earnings') },
        { to: '/panel/my-profile', icon: User, label: t('panel.profile') },
      ]
    });
  }
  
  // Affiliate section
  if (hasRole('affiliate')) {
    groups.push({
      id: 'affiliate',
      label: t('panel.affiliate'),
      icon: Link,
      items: [
        { to: '/panel/my-links', icon: Link, label: t('panel.links') },
        { to: '/panel/my-referrals', icon: UserPlus, label: t('panel.referrals') },
        { to: '/panel/my-payouts', icon: Wallet, label: t('panel.payouts') },
      ]
    });
  }
  
  return groups;
}, [userRoles, permissions]);
```

---

## ניהול תפקידים והרשאות (Admin)

### עמוד חדש: `/panel/roles`

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ניהול תפקידים והרשאות                                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Tabs: משתמשים | תפקידים | הרשאות]                                 │
│                                                                     │
│  ══════════════════════════════════════════════════════════════════ │
│                                                                     │
│  TAB: משתמשים                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 🔍 [חיפוש משתמש...]                                         │   │
│  │                                                              │   │
│  │ ┌──────────────┬──────────────┬─────────────┬───────────┐  │   │
│  │ │ משתמש        │ אימייל       │ תפקידים     │ פעולות    │  │   │
│  │ ├──────────────┼──────────────┼─────────────┼───────────┤  │   │
│  │ │ דין אזולאי   │ dean@...     │ 👑 Admin    │ [ערוך]    │  │   │
│  │ │              │              │ 🎓 Practitioner         │  │   │
│  │ ├──────────────┼──────────────┼─────────────┼───────────┤  │   │
│  │ │ יוחנן כהן    │ john@...     │ 🎓 Practitioner│ [ערוך]  │  │   │
│  │ ├──────────────┼──────────────┼─────────────┼───────────┤  │   │
│  │ │ שרה לוי     │ sara@...     │ 🤝 Affiliate │ [ערוך]    │  │   │
│  │ └──────────────┴──────────────┴─────────────┴───────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ══════════════════════════════════════════════════════════════════ │
│                                                                     │
│  TAB: תפקידים                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  👑 Admin                              [28 הרשאות] [ערוך]   │   │
│  │  ────────────────────────────────────────────────────────   │   │
│  │  גישה מלאה לכל הפאנל ולכל הנתונים                           │   │
│  │                                                              │   │
│  │  🎓 Practitioner                       [12 הרשאות] [ערוך]   │   │
│  │  ────────────────────────────────────────────────────────   │   │
│  │  ניהול הפרקטיקה האישית, לקוחות ושירותים                     │   │
│  │                                                              │   │
│  │  🤝 Affiliate                          [5 הרשאות] [ערוך]    │   │
│  │  ────────────────────────────────────────────────────────   │   │
│  │  צפייה בלינקים, הפניות ותשלומים                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ══════════════════════════════════════════════════════════════════ │
│                                                                     │
│  TAB: הרשאות (Role Editor Dialog)                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  עריכת הרשאות: 🎓 Practitioner                              │   │
│  │                                                              │   │
│  │  📊 Dashboard                                                │   │
│  │     ☑ dashboard.view - צפייה בדשבורד                        │   │
│  │     ☐ analytics.full - אנליטיקס מלא                         │   │
│  │     ☑ analytics.own - אנליטיקס אישי בלבד                    │   │
│  │                                                              │   │
│  │  👥 לקוחות                                                   │   │
│  │     ☑ clients.view - צפייה בלקוחות                          │   │
│  │     ☑ clients.manage - ניהול לקוחות                         │   │
│  │                                                              │   │
│  │  📦 מוצרים                                                   │   │
│  │     ☐ products.all - כל המוצרים                             │   │
│  │     ☑ products.own - מוצרים שלי בלבד                        │   │
│  │                                                              │   │
│  │                              [ביטול] [שמור שינויים]         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Changes

### Migration חדש

```sql
-- 1. Add 'affiliate' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'affiliate';

-- 2. Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_key TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  category TEXT DEFAULT 'general',
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_key)
);

-- 3. Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Admins can manage permissions"
ON public.role_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- 5. Function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID, 
  _permission_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_perm BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id 
      AND rp.permission_key = _permission_key
      AND rp.is_enabled = true
  ) INTO _has_perm;
  
  RETURN _has_perm;
END;
$$;

-- 6. Migrate existing affiliates to user_roles
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'affiliate'::app_role
FROM affiliates
WHERE status = 'active'
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Seed default permissions
INSERT INTO role_permissions (role, permission_key, description, category) VALUES
-- Admin permissions
('admin', 'panel.access', 'גישה לפאנל', 'general'),
('admin', 'analytics.view', 'צפייה באנליטיקס', 'analytics'),
('admin', 'analytics.full', 'אנליטיקס מלא', 'analytics'),
('admin', 'users.view', 'צפייה במשתמשים', 'users'),
('admin', 'users.edit', 'עריכת משתמשים', 'users'),
('admin', 'users.roles', 'ניהול תפקידים', 'users'),
('admin', 'practitioners.view', 'צפייה במאמנים', 'practitioners'),
('admin', 'practitioners.edit', 'עריכת מאמנים', 'practitioners'),
('admin', 'practitioners.approve', 'אישור מאמנים', 'practitioners'),
('admin', 'products.view', 'צפייה במוצרים', 'products'),
('admin', 'products.edit', 'עריכת מוצרים', 'products'),
('admin', 'products.create', 'יצירת מוצרים', 'products'),
('admin', 'content.view', 'צפייה בתוכן', 'content'),
('admin', 'content.edit', 'עריכת תוכן', 'content'),
('admin', 'site.settings', 'הגדרות אתר', 'site'),
('admin', 'site.theme', 'עיצוב אתר', 'site'),
('admin', 'site.landing', 'דפי נחיתה', 'site'),
('admin', 'affiliates.view', 'צפייה בשותפים', 'affiliates'),
('admin', 'affiliates.manage', 'ניהול שותפים', 'affiliates'),
('admin', 'leads.view', 'צפייה בלידים', 'leads'),
('admin', 'leads.manage', 'ניהול לידים', 'leads'),
('admin', 'newsletter.view', 'צפייה בניוזלטר', 'newsletter'),
('admin', 'newsletter.send', 'שליחת ניוזלטר', 'newsletter'),
('admin', 'aurora.insights', 'Aurora Insights', 'aurora'),

-- Practitioner permissions
('practitioner', 'panel.access', 'גישה לפאנל', 'general'),
('practitioner', 'analytics.own', 'אנליטיקס אישי', 'analytics'),
('practitioner', 'clients.view', 'צפייה בלקוחות', 'clients'),
('practitioner', 'clients.manage', 'ניהול לקוחות', 'clients'),
('practitioner', 'services.view', 'צפייה בשירותים', 'services'),
('practitioner', 'services.edit', 'עריכת שירותים', 'services'),
('practitioner', 'products.own', 'מוצרים שלי', 'products'),
('practitioner', 'calendar.view', 'צפייה ביומן', 'calendar'),
('practitioner', 'calendar.edit', 'עריכת יומן', 'calendar'),
('practitioner', 'earnings.view', 'צפייה בהכנסות', 'earnings'),
('practitioner', 'profile.edit', 'עריכת פרופיל', 'profile'),

-- Affiliate permissions
('affiliate', 'panel.access', 'גישה לפאנל', 'general'),
('affiliate', 'links.view', 'צפייה בלינקים', 'links'),
('affiliate', 'referrals.view', 'צפייה בהפניות', 'referrals'),
('affiliate', 'payouts.view', 'צפייה בתשלומים', 'payouts'),
('affiliate', 'stats.view', 'צפייה בסטטיסטיקות', 'stats');
```

---

## קומפוננטות חדשות

| קומפוננטה | תיאור |
|-----------|--------|
| `src/components/panel/UnifiedPanel.tsx` | Layout הראשי של הפאנל |
| `src/components/panel/UnifiedSidebar.tsx` | סיידבר דינמי לפי תפקידים |
| `src/components/panel/PanelDashboard.tsx` | דשבורד מותאם לתפקיד |
| `src/components/RoleRoute.tsx` | Route wrapper לתפקידים |
| `src/components/RequirePermission.tsx` | Wrapper לבדיקת הרשאה ספציפית |
| `src/pages/panel/RolesManager.tsx` | ניהול תפקידים והרשאות |
| `src/pages/panel/MyClients.tsx` | לקוחות של מאמן |
| `src/pages/panel/MyServices.tsx` | שירותים של מאמן |
| `src/pages/panel/MyCalendar.tsx` | יומן מאמן |
| `src/pages/panel/MyEarnings.tsx` | הכנסות מאמן/שותף |
| `src/pages/panel/AffiliateLinks.tsx` | לינקים של שותף |
| `src/hooks/useUserRoles.ts` | Hook לקבלת תפקידי המשתמש |
| `src/hooks/usePermissions.ts` | Hook לבדיקת הרשאות |

---

## עדכונים לקוד קיים

| קובץ | שינוי |
|------|-------|
| `src/App.tsx` | הוספת routes של `/panel/*` |
| `src/contexts/AuthContext.tsx` | הוספת `roles` ו-`permissions` ל-context |
| `src/components/AdminRoute.tsx` | שינוי ל-`RoleRoute` גנרי |
| `src/pages/AffiliateDashboard.tsx` | redirect ל-`/panel` |
| `src/pages/AdminDashboard.tsx` | redirect ל-`/panel` או deprecate |
| `src/i18n/translations/*.ts` | הוספת תרגומים לפאנל |

---

## זרימת מעבר

### Backward Compatibility

```text
/admin/*         →  Redirect to /panel/* (for admins)
/affiliate-dashboard  →  Redirect to /panel (for affiliates)

Legacy routes continue to work but redirect to new unified panel
```

### תהליך הענקת תפקיד

```text
1. Admin goes to /panel/roles
2. Searches for user
3. Clicks "Edit Roles"
4. Toggles roles (admin/practitioner/affiliate)
5. Saves → user_roles table updated
6. User's next login shows new navigation
```

---

## שלבי יישום

### שלב 1: Database Foundation
- [ ] Migration להוספת `affiliate` ל-enum
- [ ] יצירת טבלת `role_permissions`
- [ ] פונקציית `has_permission()`
- [ ] Seed default permissions

### שלב 2: Hooks & Context
- [ ] `useUserRoles` - שליפת תפקידי המשתמש
- [ ] `usePermissions` - בדיקת הרשאות
- [ ] עדכון `AuthContext` עם roles

### שלב 3: Route Components
- [ ] `RoleRoute` - wrapper לנתיבים מוגנים
- [ ] `RequirePermission` - wrapper לתת-נתיבים

### שלב 4: Unified Panel
- [ ] `UnifiedPanel` layout
- [ ] `UnifiedSidebar` דינמי
- [ ] `PanelDashboard` מותאם

### שלב 5: Roles Management
- [ ] `/panel/roles` page
- [ ] Users list with roles
- [ ] Role editor dialog
- [ ] Permission editor

### שלב 6: Practitioner Pages
- [ ] My Clients
- [ ] My Services
- [ ] My Calendar
- [ ] My Earnings
- [ ] My Profile

### שלב 7: Affiliate Integration
- [ ] העברת AffiliateDashboard לפאנל
- [ ] Redirect מהנתיב הישן

### שלב 8: Legacy Redirects
- [ ] `/admin/*` → `/panel/*`
- [ ] `/affiliate-dashboard` → `/panel`

---

## סיכום טכני

| פריט | כמות |
|------|------|
| טבלאות DB חדשות | 1 (role_permissions) |
| פונקציות DB חדשות | 1 (has_permission) |
| קומפוננטות חדשות | 12 |
| דפים חדשים | 8 |
| Hooks חדשים | 2 |
| עדכונים לקבצים קיימים | 6 |
| Roles | 4 (admin, user, practitioner, affiliate) |
| Permissions | ~40 |

