-- Add new theme settings for complete template system
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('background_effect', 'matrix_rain', 'string', 'Background effect type: none, matrix_rain'),
  ('hero_portrait_url', '', 'string', 'Founder portrait image URL'),
  ('pwa_icon_url', '', 'string', 'PWA icon URL'),
  ('introspection_form_id', '45dfc6a5-6f98-444b-a3dd-2c0dd1ca3308', 'string', 'Default introspection form ID'),
  ('founder_short_name', 'דין', 'string', 'Founder short name (Hebrew)'),
  ('founder_short_name_en', 'Dean', 'string', 'Founder short name (English)')
ON CONFLICT (setting_key) DO NOTHING;