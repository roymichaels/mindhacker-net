/**
 * BottomHudBar — 3-column grid HUD.
 * Left: Personalized orb + job title → opens Profile
 * Middle: XP progress bar
 * Right: Aurora orb → opens Aurora dock (with intro balloon)
 */
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { CharacterProfileModal } from '@/components/modals/CharacterProfileModal';
import { StandaloneMorphOrb } from '@/components/orb/GalleryMorphOrb';
import { AURORA_ORB_PROFILE } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Progress } from '@/components/ui/progress';
import { useTodayExecution } from '@/hooks/useTodayExecution';

export function BottomHudBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const ctx = useAuroraChatContextSafe();
  const { movementScore } = useTodayExecution();

  const [profileOpen, setProfileOpen] = useState(false);
  const [showBalloon, setShowBalloon] = useState(false);

  const identityTitle = dashboard.identityTitle;

  // Movement score drives orb glow intensity
  const orbGlowStyle = useMemo(() => {
    const pct = Math.min(100, Math.max(0, movementScore));
    if (pct === 0) return {};
    const opacity = 0.15 + (pct / 100) * 0.55;
    const spread = 2 + (pct / 100) * 8;
    return {
      boxShadow: `0 0 ${spread}px ${spread / 2}px hsl(var(--primary) / ${opacity})`,
      borderRadius: '50%',
    };
  }, [movementScore]);

  // Show balloon after 3s, hide after 8s
  useEffect(() => {
    const dismissed = sessionStorage.getItem('aurora-balloon-dismissed');
    if (dismissed) return;
    const showTimer = setTimeout(() => setShowBalloon(true), 3000);
    const hideTimer = setTimeout(() => setShowBalloon(false), 11000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, []);

  const openAurora = () => {
    setShowBalloon(false);
    sessionStorage.setItem('aurora-balloon-dismissed', '1');
    if (ctx) {
      ctx.setIsDockVisible(true);
      ctx.setIsChatExpanded(true);
    }
  };

  const dismissBalloon = () => {
    setShowBalloon(false);
    sessionStorage.setItem('aurora-balloon-dismissed', '1');
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-lg",
          "bottom-14 md:bottom-0"
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 px-3 py-2 max-w-screen-xl mx-auto">
          {/* ── LEFT: Orb + Job Title → Profile ── */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-muted/30 active:scale-[0.97] transition-all min-w-0"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-full transition-shadow duration-700" style={orbGlowStyle}>
              <PersonalizedOrb size={44} state={movementScore >= 80 ? 'speaking' : 'idle'} renderer="css" />
            </div>
            {identityTitle && (
              <div className="min-w-0 flex flex-col">
                <span className="text-[10px] text-muted-foreground leading-none">
                  {identityTitle.icon}
                </span>
                <span className="text-[11px] font-bold text-foreground max-w-[100px] leading-tight line-clamp-2">
                  {isHe ? identityTitle.title : identityTitle.titleEn}
                </span>
              </div>
            )}
          </button>

          {/* ── MIDDLE: XP Progress Bar ── */}
          <div className="flex flex-col items-center justify-center gap-0.5 px-2 min-w-0">
            <div className="flex items-center gap-1.5 w-full">
              <span className="text-[9px] font-bold text-primary whitespace-nowrap">
                Lv.{xp.level}
              </span>
              <Progress value={xp.percentage} className="h-1.5 flex-1 bg-muted/50" />
              <span className="text-[8px] text-muted-foreground whitespace-nowrap tabular-nums">
                {xp.current ?? 0}/{xp.required ?? 100}
              </span>
            </div>
          </div>

          {/* ── RIGHT: Aurora Orb → Opens Dock ── */}
          <div className="relative">
            {/* Balloon tooltip */}
            <AnimatePresence>
              {showBalloon && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  onClick={dismissBalloon}
                  className={cn(
                    "absolute bottom-full mb-2 z-50 cursor-pointer",
                    isRTL ? "left-0" : "right-0"
                  )}
                >
                  <div className="relative bg-primary text-primary-foreground rounded-2xl px-3.5 py-2 shadow-lg whitespace-nowrap">
                    <p className="text-[11px] font-semibold leading-tight">
                      {isHe ? '👋 היי, אני אורורה!' : '👋 Hey, I\'m Aurora!'}
                    </p>
                    <p className="text-[10px] opacity-90 mt-0.5">
                      {isHe ? 'לחצ/י עליי לשוחח' : 'Tap me to chat'}
                    </p>
                    {/* Tail arrow */}
                    <div className={cn(
                      "absolute -bottom-1.5 w-3 h-3 bg-primary rotate-45 rounded-sm",
                      isRTL ? "left-4" : "right-4"
                    )} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={openAurora}
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted/30 active:scale-[0.95] transition-all"
            >
              <StandaloneMorphOrb
                size={44}
                profile={AURORA_ORB_PROFILE}
                geometryFamily="octa"
                level={100}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CharacterProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
