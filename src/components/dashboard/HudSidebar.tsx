/**
 * HudSidebar - Desktop-only fixed sidebar showing the character HUD.
 * Rendered at the layout level in DashboardLayout.
 * On mobile, the HUD is shown inline in MobileHeroGrid instead.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useGameState } from '@/contexts/GameStateContext';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import {
  Star, Flame, Zap as ZapIcon, Play, Clock, Brain, Eye, TrendingUp,
  Target, UserCircle, Compass,
} from 'lucide-react';

export function HudSidebar() {
  const { t, language } = useTranslation();
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { sessionStats } = useGameState();
  const { impact } = useHaptics();
  const { openHypnosis } = useAuroraActions();
  const { canAccessHypnosis, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();

  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [insightsTab, setInsightsTab] = useState<string | undefined>();

  const identityTitle = dashboard.identityTitle;
  const readinessVal = Math.min(100, xp.percentage || 85);
  const clarityVal = dashboard.selfConcepts.length > 0 ? 65 : 20;
  const consciousnessVal = dashboard.values.length > 0 ? 72 : 15;

  const handleStartDailySession = () => {
    if (!canAccessHypnosis) {
      showUpgradePrompt('hypnosis');
      return;
    }
    impact('medium');
    openHypnosis();
  };

  return (
    <>
      {/* Fixed sidebar panel */}
      <aside className="hidden lg:flex lg:flex-col w-[280px] xl:w-[300px] flex-shrink-0 h-full overflow-y-auto overflow-x-hidden
        backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80
        dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90
        ltr:border-s rtl:border-e border-border/50 dark:border-primary/15
      ">
        <div className="flex flex-col items-center gap-3 p-3">
          {/* Decorative top accent */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <button onClick={() => setOrbDNAOpen(true)} className="flex items-center justify-center w-full max-w-[240px] aspect-square overflow-visible cursor-pointer">
            <PersonalizedOrb size={220} state="idle" />
          </button>

          {identityTitle && (
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="text-base">{identityTitle.icon}</span>
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {language === 'he' ? identityTitle.title : identityTitle.titleEn}
              </span>
            </div>
          )}

          {/* Level / Tokens / Streak badges */}
          <div className="flex items-center justify-center gap-1.5 w-full">
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
              <Star className="h-2.5 w-2.5" />Lv.{xp.level}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">
              <ZapIcon className="h-2.5 w-2.5" />{tokens.balance}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              <Flame className="h-2.5 w-2.5" />{streak.streak}
            </span>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          {/* Stats grids */}
          <div className="flex flex-col gap-2 w-full">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-chart-4' },
                { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-chart-2' },
                { icon: Brain, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-chart-5' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                  <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                  <span className="text-sm font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { icon: Target, label: language === 'he' ? 'סשנים' : 'Sessions', value: String(sessionStats?.totalSessions || 0), color: 'text-chart-3' },
                { icon: Clock, label: language === 'he' ? 'דקות' : 'Minutes', value: String(sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0), color: 'text-chart-1' },
                { icon: ZapIcon, label: language === 'he' ? 'אנרגיה' : 'Energy', value: String(tokens.balance), color: 'text-chart-2' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                  <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                  <span className="text-sm font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Start Session button */}
            <button
              onClick={handleStartDailySession}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-sm"
            >
              <span className="flex items-center gap-1 text-xs text-primary-foreground/80">
                <Clock className="w-3.5 h-3.5" />15 {t('dashboard.minutesShort')}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-primary-foreground">
                <Play className="w-4 h-4 fill-primary-foreground" />
                {t('dashboard.startSession')}
              </span>
            </button>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {/* Identity / Direction / Insights */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setActiveModal('identity')} className="rounded-xl bg-muted/30 dark:bg-muted/15 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all border border-border/20">
                <UserCircle className="w-4 h-4 text-chart-5" />
                <span className="text-xs font-medium">{t('dashboard.identity')}</span>
              </button>
              <button onClick={() => setActiveModal('direction')} className="rounded-xl bg-muted/30 dark:bg-muted/15 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all border border-border/20">
                <Compass className="w-4 h-4 text-chart-2" />
                <span className="text-xs font-medium">{t('dashboard.direction')}</span>
              </button>
              <button onClick={() => setActiveModal('insights')} className="rounded-xl bg-muted/30 dark:bg-muted/15 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all border border-border/20">
                <Brain className="w-4 h-4 text-chart-3" />
                <span className="text-xs font-medium">{t('dashboard.insights')}</span>
              </button>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </aside>

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
        initialTab={insightsTab}
      />
      {upgradeFeature && (
        <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
      )}
    </>
  );
}
