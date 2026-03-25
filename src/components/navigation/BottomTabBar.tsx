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

export function BottomTabBar() {
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();

  if (location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business')) return null;

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
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="grid h-[84px] grid-cols-4 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const color = TAB_COLORS[tab.id] || 'text-primary';

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl transition-colors',
                active ? 'bg-muted/70' : 'hover:bg-muted/40'
              )}
            >
              <Icon className={cn('h-5 w-5 transition-colors', active ? color : 'text-muted-foreground')} />
              <span className={cn('text-[11px] font-semibold', active ? 'text-foreground' : 'text-muted-foreground')}>
                {language === 'he' ? tab.labelHe : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
