/**
 * Gender-Aware Translation Hook
 * 
 * Provides translations that adapt to the user's gender preference.
 * Falls back to neutral or default translations when gendered versions aren't available.
 */

import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Gender = 'male' | 'female' | 'neutral';

interface ProfileWithPreferences {
  aurora_preferences: {
    gender?: Gender;
    tone?: string;
    intensity?: string;
  } | null;
}

/**
 * Hook to get user's gender preference from profiles.aurora_preferences
 */
function useUserGender(): Gender {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ['profile-gender', user?.id],
    queryFn: async (): Promise<ProfileWithPreferences | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('aurora_preferences')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching gender preference:', error);
        return null;
      }
      
      return data as ProfileWithPreferences | null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  // Extract gender from aurora_preferences JSONB
  const prefs = profile?.aurora_preferences;
  if (prefs && typeof prefs === 'object' && 'gender' in prefs) {
    return (prefs.gender as Gender) || 'neutral';
  }
  
  // Default to neutral if no preference set
  return 'neutral';
}

/**
 * Main gendered translation hook
 */
export function useGenderedTranslation() {
  const { t, language, isRTL } = useTranslation();
  const userGender = useUserGender();
  
  /**
   * Get gendered translation
   * 
   * Tries keys in order:
   * 1. key_male / key_female / key_neutral (based on user gender)
   * 2. key (fallback to base key)
   * 
   * @param key - Translation key (e.g., 'aurora.chat.placeholder')
   * @returns Translated string
   */
  const tg = (key: string): string => {
    // Only apply gendering for Hebrew
    if (language !== 'he') {
      return t(key);
    }
    
    // Try gendered key first
    const genderedKey = `${key}_${userGender}`;
    const genderedTranslation = t(genderedKey);
    
    // If gendered key exists (doesn't return the key itself), use it
    if (genderedTranslation !== genderedKey) {
      return genderedTranslation;
    }
    
    // Fall back to base key
    return t(key);
  };
  
  /**
   * Get translation with explicit gender override
   * Useful for previewing different genders in settings
   */
  const tgWithGender = (key: string, gender: Gender): string => {
    if (language !== 'he') {
      return t(key);
    }
    
    const genderedKey = `${key}_${gender}`;
    const genderedTranslation = t(genderedKey);
    
    if (genderedTranslation !== genderedKey) {
      return genderedTranslation;
    }
    
    return t(key);
  };
  
  return {
    t,           // Base translation function
    tg,          // Gendered translation function
    tgWithGender, // Translation with explicit gender
    language,
    isRTL,
    userGender,
  };
}

/**
 * Lightweight hook that only provides the user's gender
 * without the full translation context
 */
export function useUserGenderPreference(): Gender {
  return useUserGender();
}
