/**
 * @module navigation/BottomTabBar
 * @tab Global
 * @purpose Mobile bottom navigation bar with Aurora orb center + color-coded tabs
 */
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { cn } from '@/lib/utils';
import { getVisibleTabs } from '@/navigation/osNav';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import { useOrbProfile } from '@/hooks/useOrbProfile';
import { useXpProgress } from '@/hooks/useGameState';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';

/** Per-tab color schemes */
const TAB_COLORS: Record<string, { active: string; bg: string; bgInactive: string; ring: string }> = {
  profile:   { active: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30',     bgInactive: 'bg-amber-500/5 border-amber-500/15',   ring: 'ring-amber-400/40' },
  plan:      { active: 'text-cyan-400',    bg: 'bg-cyan-500/15 border-cyan-500/30',       bgInactive: 'bg-cyan-500/5 border-cyan-500/15',     ring: 'ring-cyan-400/40' },
  community: { active: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', bgInactive: 'bg-emerald-500/5 border-emerald-500/15', ring: 'ring-emerald-400/40' },
  study:     { active: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/30',   bgInactive: 'bg-violet-500/5 border-violet-500/15', ring: 'ring-violet-400/40' },
};

export function BottomTabBar() {
  const { language } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();
  const { profile: userOrbProfile } = useOrbProfile();
  const xp = useXpProgress();
  const ctx = useAuroraChatContextSafe();

  if (location.pathname.startsWith('/fm') || location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business')) return null;

  const tabs = loading ? [] : getVisibleTabs({ hasRole });

  const isActive = (path: string) => {
    if (path === '/plan') return location.pathname === '/plan' || location.pathname === '/now' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const openAurora = () => {
    if (ctx) {
      ctx.setIsDockVisible(true);
      ctx.setIsChatExpanded(true);
    }
  };

  // Split tabs into left and right halves for Aurora orb center
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  const renderTab = (tab: typeof tabs[0]) => {
    const active = isActive(tab.path);
    const Icon = tab.icon;
    const isComingSoon = 'comingSoon' in tab && tab.comingSoon;
    const colors = TAB_COLORS[tab.id] || TAB_COLORS.plan;

    return (
      <button
        key={tab.id}
        onClick={() => !isComingSoon && navigate(tab.path)}
        className={cn(
          "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px] border",
          isComingSoon && "opacity-40 grayscale cursor-default",
          active ? colors.bg : colors.bgInactive
        )}
      >
        {tab.useOrb ? (
          <div className={cn(
            "w-6 h-6 rounded-full overflow-hidden transition-all",
            active && `ring-2 ${colors.ring}`
          )}>
            <StandaloneMorphOrb
              size={24}
              profile={userOrbProfile}
              geometryFamily={userOrbProfile.geometryFamily || 'sphere'}
              level={xp.level}
            />
          </div>
        ) : (
          <Icon className={cn("h-5 w-5", active ? colors.active : "text-muted-foreground")} />
        )}
        <span className={cn(
          "text-[10px] font-semibold",
          active ? colors.active : "text-muted-foreground"
        )}>
          {language === 'he' ? tab.labelHe : tab.labelEn}
        </span>
        {isComingSoon && (
          <span className="absolute -top-1 -right-1 text-[7px] font-bold px-1 py-px rounded-full leading-tight bg-destructive text-destructive-foreground">
            Soon
          </span>
        )}
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Left tabs */}
        {leftTabs.map(renderTab)}

        {/* Aurora Orb — center */}
        <button
          onClick={openAurora}
          className="relative -mt-5 flex flex-col items-center gap-0.5"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/30 ring-2 ring-violet-500/20">
            <StandaloneMorphOrb
              size={40}
              profile={AURORA_ORB_PROFILE}
              geometryFamily="octa"
              level={100}
            />
          </div>
        </button>

        {/* Right tabs */}
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
