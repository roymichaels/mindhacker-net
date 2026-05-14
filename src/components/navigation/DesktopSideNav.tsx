import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { CANONICAL_SURFACES } from '@/navigation/canonicalSurfaces';

function DesktopSideNavImpl() {
  const { isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Phase C — only the 5 canonical surfaces appear in user-facing nav.
  const tabs = CANONICAL_SURFACES;

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

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
        const label = tab.labelEn;

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            aria-label={label}
            title={label}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl border transition-all',
              active
                ? 'bg-primary/15 border-primary/30 shadow-lg ring-2 ring-white/10'
                : 'border-transparent bg-muted/25 hover:bg-muted/40',
            )}
          >
            <Icon className={cn('h-6 w-6', active ? 'text-primary' : 'text-muted-foreground')} />
          </button>
        );
      })}
    </nav>
  );
}

import { withLegacyGuard } from '@/shellv2/LegacyMountGuard';
export const DesktopSideNav = withLegacyGuard('DesktopSideNav', DesktopSideNavImpl);
