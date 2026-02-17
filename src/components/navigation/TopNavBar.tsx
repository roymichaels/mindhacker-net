import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Target, Sparkles, User, Compass, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { TasksPopover } from '@/components/dashboard/TasksPopover';
import { GoalsPopover } from '@/components/dashboard/GoalsPopover';
import { UserNotificationBell } from '@/components/UserNotificationBell';
import { AuroraOrbIcon } from '@/components/icons/AuroraOrbIcon';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import AuroraAccountDropdown from '@/components/aurora/AuroraAccountDropdown';
import { usePractitionersModal } from '@/contexts/PractitionersModalContext';

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
  const { openPractitioners } = usePractitionersModal();

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
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <AuroraOrbIcon className="w-8 h-8 text-foreground" size={32} />
            <span className="font-bold text-sm text-foreground hidden lg:inline">
              {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
            </span>
          </Link>

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

        {/* Right: Action icons + Account */}
        <div className="flex items-center gap-1">
          <TasksPopover />
          <GoalsPopover />
          <button
            className="h-9 w-9 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center hover:brightness-110 transition"
            onClick={() => openPractitioners()}
            title={language === 'he' ? 'מאמנים' : 'Coaches'}
          >
            <Users className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          </button>
          <button
            className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center hover:brightness-110 transition"
            onClick={onOpenHypnosis}
            title={language === 'he' ? 'כוח-על' : 'Power-Up'}
          >
            <Compass className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </button>
          <UserNotificationBell />
          <div className="ms-2">
            <AuroraAccountDropdown isCollapsed={false} onOpenSettings={onOpenSettings} />
          </div>
        </div>
      </div>
    </header>
  );
}
