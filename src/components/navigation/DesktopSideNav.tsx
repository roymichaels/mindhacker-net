import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';

const TAB_COLORS: Record<string, string> = {
  fm: 'text-amber-500',
  mindos: 'text-cyan-400',
  community: 'text-emerald-500',
  study: 'text-violet-400',
};

export function DesktopSideNav() {
  const { language, isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();

  const tabs = loading ? [] : getVisibleTabs({ hasRole });

  const isActive = (path: string) => {
    if (path === '/mindos/chat') {
      return (
        location.pathname.startsWith('/mindos') ||
        location.pathname === '/play' ||
        location.pathname === '/aurora' ||
        location.pathname === '/work' ||
        location.pathname === '/now' ||
        location.pathname === '/plan' ||
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/strategy')
      );
    }
    if (path === '/fm') return location.pathname.startsWith('/fm');
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        'hidden md:flex w-52 shrink-0 flex-col gap-2 border-border/50 bg-background px-2 py-3',
        isRTL ? 'border-l' : 'border-r'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.path);
        const Icon = tab.icon;
        const color = TAB_COLORS[tab.id] || 'text-primary';

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
              active
                ? 'border-primary/20 bg-muted text-foreground'
                : 'border-transparent bg-transparent text-muted-foreground hover:bg-muted/40'
            )}
          >
            <Icon className={cn('h-5 w-5 shrink-0', active ? color : 'text-muted-foreground')} />
            <span className={cn('truncate', active ? 'text-foreground' : 'text-muted-foreground')}>
              {language === 'he' ? tab.labelHe : tab.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
