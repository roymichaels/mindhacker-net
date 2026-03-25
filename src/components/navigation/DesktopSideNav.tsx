import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';

const TAB_COLORS: Record<string, { bg: string; active: string; inactive: string }> = {
  fm: {
    bg: 'bg-amber-500/15 border-amber-500/30',
    active: 'text-amber-300',
    inactive: 'text-amber-400/60',
  },
  mindos: {
    bg: 'bg-cyan-500/15 border-cyan-500/30',
    active: 'text-cyan-300',
    inactive: 'text-cyan-400/60',
  },
  community: {
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    active: 'text-emerald-300',
    inactive: 'text-emerald-400/60',
  },
  study: {
    bg: 'bg-violet-500/15 border-violet-500/30',
    active: 'text-violet-300',
    inactive: 'text-violet-400/60',
  },
};

export function DesktopSideNav() {
  const { isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();

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
    <nav
      className={cn(
        'hidden md:flex w-20 shrink-0 flex-col items-center gap-3 border-border/50 bg-background px-2 py-4',
        isRTL ? 'border-l' : 'border-r'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
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
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl border transition-all',
              active ? `${colors.bg} shadow-lg ring-2 ring-white/10` : 'border-transparent bg-muted/25 hover:bg-muted/40'
            )}
          >
            <Icon className={cn('h-6 w-6', active ? colors.active : colors.inactive)} />
          </button>
        );
      })}
    </nav>
  );
}
