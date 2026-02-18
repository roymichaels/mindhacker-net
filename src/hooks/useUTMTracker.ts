import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { debug } from '@/lib/debug';

const UTM_STORAGE_KEY = 'utm_data';
const UTM_EXPIRY_KEY = 'utm_data_expiry';
const UTM_EXPIRY_DAYS = 30;
const UTM_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  captured_at?: string;
}

/** Read stored UTM data (returns null if expired or missing) */
export const getStoredUTMData = (): UTMData | null => {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    const expiry = localStorage.getItem(UTM_EXPIRY_KEY);
    if (!raw || !expiry) return null;
    if (new Date() > new Date(expiry)) {
      localStorage.removeItem(UTM_STORAGE_KEY);
      localStorage.removeItem(UTM_EXPIRY_KEY);
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Persist UTM data to the user's profile */
export const syncUTMToProfile = async (userId: string) => {
  const data = getStoredUTMData();
  if (!data) return;
  try {
    await supabase
      .from('profiles')
      .update({ utm_data: data as any })
      .eq('id', userId);
    debug.log('UTM data synced to profile');
  } catch {
    // silent
  }
};

/**
 * Hook: captures UTM params from any page URL and stores in localStorage.
 * Mount once at the app root (alongside AffiliateTracker).
 */
export const useUTMTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const utmData: UTMData = {};
    let hasUTM = false;

    for (const key of UTM_PARAMS) {
      const val = params.get(key);
      if (val) {
        utmData[key] = val;
        hasUTM = true;
      }
    }

    if (!hasUTM) return;

    utmData.landing_page = location.pathname;
    utmData.captured_at = new Date().toISOString();

    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + UTM_EXPIRY_DAYS);
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      localStorage.setItem(UTM_EXPIRY_KEY, expiry.toISOString());
      debug.log('UTM params captured:', utmData);
    } catch {
      // ignore
    }
  }, [location.search, location.pathname]);
};
