/**
 * @module navigation/TopNavBar
 * @tab Global
 * @purpose Desktop top navigation bar — slim header with logo + actions only.
 * Navigation tabs are in DesktopSideNav.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';

interface TopNavBarProps {
  onOpenSettings: () => void;
}

export function TopNavBar({ onOpenSettings }: TopNavBarProps) {
  const { isRTL } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg"
      style={{ borderBottomColor: 'hsl(var(--gold-border) / 0.3)' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-14 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <AppNameDropdown onOpenSettings={onOpenSettings} />
        <div className="flex items-center gap-1">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
