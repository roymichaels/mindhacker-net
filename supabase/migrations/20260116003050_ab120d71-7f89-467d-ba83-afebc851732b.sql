-- Add additional theme settings for complete data-driven templating
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  -- Founder/Owner info
  ('founder_name', 'דין אושר אזולאי', 'string', 'Founder name (Hebrew)'),
  ('founder_name_en', 'Dean Osher Azulay', 'string', 'Founder name (English)'),
  ('founder_title', 'מאמן תודעה', 'string', 'Founder title (Hebrew)'),
  ('founder_title_en', 'Consciousness Coach', 'string', 'Founder title (English)'),
  
  -- SEO/Open Graph
  ('og_image_url', '', 'string', 'Default Open Graph image URL'),
  ('site_url', 'https://mind-hacker.net', 'string', 'Primary site URL'),
  
  -- Extended color palette
  ('primary_glow_l', '70', 'number', 'Primary glow lightness'),
  ('muted_h', '215', 'number', 'Muted color hue'),
  ('muted_s', '40', 'number', 'Muted color saturation (%)'),
  ('muted_l', '15', 'number', 'Muted color lightness (%)'),
  ('foreground_h', '210', 'number', 'Foreground color hue'),
  ('foreground_s', '40', 'number', 'Foreground color saturation (%)'),
  ('foreground_l', '98', 'number', 'Foreground color lightness (%)')
ON CONFLICT (setting_key) DO NOTHING;