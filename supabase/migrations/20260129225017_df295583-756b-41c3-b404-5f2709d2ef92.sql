-- Create landing_pages table for data-driven landing page management
CREATE TABLE public.landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'product', -- 'homepage', 'product', 'lead_capture', 'custom'
  
  -- Offer connection (optional)
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  
  -- Meta & SEO
  title_he TEXT,
  title_en TEXT,
  seo_title_he TEXT,
  seo_title_en TEXT,
  seo_description_he TEXT,
  seo_description_en TEXT,
  
  -- Hero Section
  hero_heading_he TEXT,
  hero_heading_en TEXT,
  hero_subheading_he TEXT,
  hero_subheading_en TEXT,
  hero_image_url TEXT,
  hero_video_url TEXT,
  hero_badge_text_he TEXT,
  hero_badge_text_en TEXT,
  
  -- Sections Configuration (JSONB)
  sections_order JSONB DEFAULT '["hero", "pain_points", "process", "benefits", "testimonials", "faq", "cta"]'::jsonb,
  sections_config JSONB DEFAULT '{}'::jsonb,
  
  -- Content Blocks (JSONB for flexibility)
  pain_points JSONB DEFAULT '[]'::jsonb,
  process_steps JSONB DEFAULT '[]'::jsonb,
  benefits JSONB DEFAULT '[]'::jsonb,
  for_who JSONB DEFAULT '[]'::jsonb,
  not_for_who JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  includes JSONB DEFAULT '[]'::jsonb,
  
  -- Styling
  brand_color TEXT DEFAULT '#8B5CF6',
  custom_css TEXT,
  
  -- CTA
  primary_cta_type TEXT DEFAULT 'link', -- 'checkout', 'form', 'link', 'contact', 'whatsapp'
  primary_cta_text_he TEXT,
  primary_cta_text_en TEXT,
  primary_cta_link TEXT,
  form_id UUID REFERENCES public.custom_forms(id) ON DELETE SET NULL,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_homepage BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;

-- Public can view published landing pages
CREATE POLICY "Anyone can view published landing pages"
ON public.landing_pages
FOR SELECT
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage landing pages"
ON public.landing_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_landing_pages_updated_at
BEFORE UPDATE ON public.landing_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default landing pages based on existing pages
INSERT INTO public.landing_pages (
  slug, template_type, title_he, title_en, is_published, is_homepage,
  hero_heading_he, hero_heading_en, hero_subheading_he, hero_subheading_en,
  sections_order, brand_color, primary_cta_type
) VALUES 
(
  'home',
  'homepage',
  'דף הבית',
  'Home',
  true,
  true,
  'הסוד האמיתי מסתתר בתת־המודע שלך',
  'The Real Secret Hides in Your Subconscious',
  'גלה את הכוח הפנימי שלך',
  'Discover Your Inner Power',
  '["hero", "products", "about", "testimonials", "faq"]'::jsonb,
  '#8B5CF6',
  'link'
),
(
  'consciousness-leap',
  'product',
  'קפיצה לתודעה חדשה',
  'Consciousness Leap',
  true,
  false,
  'הגיע הזמן לקפיצה לתודעה חדשה',
  'Time for a Consciousness Leap',
  'תהליך אישי עמוק לשינוי אמיתי',
  'Deep personal process for real change',
  '["hero", "pain_points", "process", "benefits", "for_who", "testimonials", "faq", "cta"]'::jsonb,
  '#10B981',
  'form'
),
(
  'personal-hypnosis',
  'product',
  'הקלטת היפנוזה אישית',
  'Personal Hypnosis Recording',
  true,
  false,
  'הקלטת היפנוזה אישית מותאמת במיוחד עבורך',
  'Personal Hypnosis Recording Custom Made for You',
  'פתח את הפוטנציאל שלך עם הקלטה מותאמת אישית',
  'Unlock your potential with a personalized recording',
  '["hero", "pain_points", "process", "benefits", "testimonials", "cta"]'::jsonb,
  '#F59E0B',
  'checkout'
);