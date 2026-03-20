/**
 * Shared Loading State for Journey Flows
 */
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { JourneyLoadingStateProps } from './types';
import { JOURNEY_THEMES } from './themes';

export function JourneyLoadingState({ theme = 'launchpad', message }: JourneyLoadingStateProps) {
  const { language, isRTL } = useTranslation();
  const themeConfig = JOURNEY_THEMES[theme];
  
  const defaultMessage = language === 'he' 
    ? `טוען את ${themeConfig.title.he}...` 
    : `Loading ${themeConfig.title.en}...`;

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="text-center space-y-4">
        <Loader2 className={cn(
          "w-8 h-8 animate-spin mx-auto",
          `text-${themeConfig.colors.primary}`
        )} />
        <p className="text-muted-foreground">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
}

export default JourneyLoadingState;
