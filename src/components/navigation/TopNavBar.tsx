/**
 * @module navigation/TopNavBar
 * @tab Global
 * @purpose Desktop top navigation bar with color-coded tabs, Aurora orb, and FM
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { AppNameDropdown } from '@/components/navigation/AppNameDropdown';
import { getVisibleTabs } from '@/navigation/osNav';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';

/** Per-tab color schemes — matches BottomTabBar */
const TAB_COLORS: Record<string, { active: string; bg: string; bgInactive: string; ring: string }> = {
  plan:      { active: 'text-cyan-400',    bg: 'bg-cyan-500/15 border-cyan-500/30',       bgInactive: 'bg-cyan-500/5 border-cyan-500/15',     ring: 'ring-cyan-400/40' },
  fm:        { active: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30',     bgInactive: 'bg-amber-500/5 border-amber-500/15',   ring: 'ring-amber-400/40' },
  community: { active: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', bgInactive: 'bg-emerald-500/5 border-emerald-500/15', ring: 'ring-emerald-400/40' },
  study:     { active: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/30',   bgInactive: 'bg-violet-500/5 border-violet-500/15', ring: 'ring-violet-400/40' },
};

interface TopNavBarProps {
  onOpenSettings: () => void;
}

export function TopNavBar({ onOpenSettings }: TopNavBarProps) {
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
    if (ctx) {
      ctx.setIsDockVisible(true);
      ctx.setIsChatExpanded(true);
    }
  };

  // Build ordered nav items: Plan | Aurora | FM | Community | Study
  const planTab = allTabs.find(t => t.id === 'plan');
  const fmTab = allTabs.find(t => t.id === 'fm');
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
          "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all border",
          isComingSoon
            ? "text-muted-foreground/40 opacity-60 grayscale cursor-default pointer-events-none border-transparent"
            : active
              ? colors.bg
              : colors.bgInactive
        )}
      >
        <Icon className={cn("h-4 w-4", active ? colors.active : `${colors.active} opacity-50`)} />
        <span className={cn(
          active ? colors.active : `${colors.active} opacity-50`
        )}>
          {language === 'he' ? tab.labelHe : tab.labelEn}
        </span>
        {isComingSoon && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-tight bg-destructive text-destructive-foreground">
            Soon
          </span>
        )}
      </button>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-lg"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-screen-2xl mx-auto">
        {/* Left: Logo + Tabs */}
        <div className="flex items-center gap-6">
          <AppNameDropdown onOpenSettings={onOpenSettings} />

          <nav className="flex items-center gap-1.5">
            {/* Path */}
            {planTab && renderTab(planTab)}

            {/* Aurora tab — between Path and FM */}
            <button
              onClick={openAurora}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all border bg-violet-500/5 border-violet-500/15 hover:bg-violet-500/15 hover:border-violet-500/30"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden">
                <StandaloneMorphOrb
                  size={20}
                  profile={AURORA_ORB_PROFILE}
                  geometryFamily="octa"
                  level={100}
                />
              </div>
              <span className="text-violet-400 opacity-80">
                Aurora
              </span>
            </button>

            {/* FM */}
            {fmTab && renderTab(fmTab)}

            {/* Community, Study */}
            {otherTabs.map(renderTab)}
          </nav>
        </div>

        {/* Right: Action icons */}
        <div className="flex items-center gap-1">
          <HeaderActions />
        </div>
      </div>
    </header>
  );
}
