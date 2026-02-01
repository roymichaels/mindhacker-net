import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeSettings {
  // Brand
  brand_name: string;
  brand_name_en: string;
  company_legal_name: string;
  company_country: string;
  
  // Founder info
  founder_name: string;
  founder_name_en: string;
  founder_short_name: string;
  founder_short_name_en: string;
  founder_title: string;
  founder_title_en: string;
  
  // Colors (HSL components)
  primary_h: string;
  primary_s: string;
  primary_l: string;
  primary_glow_l: string;
  secondary_h: string;
  secondary_s: string;
  secondary_l: string;
  accent_h: string;
  accent_s: string;
  accent_l: string;
  background_h: string;
  background_s: string;
  background_l: string;
  foreground_h: string;
  foreground_s: string;
  foreground_l: string;
  muted_h: string;
  muted_s: string;
  muted_l: string;
  
  // Typography
  font_family_primary: string;
  font_family_secondary: string;
  
  // Effects (selection-based)
  background_effect: 'none' | 'matrix_rain' | 'consciousness_field';
  matrix_rain_enabled: boolean; // Legacy - derived from background_effect
  matrix_rain_color: string;
  matrix_rain_opacity: string;
  
  // Consciousness Field Effect
  consciousness_field_primary_color: string;
  consciousness_field_accent_color: string;
  consciousness_field_particle_density: string;
  consciousness_field_breathing_speed: string;
  consciousness_field_interaction: boolean;
  
  // Hero Portrait Effect
  hero_portrait_effect: 'none' | 'cyber_glow' | 'consciousness_aura';
  hero_portrait_glow_color: string;
  hero_portrait_animation_speed: 'slow' | 'normal' | 'fast';
  
  // Assets
  logo_url: string;
  favicon_url: string;
  og_image_url: string;
  site_url: string;
  hero_portrait_url: string;
  pwa_icon_url: string;
  
  // Forms
  introspection_form_id: string;
  
  // Localization
  default_language: string;
  
  // Default theme mode for all users
  default_theme_mode: 'light' | 'dark';
}

export interface ThemePreset {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  colors: Record<string, string>;
  is_active: boolean;
  order_index: number;
}

const defaultTheme: ThemeSettings = {
  brand_name: "מיינד האקר",
  brand_name_en: "Mind Hacker",
  company_legal_name: "Mind Hacker OÜ",
  company_country: "Estonia",
  founder_name: "דין אושר אזולאי",
  founder_name_en: "Dean Osher Azulay",
  founder_short_name: "דין",
  founder_short_name_en: "Dean",
  founder_title: "מאמן תודעה",
  founder_title_en: "Consciousness Coach",
  primary_h: "292",
  primary_s: "95%",
  primary_l: "73%",
  primary_glow_l: "80",
  secondary_h: "270",
  secondary_s: "95%",
  secondary_l: "65%",
  accent_h: "38",
  accent_s: "95%",
  accent_l: "50%",
  background_h: "260",
  background_s: "60%",
  background_l: "5%",
  foreground_h: "0",
  foreground_s: "0%",
  foreground_l: "100%",
  muted_h: "260",
  muted_s: "40%",
  muted_l: "15%",
  font_family_primary: "Heebo",
  font_family_secondary: "inherit",
  background_effect: "matrix_rain",
  matrix_rain_enabled: true,
  matrix_rain_color: "#e879f9",
  matrix_rain_opacity: "0.15",
  consciousness_field_primary_color: "#0a1628",
  consciousness_field_accent_color: "#3d7a8c",
  consciousness_field_particle_density: "0.6",
  consciousness_field_breathing_speed: "10",
  consciousness_field_interaction: true,
  hero_portrait_effect: "cyber_glow",
  hero_portrait_glow_color: "",
  hero_portrait_animation_speed: "normal",
  logo_url: "",
  favicon_url: "",
  og_image_url: "",
  site_url: "https://mind-hacker.net",
  hero_portrait_url: "",
  pwa_icon_url: "",
  introspection_form_id: "866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e",
  default_language: "he",
  default_theme_mode: "dark",
};

// In-memory cache
let cachedTheme: ThemeSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute

// Apply theme to CSS custom properties
// NOTE: We split "brand" variables (should apply in both modes)
// from "surface" variables (background/foreground/etc.) that should be
// controlled by the light/dark mode CSS.
export const applyThemeBrandToDOM = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // Primary color
  root.style.setProperty('--primary', `${theme.primary_h} ${theme.primary_s} ${theme.primary_l}`);

  // Primary glow (brighter version for effects)
  const glowL = theme.primary_glow_l || String(Math.min(parseInt(theme.primary_l) + 20, 100));
  root.style.setProperty('--primary-glow', `${theme.primary_h} ${theme.primary_s} ${glowL}%`);

  // Secondary color
  root.style.setProperty('--secondary', `${theme.secondary_h} ${theme.secondary_s} ${theme.secondary_l}`);

  // Accent color
  root.style.setProperty('--accent', `${theme.accent_h} ${theme.accent_s} ${theme.accent_l}`);

  // Ring color (matches primary)
  root.style.setProperty('--ring', `${theme.primary_h} ${theme.primary_s} ${theme.primary_l}`);

  // Font family
  if (theme.font_family_primary) {
    root.style.setProperty('--font-primary', theme.font_family_primary);
  }

  // Matrix rain color (as CSS variable for components)
  root.style.setProperty('--matrix-rain-color', theme.matrix_rain_color);
  root.style.setProperty('--matrix-rain-opacity', theme.matrix_rain_opacity);
};

