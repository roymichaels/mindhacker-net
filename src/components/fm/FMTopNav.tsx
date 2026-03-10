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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-12 sm:h-14 items-center justify-between px-2 sm:px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <AppNameDropdown compact onOpenSettings={onOpenSettings} />
        <HeaderActions />
      </div>
    </header>
  );
}
