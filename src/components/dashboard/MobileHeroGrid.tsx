/**
 * MobileHeroGrid - 3-column hero grid
 * RTL: Plan (left) | Daily Session (middle) | HUD (right)
 */
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';

import { useAuth } from '@/contexts/AuthContext';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { Play, Clock, Flame, Zap as ZapIcon, Star, ListChecks, Sparkles, TrendingUp, Eye, ChevronDown, UserCircle, Compass, Brain, Target, Activity } from 'lucide-react';
import { DailyRoadmap } from '@/components/dashboard/DailyRoadmap';
import { CommunityPulse } from '@/components/community/CommunityPulse';
import { CommandTimeline } from '@/components/dashboard/CommandTimeline';
import { MotivationalBanner } from '@/components/dashboard/MotivationalBanner';
import { NowSection } from '@/components/dashboard/NowSection';
import { TodayScheduleCard } from '@/components/execution/TodayScheduleCard';
import { MovementScoreCard } from '@/components/execution/MovementScoreCard';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { CurrentWeekPlanCard } from '@/components/dashboard/CurrentWeekPlanCard';
import { StartSessionButton } from '@/components/dashboard/StartSessionButton';
import { RecalibrationSummary } from '@/components/dashboard/RecalibrationSummary';
import { useGameState } from '@/contexts/GameStateContext';
import { useNavigate } from 'react-router-dom';
import { useDailyHypnosis } from '@/hooks/useDailyHypnosis';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import { VerticalRoadmap } from '@/components/dashboard/VerticalRoadmap';
import UpgradePromptModal from '@/components/subscription/UpgradePromptModal';

interface MobileHeroGridProps {
  planData: {
    currentWeek: number;
    progressPercent: number;
    currentMonth: number;
    currentMilestone?: { title: string } | null;
  } | null | undefined;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { suggestedGoal } = useDailyHypnosis();
  const { impact } = useHaptics();
  const { openHypnosis } = useAuroraActions();
  const { canAccessHypnosis, showUpgradePrompt, upgradeFeature, dismissUpgrade } = useSubscriptionGate();
  
  const { sessionStats } = useGameState();
  const execution = useTodayExecution();
  const [executionAction, setExecutionAction] = useState<any>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const handleExecuteAction = (action: any) => {
    setExecutionAction(action);
    setExecutionOpen(true);
  };

  const leftColRef = useRef<HTMLDivElement>(null);
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [insightsTab, setInsightsTab] = useState<string | undefined>();
  const [orbDNAOpen, setOrbDNAOpen] = useState(false);

  const handleStartDailySession = () => {
    if (!canAccessHypnosis) {
      showUpgradePrompt('hypnosis');
      return;
    }
    impact('medium');
    openHypnosis();
  };

  const identityTitle = dashboard.identityTitle;
  const readinessVal = Math.min(100, xp.percentage || 85);
  const clarityVal = dashboard.selfConcepts.length > 0 ? 65 : 20;
  const consciousnessVal = dashboard.values.length > 0 ? 72 : 15;


  // Orb: fixed size on mobile, constrained on desktop
  const orbSize = 280;

