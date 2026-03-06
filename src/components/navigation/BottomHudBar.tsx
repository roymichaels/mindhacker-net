/**
 * BottomHudBar — 3-column grid HUD.
 * Left: Personalized orb + job title → opens Profile
 * Middle: XP progress bar
 * Right: Aurora orb → opens Aurora dock
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { CharacterProfileModal } from '@/components/modals/CharacterProfileModal';
import { AuroraHoloOrb } from '@/components/aurora/AuroraHoloOrb';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Progress } from '@/components/ui/progress';

export function BottomHudBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const ctx = useAuroraChatContextSafe();

  const [profileOpen, setProfileOpen] = useState(false);

  const identityTitle = dashboard.identityTitle;

  const openAurora = () => {
    if (ctx) {
      ctx.setIsDockVisible(true);
      ctx.setIsChatExpanded(true);
    }
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
            <div className="flex-shrink-0 w-11 h-11 rounded-xl overflow-visible">
              <PersonalizedOrb size={44} state="idle" />
            </div>
            {identityTitle && (
              <div className="min-w-0 flex flex-col">
                <span className="text-[10px] text-muted-foreground leading-none">
                  {identityTitle.icon}
                </span>
                <span className="text-[11px] font-bold text-foreground truncate max-w-[80px] leading-tight">
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
          <button
            onClick={openAurora}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted/30 active:scale-[0.95] transition-all"
          >
            <AuroraHoloOrb size={36} glow="full" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <CharacterProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
