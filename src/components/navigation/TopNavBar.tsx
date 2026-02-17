import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Sparkles, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';

const tabs = [
  { id: 'today', path: '/today', icon: LayoutDashboard, labelEn: 'Today', labelHe: 'היום' },
  { id: 'plan', path: '/plan', icon: Target, labelEn: 'Plan', labelHe: 'תוכנית' },
  { id: 'aurora', path: '/aurora', icon: Sparkles, labelEn: 'Aurora', labelHe: 'אורורה' },
  { id: 'me', path: '/me', icon: User, labelEn: 'Me', labelHe: 'אני' },
];

interface TopNavBarProps {
  onOpenHypnosis: () => void;
  onOpenSettings: () => void;
}

export function TopNavBar({ onOpenHypnosis, onOpenSettings }: TopNavBarProps) {
  const { language, isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme: brandTheme } = useThemeSettings();

  const isTabActive = (path: string) => {
    if (path === '/today') return location.pathname === '/today' || location.pathname === '/dashboard';
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
                      ? "bg-primary/10 text-primary"
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
          <HeaderActions onOpenHypnosis={onOpenHypnosis} />
        </div>
      </div>
    </header>
  );
}
