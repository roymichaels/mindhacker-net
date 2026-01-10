-- Add preferred_language to profiles for user language tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'he' CHECK (preferred_language IN ('he', 'en'));

-- Add English columns to testimonials for bilingual support
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS role_en text,
ADD COLUMN IF NOT EXISTS quote_en text;

-- Insert English video URL settings for each promotional video
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('hero_video_url_en', NULL, 'text', 'Hero section video URL (English)'),
  ('about_video_url_en', NULL, 'text', 'About section video URL (English)'),
  ('introspection_promo_video_url_en', NULL, 'text', 'Introspection promo video URL (English)'),
  ('personal_hypnosis_promo_video_url_en', NULL, 'text', 'Personal Hypnosis promo video URL (English)'),
  ('consciousness_leap_promo_video_url_en', NULL, 'text', 'Consciousness Leap promo video URL (English)')
ON CONFLICT (setting_key) DO NOTHING;

-- Add English enabled toggles for videos
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('hero_video_enabled_en', 'false', 'boolean', 'Hero section video enabled (English)'),
  ('about_video_enabled_en', 'false', 'boolean', 'About section video enabled (English)'),
  ('introspection_promo_video_enabled_en', 'false', 'boolean', 'Introspection promo video enabled (English)'),
  ('personal_hypnosis_promo_video_enabled_en', 'false', 'boolean', 'Personal Hypnosis promo video enabled (English)'),
  ('consciousness_leap_promo_video_enabled_en', 'false', 'boolean', 'Consciousness Leap promo video enabled (English)')
ON CONFLICT (setting_key) DO NOTHING;