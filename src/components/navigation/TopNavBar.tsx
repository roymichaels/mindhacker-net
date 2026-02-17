import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Store } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';

const tabs = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelHe: 'דאשבורד' },
  { id: 'projects', path: '/projects', icon: FolderKanban, labelEn: 'Projects', labelHe: 'פרויקטים' },
  { id: 'marketplace', path: '/marketplace', icon: Store, labelEn: 'Marketplace', labelHe: 'מרכז מאמנים' },
];

interface TopNavBarProps {
  onOpenSettings: () => void;
}

export function TopNavBar({ onOpenSettings }: TopNavBarProps) {
  const { language, isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme: brandTheme } = useThemeSettings();

  const isTabActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/today' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-14 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          <AppNameDropdown onOpenSettings={onOpenSettings} />

          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const active = isTabActive(tab.path);
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-amber-500/10 text-amber-500 dark:text-amber-400"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{language === 'he' ? tab.labelHe : tab.labelEn}</span>
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
