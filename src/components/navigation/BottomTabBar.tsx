import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Store, Briefcase } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard', labelHe: 'דאשבורד' },
  { id: 'projects', path: '/projects', icon: FolderKanban, labelEn: 'Projects', labelHe: 'פרויקטים' },
  { id: 'marketplace', path: '/marketplace', icon: Store, labelEn: 'Coaches', labelHe: 'מאמנים' },
  { id: 'business', path: '/business', icon: Briefcase, labelEn: 'Business', labelHe: 'עסקים', comingSoon: true },
];

export function BottomTabBar() {
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/today' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const isComingSoon = 'comingSoon' in tab && tab.comingSoon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[64px]",
                isComingSoon
                  ? "text-muted-foreground/40 opacity-50 grayscale"
                  : active
                    ? "text-amber-500 dark:text-amber-400"
                    : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{language === 'he' ? tab.labelHe : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
