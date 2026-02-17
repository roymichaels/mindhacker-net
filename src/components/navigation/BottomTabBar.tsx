import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Sparkles, User } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'today', path: '/today', icon: LayoutDashboard, labelEn: 'Today', labelHe: 'היום' },
  { id: 'plan', path: '/plan', icon: Target, labelEn: 'Plan', labelHe: 'תוכנית' },
  { id: 'aurora', path: '/aurora', icon: Sparkles, labelEn: 'Aurora', labelHe: 'אורורה' },
  { id: 'me', path: '/me', icon: User, labelEn: 'Me', labelHe: 'אני' },
];

export function BottomTabBar() {
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const isTabActive = (path: string) => {
    if (path === '/today') return location.pathname === '/today' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const active = isTabActive(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "fill-primary/20")} />
              <span className="text-[10px] font-medium leading-none">
                {language === 'he' ? tab.labelHe : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
