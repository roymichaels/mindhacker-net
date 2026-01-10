import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type Language = 'he' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  isFirstVisit: boolean;
  setFirstVisitComplete: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'preferred_language';
const FIRST_VISIT_KEY = 'language_selected';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('he');
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Detect location and set initial language
  const detectLocation = async (): Promise<Language> => {
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(3000) 
      });
      const data = await response.json();
      return data.country_code === 'IL' ? 'he' : 'en';
    } catch {
      return 'en'; // Default fallback
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
      const hasSelectedLanguage = localStorage.getItem(FIRST_VISIT_KEY);

      if (storedLanguage) {
        setLanguageState(storedLanguage);
        updateDocumentDirection(storedLanguage);
      } else if (!hasSelectedLanguage) {
        // First visit - detect location and show prompt
        const detectedLang = await detectLocation();
        setLanguageState(detectedLang);
        updateDocumentDirection(detectedLang);
        setIsFirstVisit(true);
      } else {
        // Has selected before but no stored language (edge case)
        setLanguageState('he');
        updateDocumentDirection('he');
      }
      
      setIsInitialized(true);
    };

    initLanguage();
  }, []);

  // Sync with user profile when logged in
  useEffect(() => {
    const syncWithProfile = async () => {
      if (user && isInitialized) {
        // Try to get user's preferred language from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        // If profile has a different language preference and we haven't stored one locally
        // we could sync here, but for now we prioritize local storage
      }
    };

    syncWithProfile();
  }, [user, isInitialized]);

  const updateDocumentDirection = (lang: Language) => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    updateDocumentDirection(lang);

    // If user is logged in, save to profile
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (error) {
        console.error('Failed to sync language preference:', error);
      }
    }
  };

  const setFirstVisitComplete = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsFirstVisit(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isRTL: language === 'he',
        isFirstVisit,
        setFirstVisitComplete,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
