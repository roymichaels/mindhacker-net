/**
 * @module navigation/DesktopSideNav
 * @purpose Persistent vertical sidebar for desktop (md+) showing the same tabs as BottomTabBar.
 * FM | Aurora | Path | Community | Study — styled with matching color-coded themes.
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Flame } from 'lucide-react';

/** Per-tab color schemes */
const TAB_COLORS: Record<string, { active: string; bg: string; bgInactive: string }> = {
  plan:      { active: 'text-cyan-600 dark:text-cyan-400',      bg: 'bg-cyan-500/15 border-cyan-500/30',       bgInactive: 'bg-cyan-500/5 border-cyan-500/15' },
  fm:        { active: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/15 border-amber-500/30',     bgInactive: 'bg-amber-500/5 border-amber-500/15' },
  community: { active: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', bgInactive: 'bg-emerald-500/5 border-emerald-500/15' },
  study:     { active: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-500/15 border-violet-500/30',   bgInactive: 'bg-violet-500/5 border-violet-500/15' },
};

export function DesktopSideNav() {
  const { language, isRTL } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();
  const ctx = useAuroraChatContextSafe();

  const allTabs = loading ? [] : getVisibleTabs({ hasRole });

  const isTabActive = (path: string) => {
    if (path === '/plan') return location.pathname === '/plan' || location.pathname === '/now' || location.pathname === '/dashboard';
    if (path === '/fm/earn') return location.pathname.startsWith('/fm');
    return location.pathname.startsWith(path);
  };

  const openAurora = () => {
    navigate('/aurora');
  };

  // Same order as bottom bar: FM | Aurora | Path | Community | Study
  const fmTab = allTabs.find(t => t.id === 'fm');
  const planTab = allTabs.find(t => t.id === 'plan');
  const otherTabs = allTabs.filter(t => t.id !== 'plan' && t.id !== 'fm');

  const renderTab = (tab: typeof allTabs[0]) => {
    const active = isTabActive(tab.path);
    const Icon = tab.icon;
    const isComingSoon = 'comingSoon' in tab && tab.comingSoon;
    const colors = TAB_COLORS[tab.id] || TAB_COLORS.plan;

    return (
      <button
        key={tab.id}
        onClick={() => !isComingSoon && navigate(tab.path)}
        disabled={isComingSoon}
        className={cn(
          "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border",
          isComingSoon
            ? "text-muted-foreground/40 opacity-60 grayscale cursor-default pointer-events-none border-transparent"
            : active
              ? colors.bg
              : `${colors.bgInactive} hover:opacity-100`
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", active ? colors.active : `${colors.active} opacity-80`)} />
        <span className={cn("truncate", active ? colors.active : `${colors.active} opacity-80`)}>
          {language === 'he' ? tab.labelHe : tab.labelEn}
        </span>
        {isComingSoon && (
          <span className="text-[8px] font-bold px-1 py-0.5 rounded-full leading-tight bg-destructive text-destructive-foreground ms-auto">
            Soon
          </span>
        )}
      </button>
    );
  };

  return (
    <nav
      className={cn(
        "hidden md:flex flex-col w-48 lg:w-52 flex-shrink-0 py-3 px-2 gap-1",
        "bg-background border-border/50",
        isRTL ? "border-l" : "border-r"
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* FM */}
      {fmTab && renderTab(fmTab)}

      {/* Aurora */}
      <button
        onClick={openAurora}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border",
          location.pathname === '/aurora'
            ? "bg-pink-500/15 border-pink-500/30"
            : "bg-pink-500/5 border-pink-500/15 hover:bg-pink-500/15 hover:border-pink-500/30"
        )}
      >
        <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
          <StandaloneMorphOrb
            size={20}
            profile={AURORA_ORB_PROFILE}
            geometryFamily="octa"
            level={100}
          />
        </div>
        <span className="text-pink-600 dark:text-pink-400 opacity-90 truncate">Aurora</span>
      </button>

      {/* Path — highlighted */}
      {planTab && (() => {
        const active = isTabActive(planTab.path);
        const colors = TAB_COLORS.plan;
        return (
          <button
            onClick={() => navigate(planTab.path)}
            className={cn(
              "relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all border",
              active ? colors.bg : colors.bgInactive
            )}
          >
            <Flame className={cn("h-5 w-5 flex-shrink-0", active ? colors.active : `${colors.active} opacity-80`)} />
            <span className={cn("truncate", active ? colors.active : `${colors.active} opacity-80`)}>
              {language === 'he' ? planTab.labelHe : planTab.labelEn}
            </span>
          </button>
        );
      })()}

      {/* Community, Study */}
      {otherTabs.map(renderTab)}
    </nav>
  );
}
