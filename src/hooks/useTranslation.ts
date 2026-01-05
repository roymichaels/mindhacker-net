import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/i18n';

export const useTranslation = () => {
  const { language, isRTL } = useLanguage();

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return { t, language, isRTL };
};
