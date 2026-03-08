/**
 * FMTopNav — FM top navigation header.
 * Uses AppNameDropdown + header actions, no sub-tabs (those are in-page now).
 */
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';

interface FMTopNavProps {
  onOpenSettings: () => void;
}

export function FMTopNav({ onOpenSettings }: FMTopNavProps) {
  const { isRTL, language } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-amber-300/40 bg-gradient-to-b from-amber-50/95 via-orange-50/90 to-background/95 backdrop-blur-xl dark:from-amber-950/40 dark:via-amber-900/20 dark:to-background/95 dark:border-amber-500/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <AppNameDropdown compact onOpenSettings={onOpenSettings} />

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold text-amber-600/70 dark:text-amber-300/70 hover:text-amber-700 dark:hover:text-amber-200 hover:bg-amber-500/10 border border-amber-400/15 transition-all"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden xs:inline">{isHe ? 'חזור ל-OS' : 'Back to OS'}</span>
          </button>
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
