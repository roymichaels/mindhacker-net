-- Step 2: Create role_permissions table and seed permissions

-- 1. Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
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

-- 2. Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Admins can manage permissions"
ON public.role_permissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- 4. Function to check permission
CREATE OR REPLACE FUNCTION public.has_permission(
  _user_id UUID, 
  _permission_key TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id 
      AND rp.permission_key = _permission_key
      AND rp.is_enabled = true
  )
$$;

-- 5. Migrate existing affiliates to user_roles
INSERT INTO user_roles (user_id, role)
SELECT user_id, 'affiliate'::app_role
FROM affiliates
WHERE status = 'active'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Seed default permissions
INSERT INTO role_permissions (role, permission_key, description, description_en, category) VALUES
-- Admin permissions
('admin', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('admin', 'analytics.view', 'צפייה באנליטיקס', 'View analytics', 'analytics'),
('admin', 'analytics.full', 'אנליטיקס מלא', 'Full analytics', 'analytics'),
('admin', 'users.view', 'צפייה במשתמשים', 'View users', 'users'),
('admin', 'users.edit', 'עריכת משתמשים', 'Edit users', 'users'),
('admin', 'users.roles', 'ניהול תפקידים', 'Manage roles', 'users'),
('admin', 'practitioners.view', 'צפייה במאמנים', 'View practitioners', 'practitioners'),
('admin', 'practitioners.edit', 'עריכת מאמנים', 'Edit practitioners', 'practitioners'),
('admin', 'practitioners.approve', 'אישור מאמנים', 'Approve practitioners', 'practitioners'),
('admin', 'products.view', 'צפייה במוצרים', 'View products', 'products'),
('admin', 'products.edit', 'עריכת מוצרים', 'Edit products', 'products'),
('admin', 'products.create', 'יצירת מוצרים', 'Create products', 'products'),
('admin', 'content.view', 'צפייה בתוכן', 'View content', 'content'),
('admin', 'content.edit', 'עריכת תוכן', 'Edit content', 'content'),
('admin', 'site.settings', 'הגדרות אתר', 'Site settings', 'site'),
('admin', 'site.theme', 'עיצוב אתר', 'Site theme', 'site'),
('admin', 'site.landing', 'דפי נחיתה', 'Landing pages', 'site'),
('admin', 'affiliates.view', 'צפייה בשותפים', 'View affiliates', 'affiliates'),
('admin', 'affiliates.manage', 'ניהול שותפים', 'Manage affiliates', 'affiliates'),
('admin', 'leads.view', 'צפייה בלידים', 'View leads', 'leads'),
('admin', 'leads.manage', 'ניהול לידים', 'Manage leads', 'leads'),
('admin', 'newsletter.view', 'צפייה בניוזלטר', 'View newsletter', 'newsletter'),
('admin', 'newsletter.send', 'שליחת ניוזלטר', 'Send newsletter', 'newsletter'),
('admin', 'aurora.insights', 'תובנות Aurora', 'Aurora Insights', 'aurora'),
('admin', 'recordings.view', 'צפייה בהקלטות', 'View recordings', 'recordings'),
('admin', 'recordings.manage', 'ניהול הקלטות', 'Manage recordings', 'recordings'),

-- Practitioner permissions
('practitioner', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('practitioner', 'analytics.own', 'אנליטיקס אישי', 'Own analytics', 'analytics'),
('practitioner', 'clients.view', 'צפייה בלקוחות', 'View clients', 'clients'),
('practitioner', 'clients.manage', 'ניהול לקוחות', 'Manage clients', 'clients'),
('practitioner', 'services.view', 'צפייה בשירותים', 'View services', 'services'),
('practitioner', 'services.edit', 'עריכת שירותים', 'Edit services', 'services'),
('practitioner', 'products.own', 'מוצרים שלי', 'Own products', 'products'),
('practitioner', 'calendar.view', 'צפייה ביומן', 'View calendar', 'calendar'),
('practitioner', 'calendar.edit', 'עריכת יומן', 'Edit calendar', 'calendar'),
('practitioner', 'earnings.view', 'צפייה בהכנסות', 'View earnings', 'earnings'),
('practitioner', 'profile.edit', 'עריכת פרופיל', 'Edit profile', 'profile'),

-- Affiliate permissions
('affiliate', 'panel.access', 'גישה לפאנל', 'Panel access', 'general'),
('affiliate', 'links.view', 'צפייה בלינקים', 'View links', 'links'),
('affiliate', 'referrals.view', 'צפייה בהפניות', 'View referrals', 'referrals'),
('affiliate', 'payouts.view', 'צפייה בתשלומים', 'View payouts', 'payouts'),
('affiliate', 'stats.view', 'צפייה בסטטיסטיקות', 'View stats', 'stats')
ON CONFLICT (role, permission_key) DO NOTHING;

-- 7. Add updated_at trigger
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();