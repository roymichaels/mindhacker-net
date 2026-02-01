-- ============================================
-- Multi-Tenant Practitioner Platform Tables
-- ============================================

-- 1. Practitioner Settings (Domain, Branding, Landing Page)
CREATE TABLE public.practitioner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  
  -- Domain Configuration
  custom_domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  domain_verified BOOLEAN DEFAULT false,
  
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  brand_color TEXT DEFAULT '#e91e63',
  brand_color_secondary TEXT,
  
  -- Landing Page Config
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  hero_image_url TEXT,
  about_section JSONB DEFAULT '{}',
  
  -- Feature Toggles
  enable_courses BOOLEAN DEFAULT true,
  enable_services BOOLEAN DEFAULT true,
  enable_products BOOLEAN DEFAULT true,
  enable_community BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Settings
  default_language TEXT DEFAULT 'he',
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  
  -- Social Links
  social_links JSONB DEFAULT '{}',
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(practitioner_id)
);

-- 2. Practitioner Client Profiles (Isolated per practitioner)
CREATE TABLE public.practitioner_client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  
  -- Profile data scoped to this practitioner
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  total_purchases NUMERIC(10,2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, practitioner_id)
);

-- 3. Enable RLS
ALTER TABLE public.practitioner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_client_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for practitioner_settings
-- Practitioners can manage their own settings
CREATE POLICY "Practitioners manage own settings"
ON public.practitioner_settings FOR ALL TO authenticated
USING (practitioner_id = public.get_practitioner_id_for_user(auth.uid()))
WITH CHECK (practitioner_id = public.get_practitioner_id_for_user(auth.uid()));

-- Public read for domain lookup (needed for routing)
CREATE POLICY "Anyone can read settings for domain lookup"
ON public.practitioner_settings FOR SELECT TO anon, authenticated
USING (true);

-- 5. RLS Policies for practitioner_client_profiles
-- Practitioners can view/manage their own client profiles
CREATE POLICY "Practitioners manage own client profiles"
ON public.practitioner_client_profiles FOR ALL TO authenticated
USING (practitioner_id = public.get_practitioner_id_for_user(auth.uid()))
WITH CHECK (practitioner_id = public.get_practitioner_id_for_user(auth.uid()));

-- Clients can view their own profile per practitioner
CREATE POLICY "Clients view own profiles"
ON public.practitioner_client_profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Clients can update their own profile (limited fields)
CREATE POLICY "Clients update own profile"
ON public.practitioner_client_profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Indexes for performance
CREATE INDEX idx_practitioner_settings_domain ON public.practitioner_settings(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX idx_practitioner_settings_subdomain ON public.practitioner_settings(subdomain) WHERE subdomain IS NOT NULL;
CREATE INDEX idx_practitioner_settings_practitioner ON public.practitioner_settings(practitioner_id);
CREATE INDEX idx_practitioner_client_profiles_practitioner ON public.practitioner_client_profiles(practitioner_id);
CREATE INDEX idx_practitioner_client_profiles_user ON public.practitioner_client_profiles(user_id);
CREATE INDEX idx_practitioner_client_profiles_status ON public.practitioner_client_profiles(status);

-- 7. Updated at trigger for practitioner_settings
CREATE TRIGGER update_practitioner_settings_updated_at
  BEFORE UPDATE ON public.practitioner_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Updated at trigger for practitioner_client_profiles
CREATE TRIGGER update_practitioner_client_profiles_updated_at
  BEFORE UPDATE ON public.practitioner_client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Function to get practitioner by domain
CREATE OR REPLACE FUNCTION public.get_practitioner_by_domain(domain_input TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT practitioner_id
  FROM practitioner_settings
  WHERE custom_domain = domain_input
     OR subdomain = domain_input
  LIMIT 1;
$$;

-- 10. Auto-create settings when practitioner is created
CREATE OR REPLACE FUNCTION public.auto_create_practitioner_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO practitioner_settings (practitioner_id, subdomain)
  VALUES (NEW.id, NEW.slug)
  ON CONFLICT (practitioner_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER create_practitioner_settings_on_insert
  AFTER INSERT ON public.practitioners
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_practitioner_settings();