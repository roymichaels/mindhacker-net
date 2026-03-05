/**
 * BottomHudBar — Compact character HUD docked to the bottom of the screen.
 * On mobile: sits below the bottom tab bar.
 * On desktop: fixed to the bottom edge.
 * Shows: Orb + identity title, level/tokens/streak badges, XP bar, 4 quick-action buttons.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import { SkillsModal } from '@/components/modals/SkillsModal';
import { Star, Flame, Zap, UserCircle, Compass, Brain, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function BottomHudBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();

  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  type ModalType = 'identity' | 'direction' | 'insights' | 'skills' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const identityTitle = dashboard.identityTitle;

  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur-lg",
          // Mobile: below bottom tabs (h-14 tab bar). Desktop: at very bottom.
          "bottom-14 md:bottom-0"
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2.5 px-3 py-2 max-w-screen-xl mx-auto">
          {/* Orb */}
          <button
            onClick={() => setOrbDNAOpen(true)}
            className="flex-shrink-0 w-10 h-10 rounded-full overflow-visible"
          >
            <PersonalizedOrb size={40} state="idle" />
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

          {/* Quick action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {[
              { key: 'skills' as ModalType, icon: Target, label: isHe ? 'כישורים' : 'Skills' },
              { key: 'insights' as ModalType, icon: Brain, label: isHe ? 'תובנות' : 'Insights' },
              { key: 'direction' as ModalType, icon: Compass, label: isHe ? 'כיוון' : 'Direction' },
              { key: 'identity' as ModalType, icon: UserCircle, label: isHe ? 'זהות' : 'Identity' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveModal(btn.key)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <btn.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[8px] text-muted-foreground">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <MergedIdentityModal
        open={activeModal === 'identity'} onOpenChange={(o) => !o && setActiveModal(null)} language={language}
        values={dashboard.values} principles={dashboard.principles} selfConcepts={dashboard.selfConcepts}
        identityTitle={dashboard.identityTitle}
      />
      <MergedDirectionModal
        open={activeModal === 'direction'} onOpenChange={(o) => !o && setActiveModal(null)} language={language}
        commitments={dashboard.activeCommitments} anchors={dashboard.dailyAnchors}
      />
      <MergedInsightsModal
        open={activeModal === 'insights'} onOpenChange={(o) => !o && setActiveModal(null)} language={language}
      />
      <SkillsModal
        open={activeModal === 'skills'} onOpenChange={(o) => !o && setActiveModal(null)}
      />
    </>
  );
}
