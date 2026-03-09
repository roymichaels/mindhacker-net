/**
 * FMTopNav — FM top navigation header.
 * Uses AppNameDropdown + header actions, no back arrow.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';

interface FMTopNavProps {
  onOpenSettings: () => void;
}

export function FMTopNav({ onOpenSettings }: FMTopNavProps) {
  const { isRTL } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-amber-300/40 bg-gradient-to-b from-amber-50/95 via-orange-50/90 to-background/95 backdrop-blur-xl dark:from-amber-950/40 dark:via-amber-900/20 dark:to-background/95 dark:border-amber-500/20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <AppNameDropdown compact onOpenSettings={onOpenSettings} />
        <HeaderActions />
      </div>
    </header>
  );
}
