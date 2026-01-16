-- Create theme_settings table for storing all theme/branding configuration
CREATE TABLE public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'string',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (theme needs to load for all visitors)
CREATE POLICY "Theme settings are publicly readable"
  ON public.theme_settings FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Only admins can update theme settings"
  ON public.theme_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can insert theme settings"
  ON public.theme_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Create theme_presets table for pre-built color themes
CREATE TABLE public.theme_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  description text,
  description_en text,
  colors jsonb NOT NULL,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Theme presets are publicly readable"
  ON public.theme_presets FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Only admins can manage theme presets"
  ON public.theme_presets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Insert default theme settings
INSERT INTO public.theme_settings (setting_key, setting_value, setting_type, description) VALUES
  -- Brand
  ('brand_name', 'מיינד האקר', 'string', 'Primary brand name (Hebrew)'),
  ('brand_name_en', 'Mind Hacker', 'string', 'Brand name (English)'),
  ('company_legal_name', 'Mind Hacker OÜ', 'string', 'Legal company name'),
  ('company_country', 'Estonia', 'string', 'Company registration country'),
  
  -- Colors (HSL format without hsl() wrapper)
  ('primary_h', '187', 'number', 'Primary color hue'),
  ('primary_s', '100%', 'string', 'Primary color saturation'),
  ('primary_l', '50%', 'string', 'Primary color lightness'),
  ('secondary_h', '217', 'number', 'Secondary color hue'),
  ('secondary_s', '91%', 'string', 'Secondary color saturation'),
  ('secondary_l', '60%', 'string', 'Secondary color lightness'),
  ('accent_h', '45', 'number', 'Accent color hue'),
  ('accent_s', '93%', 'string', 'Accent color saturation'),
  ('accent_l', '47%', 'string', 'Accent color lightness'),
  ('background_h', '222', 'number', 'Background color hue'),
  ('background_s', '47%', 'string', 'Background color saturation'),
  ('background_l', '11%', 'string', 'Background color lightness'),
  
  -- Typography
  ('font_family_primary', 'Heebo', 'string', 'Primary font family'),
  ('font_family_secondary', 'inherit', 'string', 'Secondary font family'),
  
  -- Effects
  ('matrix_rain_enabled', 'true', 'boolean', 'Enable Matrix Rain effect'),
  ('matrix_rain_color', '#00d4ff', 'string', 'Matrix Rain primary color'),
  ('matrix_rain_opacity', '0.15', 'number', 'Matrix Rain opacity'),
  
  -- Assets
  ('logo_url', '', 'string', 'Logo image URL'),
  ('favicon_url', '', 'string', 'Favicon URL'),
  
  -- Localization
  ('default_language', 'he', 'string', 'Default site language');

-- Insert default theme presets
INSERT INTO public.theme_presets (name, name_en, description, description_en, colors, order_index) VALUES
  ('סייבר מיינד', 'Cyber Mind', 'הנושא הנוכחי - צבעי ציאן וטכנולוגיה', 'Current theme - Cyan tech colors', 
   '{"primary_h": "187", "primary_s": "100%", "primary_l": "50%", "secondary_h": "217", "secondary_s": "91%", "secondary_l": "60%", "accent_h": "45", "accent_s": "93%", "accent_l": "47%", "background_h": "222", "background_s": "47%", "background_l": "11%", "matrix_color": "#00d4ff"}',
   1),
  ('אדמה חמה', 'Warm Earth', 'גוונים חמים של ענבר וטרקוטה', 'Warm amber and terracotta tones',
   '{"primary_h": "25", "primary_s": "95%", "primary_l": "53%", "secondary_h": "15", "secondary_s": "75%", "secondary_l": "45%", "accent_h": "45", "accent_s": "90%", "accent_l": "55%", "background_h": "20", "background_s": "20%", "background_l": "10%", "matrix_color": "#ff9500"}',
   2),
  ('שלוות האוקיינוס', 'Ocean Calm', 'גוונים רגועים של כחול וטורקיז', 'Calming blue and teal tones',
   '{"primary_h": "200", "primary_s": "85%", "primary_l": "55%", "secondary_h": "180", "secondary_s": "70%", "secondary_l": "45%", "accent_h": "160", "accent_s": "75%", "accent_l": "50%", "background_h": "210", "background_s": "35%", "background_l": "12%", "matrix_color": "#00a0c0"}',
   3),
  ('צמיחת היער', 'Forest Growth', 'גוונים טבעיים של ירוק ואדמה', 'Natural green earth tones',
   '{"primary_h": "142", "primary_s": "70%", "primary_l": "45%", "secondary_h": "160", "secondary_s": "60%", "secondary_l": "40%", "accent_h": "45", "accent_s": "80%", "accent_l": "50%", "background_h": "150", "background_s": "25%", "background_l": "10%", "matrix_color": "#22c55e"}',
   4),
  ('סגול מלכותי', 'Royal Purple', 'גוונים עשירים של סגול וזהב', 'Rich purple and gold tones',
   '{"primary_h": "270", "primary_s": "75%", "primary_l": "55%", "secondary_h": "280", "secondary_s": "65%", "secondary_l": "45%", "accent_h": "45", "accent_s": "90%", "accent_l": "55%", "background_h": "260", "background_s": "30%", "background_l": "12%", "matrix_color": "#a855f7"}',
   5);

-- Update trigger for theme_settings
CREATE TRIGGER update_theme_settings_updated_at
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for theme_presets
CREATE TRIGGER update_theme_presets_updated_at
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();