export const applyThemeSurfaceToDOM = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // Background / text palette (these override light/dark defaults)
  root.style.setProperty('--background', `${theme.background_h} ${theme.background_s} ${theme.background_l}`);
  root.style.setProperty('--foreground', `${theme.foreground_h} ${theme.foreground_s} ${theme.foreground_l}`);

  // Muted color
  root.style.setProperty('--muted', `${theme.muted_h} ${theme.muted_s} ${theme.muted_l}`);
  root.style.setProperty('--muted-foreground', `${theme.foreground_h} 30% 60%`);

  // Card and popover (derived from background)
  const cardL = Math.min(parseInt(theme.background_l) + 5, 100);
  root.style.setProperty('--card', `${theme.background_h} ${theme.background_s} ${cardL}%`);
  root.style.setProperty('--popover', `${theme.background_h} ${theme.background_s} ${cardL}%`);

  // Border (derived from background)
  const borderL = Math.min(parseInt(theme.background_l) + 15, 100);
  root.style.setProperty('--border', `${theme.background_h} 30% ${borderL}%`);

  // Glass panel variables (derived from theme)
  root.style.setProperty('--glass-bg', `${theme.background_h} ${theme.background_s} ${Math.min(parseInt(theme.background_l) + 8, 20)}%`);
  root.style.setProperty('--glass-border', `${theme.primary_h} ${theme.primary_s} ${theme.primary_l}`);

  // Skeleton color (lighter primary for loading states)
  const skeletonL = Math.min(parseInt(theme.primary_l) + 30, 90);
  root.style.setProperty('--skeleton', `${theme.primary_h} ${theme.primary_s} ${skeletonL}%`);

  // Tab active state colors
  root.style.setProperty('--tab-active', `${theme.primary_h} ${theme.primary_s} ${theme.primary_l}`);
  root.style.setProperty('--tab-active-foreground', `${theme.background_h} ${theme.background_s} ${theme.background_l}`);
};

export const clearThemeSurfaceOverrides = () => {
  const root = document.documentElement;
  [
    '--background',
    '--foreground',
    '--muted',
    '--muted-foreground',
    '--card',
    '--popover',
    '--border',
    '--glass-bg',
    '--glass-border',
    '--skeleton',
    '--tab-active',
    '--tab-active-foreground',
  ].forEach((key) => root.style.removeProperty(key));
};

export const clearThemeBrandOverrides = () => {
  const root = document.documentElement;
  [
    '--primary',
    '--primary-glow',
    '--secondary',
    '--accent',
    '--ring',
    '--matrix-rain-color',
    '--matrix-rain-opacity',
  ].forEach((key) => root.style.removeProperty(key));
};

// Backwards-compatible helper
const applyThemeToDOM = (theme: ThemeSettings) => {
  applyThemeBrandToDOM(theme);
  applyThemeSurfaceToDOM(theme);
};

export const useThemeSettings = () => {
  const [theme, setTheme] = useState<ThemeSettings>(cachedTheme || defaultTheme);
  const [loading, setLoading] = useState(!cachedTheme);

  const fetchTheme = useCallback(async () => {
    // Use cache if valid
    if (cachedTheme && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setTheme(cachedTheme);
      // NOTE: Don't apply brand variables here - ThemeProvider handles it based on light/dark mode
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("setting_key, setting_value, setting_type");

      if (error) throw error;

      const themeObj = { ...defaultTheme };

      if (data) {
        data.forEach((item) => {
          const key = item.setting_key as keyof ThemeSettings;
          if (key in themeObj) {
            if (item.setting_type === 'boolean') {
              (themeObj as any)[key] = item.setting_value === 'true';
            } else {
              (themeObj as any)[key] = item.setting_value || defaultTheme[key];
            }
          }
        });
      }

      cachedTheme = themeObj;
      cacheTimestamp = Date.now();
      setTheme(themeObj);
      // NOTE: Don't apply brand variables here - ThemeProvider handles it based on light/dark mode
    } catch (error) {
      console.error("Error fetching theme settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTheme();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('theme_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'theme_settings'
        },
        () => {
          // Clear cache and refetch on any change
          cachedTheme = null;
          cacheTimestamp = 0;
          fetchTheme();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTheme]);

  return { theme, loading, refetch: fetchTheme };
};

// Hook for fetching theme presets
export const useThemePresets = () => {
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const { data, error } = await supabase
          .from("theme_presets")
          .select("*")
          .eq("is_active", true)
          .order("order_index");

        if (error) throw error;
        
        // Map database records to ThemePreset type
        const mappedPresets: ThemePreset[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          name_en: item.name_en,
          description: item.description,
          description_en: item.description_en,
          colors: (typeof item.colors === 'object' && item.colors !== null) 
            ? item.colors as Record<string, string>
            : {},
          is_active: item.is_active ?? true,
          order_index: item.order_index ?? 0,
        }));
        
        setPresets(mappedPresets);
      } catch (error) {
        console.error("Error fetching theme presets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresets();
  }, []);

  return { presets, loading };
};

// Helper to update a theme setting
export const updateThemeSetting = async (key: string, value: string) => {
  const { error } = await supabase
    .from("theme_settings")
    .update({ setting_value: value, updated_at: new Date().toISOString() })
    .eq("setting_key", key);

  if (error) throw error;
  
  // Clear cache
  cachedTheme = null;
  cacheTimestamp = 0;
};

// Helper to apply a preset
export const applyThemePreset = async (preset: ThemePreset) => {
  const updates = Object.entries(preset.colors).map(([key, value]) => 
    updateThemeSetting(key, value)
  );
  
  await Promise.all(updates);
};

// Clear cache (useful after admin updates)
export const clearThemeCache = () => {
  cachedTheme = null;
  cacheTimestamp = 0;
};

// Get the default theme
export const getDefaultTheme = () => defaultTheme;
