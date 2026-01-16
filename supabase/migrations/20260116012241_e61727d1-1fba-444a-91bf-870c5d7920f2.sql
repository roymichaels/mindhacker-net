-- Add hero portrait effect settings
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('hero_portrait_effect', 'cyber_glow', 'string', 'Hero portrait effect style: cyber_glow, consciousness_aura, or none'),
  ('hero_portrait_glow_color', '', 'string', 'Custom glow color for hero portrait (hex, empty for theme primary)'),
  ('hero_portrait_animation_speed', 'normal', 'string', 'Animation speed: slow, normal, fast')
ON CONFLICT (setting_key) DO NOTHING;