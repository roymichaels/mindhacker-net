-- Add 'practitioner' to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'practitioner';

-- Create practitioners table
CREATE TABLE public.practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  display_name TEXT NOT NULL,
  display_name_en TEXT,
  title TEXT NOT NULL,
  title_en TEXT,
  short_name TEXT,
  short_name_en TEXT,
  bio TEXT,
  bio_en TEXT,
  
  -- Media
  avatar_url TEXT,
  hero_image_url TEXT,
  intro_video_url TEXT,
  
  -- Contact & Social
  whatsapp TEXT,
  calendly_url TEXT,
  instagram_url TEXT,
  website_url TEXT,
  
  -- Location & Availability
  country TEXT DEFAULT 'Israel',
  languages TEXT[] DEFAULT ARRAY['he']::TEXT[],
  timezone TEXT DEFAULT 'Asia/Jerusalem',
  
  -- Platform settings
  slug TEXT UNIQUE NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  
  -- Commission
  commission_rate DECIMAL DEFAULT 20,
  
  -- Stats
  clients_count INTEGER DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_practitioner UNIQUE (user_id)
);

-- Create practitioner_specialties table
CREATE TABLE public.practitioner_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  specialty_label TEXT NOT NULL,
  specialty_label_en TEXT,
  years_experience INTEGER DEFAULT 0,
  certification_name TEXT,
  certification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practitioner_services table
CREATE TABLE public.practitioner_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('session', 'package', 'product')),
  price DECIMAL NOT NULL,
  price_currency TEXT DEFAULT 'ILS',
  duration_minutes INTEGER,
  sessions_count INTEGER,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create practitioner_reviews table
CREATE TABLE public.practitioner_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_practitioner_review UNIQUE (practitioner_id, user_id)
);

-- Add practitioner_id to content_products
ALTER TABLE public.content_products
ADD COLUMN practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL;

-- Add practitioner_id to purchases
ALTER TABLE public.purchases
ADD COLUMN practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practitioners
CREATE POLICY "Anyone can view active practitioners"
ON public.practitioners FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can view all practitioners"
ON public.practitioners FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Practitioner can view own profile"
ON public.practitioners FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Practitioner can update own profile"
ON public.practitioners FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all practitioners"
ON public.practitioners FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_specialties
CREATE POLICY "Anyone can view specialties of active practitioners"
ON public.practitioner_specialties FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.status = 'active'
));

CREATE POLICY "Practitioner can manage own specialties"
ON public.practitioner_specialties FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all specialties"
ON public.practitioner_specialties FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_services
CREATE POLICY "Anyone can view active services of active practitioners"
ON public.practitioner_services FOR SELECT
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.status = 'active'
));

CREATE POLICY "Practitioner can manage own services"
ON public.practitioner_services FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.practitioners p 
  WHERE p.id = practitioner_id AND p.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all services"
ON public.practitioner_services FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for practitioner_reviews
CREATE POLICY "Anyone can view approved reviews"
ON public.practitioner_reviews FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create their own reviews"
ON public.practitioner_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.practitioner_reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.practitioner_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_practitioners_slug ON public.practitioners(slug);
CREATE INDEX idx_practitioners_status ON public.practitioners(status);
CREATE INDEX idx_practitioners_featured ON public.practitioners(is_featured) WHERE is_featured = true;
CREATE INDEX idx_practitioner_specialties_practitioner ON public.practitioner_specialties(practitioner_id);
CREATE INDEX idx_practitioner_services_practitioner ON public.practitioner_services(practitioner_id);
CREATE INDEX idx_practitioner_reviews_practitioner ON public.practitioner_reviews(practitioner_id);
CREATE INDEX idx_content_products_practitioner ON public.content_products(practitioner_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_practitioners_updated_at
BEFORE UPDATE ON public.practitioners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioner_services_updated_at
BEFORE UPDATE ON public.practitioner_services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioner_reviews_updated_at
BEFORE UPDATE ON public.practitioner_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update practitioner stats
CREATE OR REPLACE FUNCTION public.update_practitioner_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.practitioners
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = NEW.practitioner_id AND is_approved = true
      ),
      reviews_count = (
        SELECT COUNT(*) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = NEW.practitioner_id AND is_approved = true
      ),
      updated_at = NOW()
    WHERE id = NEW.practitioner_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.practitioners
    SET 
      rating = (
        SELECT COALESCE(AVG(rating), 0) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = OLD.practitioner_id AND is_approved = true
      ),
      reviews_count = (
        SELECT COUNT(*) 
        FROM public.practitioner_reviews 
        WHERE practitioner_id = OLD.practitioner_id AND is_approved = true
      ),
      updated_at = NOW()
    WHERE id = OLD.practitioner_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger to update practitioner stats on review changes
CREATE TRIGGER update_practitioner_stats_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.practitioner_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_practitioner_stats();