-- Create homepage_sections table for admin-editable content
CREATE TABLE public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title_he TEXT,
  title_en TEXT,
  subtitle_he TEXT,
  subtitle_en TEXT,
  content_he TEXT,
  content_en TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible sections
CREATE POLICY "Anyone can view visible sections"
ON public.homepage_sections
FOR SELECT
USING (is_visible = true);

-- Admins can manage all sections
CREATE POLICY "Admins can manage all sections"
ON public.homepage_sections
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_homepage_sections_updated_at
BEFORE UPDATE ON public.homepage_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial sections
INSERT INTO public.homepage_sections (section_key, title_he, title_en, subtitle_he, subtitle_en, order_index) VALUES
('what', 'מה זה היפנוזה?', 'What is Hypnosis?', 'גלה את הכוח שבתוכך', 'Discover the power within', 1),
('how', 'איך זה עובד?', 'How Does It Work?', 'התהליך שלנו', 'Our Process', 2),
('about', 'קצת עליי', 'About Me', 'הכירו את דין', 'Meet Dean', 3),
('booking', 'בוא נתכנת את המציאות שלך', 'Let''s Program Your Reality', 'בחר את החבילה המתאימה לך', 'Choose the package that suits you', 4),
('testimonials', 'מה אומרים עליי', 'What People Say', 'סיפורי הצלחה', 'Success Stories', 5),
('faq', 'שאלות נפוצות', 'FAQ', 'התשובות לכל מה שרצית לדעת', 'Answers to everything you wanted to know', 6);