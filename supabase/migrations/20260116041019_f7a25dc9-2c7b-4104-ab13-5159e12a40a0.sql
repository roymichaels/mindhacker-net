-- Create offers table for data-driven product offerings
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  -- Offer Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  subtitle TEXT,
  subtitle_en TEXT,
  description TEXT,
  description_en TEXT,
  
  -- Landing Page Content
  badge_text TEXT,
  badge_text_en TEXT,
  hero_heading TEXT,
  hero_heading_en TEXT,
  hero_subheading TEXT,
  hero_subheading_en TEXT,
  
  -- Pricing
  price NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC,
  original_price NUMERIC,
  original_price_usd NUMERIC,
  
  -- Branding (null = use theme primary color)
  brand_color TEXT DEFAULT NULL,
  
  -- Features & Benefits (JSONB arrays)
  pain_points JSONB DEFAULT '[]',
  process_steps JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  includes JSONB DEFAULT '[]',
  
  -- SEO
  seo_title TEXT,
  seo_title_en TEXT,
  seo_description TEXT,
  seo_description_en TEXT,
  
  -- Landing Page Settings
  landing_page_route TEXT,
  landing_page_enabled BOOLEAN DEFAULT true,
  show_on_homepage BOOLEAN DEFAULT true,
  homepage_order INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  
  -- CTA Configuration
  cta_type TEXT DEFAULT 'checkout',
  cta_text TEXT,
  cta_text_en TEXT,
  cta_link TEXT,
  
  -- Form Association (for lead capture offers)
  form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT DEFAULT 'draft',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public read access for active offers
CREATE POLICY "Anyone can view active offers" 
ON public.offers 
FOR SELECT 
USING (status = 'active' AND landing_page_enabled = true);

-- Admin full access
CREATE POLICY "Admins can manage offers" 
ON public.offers 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create index for faster lookups
CREATE INDEX idx_offers_slug ON public.offers(slug);
CREATE INDEX idx_offers_status ON public.offers(status);
CREATE INDEX idx_offers_homepage ON public.offers(show_on_homepage, homepage_order);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial offers from existing products
INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  description,
  description_en,
  badge_text,
  badge_text_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'introspection-journey',
  'מסע התבוננות עמוקה',
  'Deep Introspection Journey',
  '15 שאלות שישנו את הדרך שבה אתה רואה את עצמך',
  '15 questions that will change how you see yourself',
  'רק 10 דקות יכולות לפתוח דלת לתודעה חדשה',
  'Just 10 minutes can open a door to new consciousness',
  '🎁 מתנה חינמית',
  '🎁 Free Gift',
  0,
  0,
  'amber',
  true,
  'form',
  'התחל את המסע שלך',
  'Start Your Journey',
  '/form/45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308',
  true,
  true,
  1,
  'active',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'introspection-journey');

INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'personal-hypnosis-video',
  'סרטון היפנוזה אישי',
  'Personal Hypnosis Video',
  'סרטון אימון תודעתי מותאם אישית לצרכים שלך',
  'A consciousness training video customized to your specific needs',
  297,
  79,
  'emerald',
  false,
  'checkout',
  'הזמן עכשיו',
  'Order Now',
  '/personal-hypnosis',
  true,
  true,
  2,
  'active',
  (SELECT id FROM public.products WHERE slug = 'personal-hypnosis-video' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'personal-hypnosis-video');

INSERT INTO public.offers (
  slug, 
  title, 
  title_en, 
  subtitle,
  subtitle_en,
  price, 
  price_usd,
  brand_color,
  is_free,
  cta_type,
  cta_text,
  cta_text_en,
  landing_page_route,
  landing_page_enabled,
  show_on_homepage,
  homepage_order,
  status,
  product_id
)
SELECT 
  'consciousness-leap',
  'קפיצה לתודעה חדשה',
  'Consciousness Leap',
  'תהליך טרנספורמציה אישית עמוקה עם ליווי צמוד',
  'Deep personal transformation process with close guidance',
  1997,
  549,
  'purple',
  false,
  'lead_form',
  'גלה אם זה מתאים לך',
  'Discover if it''s right for you',
  '/consciousness-leap',
  true,
  true,
  3,
  'active',
  (SELECT id FROM public.products WHERE slug = 'consciousness-leap' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.offers WHERE slug = 'consciousness-leap');