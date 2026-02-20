/**
 * @module navigation/TopNavBar
 * @tab Global
 * @purpose Desktop top navigation bar with tabs
 * @data navConfig (APP_TABS, ADMIN_TAB), useUserRoles, HeaderActions
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { getVisibleTabs } from '@/navigation/osNav';

interface TopNavBarProps {
  onOpenSettings: () => void;
}

export function TopNavBar({ onOpenSettings }: TopNavBarProps) {
  const { language, isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme: brandTheme } = useThemeSettings();
  const { hasRole, loading } = useUserRoles();

  const tabs = loading ? [] : getVisibleTabs({ hasRole });

  const isTabActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/today' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          <AppNameDropdown onOpenSettings={onOpenSettings} />

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const active = isTabActive(tab.path);
              const Icon = tab.icon;
              const isComingSoon = 'comingSoon' in tab && tab.comingSoon;
              return (
                <button
                  key={tab.id}
                  onClick={() => !isComingSoon && navigate(tab.path)}
                  disabled={isComingSoon}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isComingSoon
                      ? "text-muted-foreground/40 opacity-60 grayscale cursor-default pointer-events-none"
                      : active
                        ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{language === 'he' ? tab.labelHe : tab.labelEn}</span>
                  {isComingSoon && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight" style={{ backgroundColor: 'hsl(0, 84%, 50%)', color: 'white' }}>
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Action icons */}
        <div className="flex items-center gap-1">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
