-- Add consciousness field effect settings
INSERT INTO theme_settings (setting_key, setting_value, setting_type, description) VALUES
  ('consciousness_field_primary_color', '#0a1628', 'string', 'Deep background color for consciousness field'),
  ('consciousness_field_accent_color', '#3d7a8c', 'string', 'Turquoise accent glow for consciousness field'),
  ('consciousness_field_particle_density', '0.6', 'string', 'Particle density 0-1 for consciousness field'),
  ('consciousness_field_breathing_speed', '10', 'string', 'Breathing cycle in seconds for consciousness field'),
  ('consciousness_field_interaction', 'true', 'boolean', 'Enable mouse/scroll interaction for consciousness field')
ON CONFLICT (setting_key) DO NOTHING;