  return (
    <div className="flex flex-col w-full">
      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-col gap-0">

        {/* ===== Mobile HUD (hidden on desktop — HudSidebar handles it) ===== */}
        <div className="p-4 pt-0 hidden">
          {/* Mobile: 3-col compact grid */}
          <div className="flex flex-col gap-2 lg:hidden">
            {/* Top: Identity + Orb side by side */}
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
              {/* Orb - right side (appears first in RTL) */}
              <button onClick={() => setOrbDNAOpen(true)} className="relative flex items-center justify-center overflow-visible w-[275px] h-[275px] order-2 rtl:order-1 cursor-pointer">
                <PersonalizedOrb size={275} state="idle" />
              </button>
              {/* Identity + badges - left side */}
              <div className="flex flex-col gap-2 order-1 rtl:order-2">
                {identityTitle && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{identityTitle.icon}</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-primary to-rose-400 bg-clip-text text-transparent leading-tight">
                      {language === 'he' ? identityTitle.title : identityTitle.titleEn}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-evenly gap-2 w-full">
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                    <Star className="h-3 w-3" />Lv.{xp.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                    <ZapIcon className="h-3 w-3 fill-yellow-500/30" />{tokens.balance}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    <Flame className="h-3 w-3" />{streak.streak}
                  </span>
                </div>
              </div>
            </div>
            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {/* Bottom: Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Brain, label: language === 'he' ? 'תודעה' : 'Awareness', value: String(consciousnessVal), color: 'text-amber-500' },
                { icon: Eye, label: language === 'he' ? 'בהירות' : 'Clarity', value: `${clarityVal}%`, color: 'text-blue-500' },
                { icon: TrendingUp, label: language === 'he' ? 'מוכנות' : 'Readiness', value: `${readinessVal}%`, color: 'text-green-500' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/30 border border-border/50 px-2 py-2 flex flex-col items-center gap-1 text-center">
                  <m.icon className={cn("w-3.5 h-3.5 shrink-0", m.color)} />
                  <span className="text-xs font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{m.label}</span>
                </div>
              ))}
            </div>
            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {/* Hypnosis session stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Target, label: language === 'he' ? 'סשנים' : 'Sessions', value: String(sessionStats?.totalSessions || 0), color: 'text-purple-500' },
                { icon: Clock, label: language === 'he' ? 'דקות' : 'Minutes', value: String(sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0), color: 'text-cyan-500' },
                { icon: ZapIcon, label: language === 'he' ? 'אנרגיה' : 'Energy', value: String(tokens.balance), color: 'text-yellow-500' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/30 border border-border/50 px-2 py-2 flex flex-col items-center gap-1 text-center">
                  <m.icon className={cn("w-3.5 h-3.5 shrink-0", m.color)} />
                  <span className="text-xs font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{m.label}</span>
                </div>
              ))}
            </div>
            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {/* Start Session button - mobile only, inside HUD */}
            <button
              onClick={handleStartDailySession}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2.5 hover:brightness-110 active:brightness-90 transition-all touch-manipulation shadow-sm"
            >
              <span className="flex items-center gap-1 text-xs text-amber-950">
                <Clock className="w-3.5 h-3.5" />15 {t('dashboard.minutesShort')}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold text-amber-950">
                <Play className="w-4 h-4 fill-amber-950" />
                {t('dashboard.startSession')}
              </span>
            </button>
            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {/* Identity / Direction / Insights */}
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setActiveModal('identity')} className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all">
                <UserCircle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-medium">{t('dashboard.identity')}</span>
              </button>
              <button onClick={() => setActiveModal('direction')} className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all">
                <Compass className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium">{t('dashboard.direction')}</span>
              </button>
              <button onClick={() => setActiveModal('insights')} className="rounded-xl bg-card/30 backdrop-blur-sm p-2.5 flex flex-col items-center gap-1 hover:bg-accent/10 transition-all">
                <Brain className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-medium">{t('dashboard.insights')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* ===== COL 2 - Plan Modules ===== */}
        <div ref={leftColRef} className="flex flex-col gap-4 flex-1 px-1">
          <div className="pt-1" />

          {/* 🔥 Now Engine — Daily Execution Queue */}
          <NowSection />

          {/* 📅 Today Schedule Timeline */}
          {execution.schedule.length > 0 && (
            <TodayScheduleCard schedule={execution.schedule} onActionClick={handleExecuteAction} />
          )}

          {/* 📊 Movement Score */}
          {execution.queue.length > 0 && (
            <MovementScoreCard
              score={execution.movementScore}
              bodyCovered={execution.bodyCovered}
              mindCovered={execution.mindCovered}
              arenaCovered={execution.arenaCovered}
              actionsCompleted={execution.actionsCompleted}
              actionsTotal={execution.actionsTotal}
              isMinDayMode={execution.isMinDayMode}
            />
          )}

          {/* 90-Day Plan Card */}
          <CurrentWeekPlanCard />

          <StartSessionButton />

          {/* Motivational Banner */}
          <MotivationalBanner />

          {/* Command Timeline (Plus/Apex only - auto-hides for Free) */}
          <CommandTimeline />

          {/* Community Pulse */}
          <CommunityPulse />

          {/* Daily Roadmap - unified timeline */}
          <DailyRoadmap />

          {/* Weekly Recalibration Summary */}
          <RecalibrationSummary />

        </div>

        {/* Desktop roadmap now in RoadmapSidebar */}
      </div>

      {/* Modals */}
      <MergedIdentityModal
        open={activeModal === 'identity'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        values={dashboard.values}
        principles={dashboard.principles}
        selfConcepts={dashboard.selfConcepts}
        identityTitle={identityTitle}
      />
      <MergedDirectionModal
        open={activeModal === 'direction'}
        onOpenChange={(open) => !open && setActiveModal(null)}
        language={language}
        commitments={dashboard.activeCommitments}
        anchors={dashboard.dailyAnchors}
      />
      <MergedInsightsModal
        open={activeModal === 'insights'}
        onOpenChange={(open) => { if (!open) { setActiveModal(null); setInsightsTab(undefined); } }}
        language={language}
        initialTab={insightsTab}
      />
      <OrbDNAModal open={orbDNAOpen} onOpenChange={setOrbDNAOpen} />
      <UpgradePromptModal feature={upgradeFeature} onDismiss={dismissUpgrade} />
      {executionAction && (
        <ExecutionModal
          open={executionOpen}
          onOpenChange={setExecutionOpen}
          action={executionAction}
          onComplete={() => execution.refetch()}
        />
      )}
    </div>
  );
}
