/**
 * @module navigation/BottomTabBar
 * @tab Global
 * @purpose Mobile bottom navigation bar with FM center orb + Aurora between FM & Path
 */
import { useState, useEffect } from 'react';
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
import { useUnreadBadge } from '@/hooks/useUnreadBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';


/** Per-tab solid color schemes */
const TAB_COLORS: Record<string, { solid: string; text: string; inactive: string }> = {
  plan:      { solid: 'bg-cyan-500',    text: 'text-white', inactive: 'text-cyan-400/60' },
  fm:        { solid: 'bg-amber-500',   text: 'text-white', inactive: 'text-amber-400/60' },
  community: { solid: 'bg-emerald-500', text: 'text-white', inactive: 'text-emerald-400/60' },
  study:     { solid: 'bg-violet-500',  text: 'text-white', inactive: 'text-violet-400/60' },
};

export function BottomTabBar() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, loading } = useUserRoles();
  const { profile: userOrbProfile } = useOrbProfile();
  const xp = useXpProgress();
  const ctx = useAuroraChatContextSafe();
  const unreadCount = useUnreadBadge();
  const [showBalloon, setShowBalloon] = useState(false);

  // Show balloon after 3s, auto-hide after 8s
  useEffect(() => {
    const dismissed = sessionStorage.getItem('aurora-bar-balloon-dismissed');
    if (dismissed) return;
    const showTimer = setTimeout(() => setShowBalloon(true), 3000);
    const hideTimer = setTimeout(() => setShowBalloon(false), 11000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  if (location.pathname.startsWith('/coaches') || location.pathname.startsWith('/business')) return null;

  const allTabs = loading ? [] : getVisibleTabs({ hasRole });

  const isActive = (path: string) => {
    if (path === '/play') return location.pathname === '/play' || location.pathname === '/plan' || location.pathname === '/now' || location.pathname === '/dashboard';
    if (path === '/fm') return location.pathname.startsWith('/fm');
    return location.pathname.startsWith(path);
  };

  const openAurora = () => {
    setShowBalloon(false);
    sessionStorage.setItem('aurora-bar-balloon-dismissed', '1');
    navigate('/aurora');
  };

  const dismissBalloon = () => {
    setShowBalloon(false);
    sessionStorage.setItem('aurora-bar-balloon-dismissed', '1');
  };

  // Separate Path (center) from regular tabs
  const planTab = allTabs.find(t => t.isCenter);
  const regularTabs = allTabs.filter(t => !t.isCenter);

  // Layout order (LTR): FM | Aurora | Path(center) | Community | Study
  const leftTabs = regularTabs.slice(0, 1); // FM
  const rightTabs = regularTabs.slice(1);   // Community, Study

  const renderTab = (tab: typeof allTabs[0]) => {
    const active = isActive(tab.path);
    const Icon = tab.icon;
    const isComingSoon = 'comingSoon' in tab && tab.comingSoon;
    const colors = TAB_COLORS[tab.id] || TAB_COLORS.plan;

    return (
      <button
        key={tab.id}
        onClick={() => !isComingSoon && navigate(tab.path)}
        className={cn(
          "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px]",
          isComingSoon && "opacity-40 grayscale cursor-default",
          active ? colors.activeBg : "bg-transparent"
        )}
      >
        <Icon className={cn("h-5 w-5", active ? colors.active : colors.inactive)} />
        <span className={cn(
          "text-[10px] font-bold",
          active ? colors.active : colors.inactive
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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-background/100 border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Left: FM */}
        {leftTabs.map(renderTab)}

        {/* Aurora — flat tab style */}
        <button
          onClick={openAurora}
          className={cn(
            "relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[56px]",
            location.pathname === '/aurora'
              ? "bg-pink-500/20"
              : "bg-transparent"
          )}
        >
          <AnimatePresence>
            {showBalloon && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={(e) => { e.stopPropagation(); dismissBalloon(); }}
                className="absolute bottom-full mb-2 z-50 cursor-pointer"
              >
                <div className="relative bg-primary text-primary-foreground rounded-2xl px-3.5 py-2 shadow-lg whitespace-nowrap">
                  <p className="text-[11px] font-semibold leading-tight">
                    {isHe ? '👋 היי, אני אורורה!' : '👋 Hey, I\'m Aurora!'}
                  </p>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    {isHe ? 'לחצ/י עליי לשוחח' : 'Tap me to chat'}
                  </p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45 rounded-sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-6 h-6 rounded-full overflow-hidden">
            <StandaloneMorphOrb
              size={24}
              profile={AURORA_ORB_PROFILE}
              geometryFamily="octa"
              level={100}
            />
          </div>
          <span className={cn("text-[10px] font-bold", location.pathname === '/aurora' ? "text-pink-400" : "text-pink-400/50")}>Aurora</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Path — center elevated button */}
        {planTab && (
          <div className="relative -mt-5 flex flex-col items-center gap-0.5">
            <button
              onClick={() => navigate(planTab.path)}
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                isActive(planTab.path)
                  ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  : "bg-cyan-600 shadow-lg"
              )}
            >
              <Play className="h-5 w-5 text-white ms-0.5" fill="currentColor" />
            </button>
          </div>
        )}

        {/* Right: Community, Study */}
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
