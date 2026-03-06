/**
 * BottomHudBar — Compact character HUD docked to the bottom of the screen.
 * Single "Profile" button opens the unified CharacterProfileModal.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { CharacterProfileModal } from '@/components/modals/CharacterProfileModal';
import { Star, Flame, Zap, UserCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function BottomHudBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();

  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const identityTitle = dashboard.identityTitle;

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-lg",
          "bottom-14 md:bottom-0"
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2.5 px-3 py-2 max-w-screen-xl mx-auto">
          {/* Orb */}
          <button
            onClick={() => setOrbDNAOpen(true)}
            className="flex-shrink-0 w-12 h-12 rounded-full overflow-visible"
          >
            <PersonalizedOrb size={48} state="idle" />
          </button>

          {/* Identity + XP */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Identity row */}
            <div className="flex items-center gap-1.5 min-w-0">
              {identityTitle && (
                <>
                  <span className="text-sm flex-shrink-0">{identityTitle.icon}</span>
                  <span className="text-xs font-bold text-foreground truncate">
                    {isHe ? identityTitle.title : identityTitle.titleEn}
                  </span>
                </>
              )}
            </div>

            {/* Badges + XP bar */}
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                <Star className="h-2.5 w-2.5" />Lv.{xp.level}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Zap className="h-2.5 w-2.5" />{tokens.balance}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                <Flame className="h-2.5 w-2.5" />{streak.streak}
              </span>
            </div>

            {/* XP bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] text-muted-foreground whitespace-nowrap">
                EXP {xp.current ?? 0} / {xp.required ?? 100} ({xp.percentage}%)
              </span>
              <Progress value={xp.percentage} className="h-1 flex-1 bg-muted/50" />
            </div>
          </div>

          {/* Single Profile button */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setProfileOpen(true)}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-muted/30 active:scale-[0.95] transition-all"
            >
              <UserCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">{isHe ? 'פרופיל' : 'Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <CharacterProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
