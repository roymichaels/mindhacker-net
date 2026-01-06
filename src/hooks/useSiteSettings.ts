import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSettings {
  // External links
  calendly_link: string;
  calendly_enabled: boolean;
  instagram_url: string;
  instagram_enabled: boolean;
  telegram_url: string;
  telegram_enabled: boolean;
  email: string;
  email_enabled: boolean;
  
  // Images
  about_image_url: string;
  
  // Pricing
  single_session_price: string;
  package_session_price: string;
  single_session_description: string;
  package_session_description: string;
  
  // Availability
  availability_hours: string;
  
  // Social proof
  happy_clients_count: string;
  success_rate_percent: string;
  habit_break_percent: string;
  spots_available: string;
  
  // Trust badges (custom text, falls back to translations)
  trust_badge_1: string;
  trust_badge_2: string;
  trust_badge_3: string;
  trust_badge_4: string;
  
  // WhatsApp
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  whatsapp_message: string;
  
  // Promo/Countdown
  promo_enabled: boolean;
  promo_text: string;
  promo_subtext: string;
  countdown_end_date: string;
  countdown_enabled: boolean;
  
  // Personal touch
  hero_personal_quote: string;
  pricing_personal_quote: string;
  personal_story: string;
  personal_invitation_message: string;
  hero_video_url: string;
  hero_video_enabled: boolean;
  about_video_url: string;
  about_video_enabled: boolean;
  free_call_calendly_link: string;
  free_call_enabled: boolean;
  
  // Form URL
  introspection_form_url: string;
  
  // Guarantee badge
  guarantee_title: string;
  guarantee_subtitle: string;
}

const defaultSettings: SiteSettings = {
  calendly_link: "",
  calendly_enabled: true,
  instagram_url: "",
  instagram_enabled: true,
  telegram_url: "",
  telegram_enabled: true,
  email: "",
  email_enabled: true,
  about_image_url: "",
  single_session_price: "",
  package_session_price: "",
  single_session_description: "",
  package_session_description: "",
  availability_hours: "",
  happy_clients_count: "200",
  success_rate_percent: "94",
  habit_break_percent: "87",
  spots_available: "3",
  trust_badge_1: "",
  trust_badge_2: "",
  trust_badge_3: "",
  trust_badge_4: "",
  whatsapp_number: "",
  whatsapp_enabled: false,
  whatsapp_message: "",
  promo_enabled: true,
  promo_text: "",
  promo_subtext: "",
  countdown_end_date: "",
  countdown_enabled: true,
  hero_personal_quote: "",
  pricing_personal_quote: "",
  personal_story: "",
  personal_invitation_message: "",
  hero_video_url: "",
  hero_video_enabled: false,
  about_video_url: "",
  about_video_enabled: false,
  free_call_calendly_link: "",
  free_call_enabled: true,
  introspection_form_url: "/form/866eb5a92355da936aea2b7bcb50726cc3f01badf5ebbeaecfff9b2c4aa7539e",
  guarantee_title: "",
  guarantee_subtitle: "",
};

// Simple in-memory cache
let cachedSettings: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(cachedSettings || defaultSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      // Use cache if valid
      if (cachedSettings && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setSettings(cachedSettings);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value");

        if (error) throw error;

        const settingsObj = { ...defaultSettings };
        
        if (data) {
          data.forEach((item) => {
            const key = item.setting_key as keyof SiteSettings;
            if (key in settingsObj) {
              if (key.endsWith('_enabled')) {
                (settingsObj as any)[key] = item.setting_value === 'true';
              } else {
                (settingsObj as any)[key] = item.setting_value || defaultSettings[key];
              }
            }
          });
        }

        cachedSettings = settingsObj;
        cacheTimestamp = Date.now();
        setSettings(settingsObj);
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading };
};

// Helper to get a single setting value
export const getSetting = (settings: SiteSettings, key: keyof SiteSettings, fallback?: string): string => {
  const value = settings[key];
  if (typeof value === 'boolean') return value.toString();
  return value || fallback || "";
};

// Clear cache (useful after admin updates)
export const clearSettingsCache = () => {
  cachedSettings = null;
  cacheTimestamp = 0;
};
