import { useLocation, useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';

const TAB_COLORS: Record<string, { solid: string; text: string; inactive: string }> = {
  fm: { solid: 'bg-amber-500', text: 'text-white', inactive: 'text-amber-400/60' },
  mindos: { solid: 'bg-cyan-500', text: 'text-white', inactive: 'text-cyan-400/60' },
  community: { solid: 'bg-emerald-500', text: 'text-white', inactive: 'text-emerald-400/60' },
  study: { solid: 'bg-violet-500', text: 'text-white', inactive: 'text-violet-400/60' },
};

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();

  if (location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business')) return null;

  const tabs = loading ? [] : getVisibleTabs({ hasRole });

  const isActive = (path: string) => {
    if (path === '/mindos/tactics') {
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
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/100">
      <div className="flex items-center justify-around h-[84px] px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          const colors = TAB_COLORS[tab.id] || TAB_COLORS.mindos;
          const label = tab.labelEn;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              aria-label={label}
              title={label}
              className="relative flex items-center justify-center px-2 py-1.5 transition-all min-w-[60px]"
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                  active ? `${colors.solid} shadow-lg ring-2 ring-white/80` : 'bg-muted/40'
                )}
              >
                <Icon className={cn('h-7 w-7 transition-colors', active ? colors.text : colors.inactive)} />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
