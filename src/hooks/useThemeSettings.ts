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
  
  // Effects
  matrix_rain_enabled: boolean;
  matrix_rain_color: string;
  matrix_rain_opacity: string;
  
  // Assets
  logo_url: string;
  favicon_url: string;
  og_image_url: string;
  site_url: string;
  
  // Localization
  default_language: string;
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
  founder_title: "מאמן תודעה",
  founder_title_en: "Consciousness Coach",
  primary_h: "187",
  primary_s: "100%",
  primary_l: "50%",
  primary_glow_l: "70",
  secondary_h: "217",
  secondary_s: "91%",
  secondary_l: "60%",
  accent_h: "45",
  accent_s: "93%",
  accent_l: "47%",
  background_h: "222",
  background_s: "47%",
  background_l: "11%",
  foreground_h: "210",
  foreground_s: "40%",
  foreground_l: "98%",
  muted_h: "215",
  muted_s: "40%",
  muted_l: "15%",
  font_family_primary: "Heebo",
  font_family_secondary: "inherit",
  matrix_rain_enabled: true,
  matrix_rain_color: "#00d4ff",
  matrix_rain_opacity: "0.15",
  logo_url: "",
  favicon_url: "",
  og_image_url: "",
  site_url: "https://mind-hacker.net",
  default_language: "he",
};

// In-memory cache
let cachedTheme: ThemeSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute

// Apply theme to CSS custom properties
const applyThemeToDOM = (theme: ThemeSettings) => {
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
  
  // Background color
  root.style.setProperty('--background', `${theme.background_h} ${theme.background_s} ${theme.background_l}`);
  
  // Foreground color
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

export const useThemeSettings = () => {
  const [theme, setTheme] = useState<ThemeSettings>(cachedTheme || defaultTheme);
  const [loading, setLoading] = useState(!cachedTheme);

  const fetchTheme = useCallback(async () => {
    // Use cache if valid
    if (cachedTheme && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setTheme(cachedTheme);
      applyThemeToDOM(cachedTheme);
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
      applyThemeToDOM(themeObj);
    } catch (error) {
      console.error("Error fetching theme settings:", error);
      applyThemeToDOM(defaultTheme);
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
