/**
 * HudSidebar - Desktop-only fixed sidebar showing the character HUD.
 * Rendered at the layout level in DashboardLayout.
 * On mobile, the HUD is shown inline in MobileHeroGrid instead.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useXpProgress, useStreak, useEnergy } from '@/hooks/useGameState';
import { useGameState } from '@/contexts/GameStateContext';
import PersonalizedOrb from '@/components/orb/PersonalizedOrb';
import { OrbDNAModal } from '@/components/gamification/OrbDNAModal';
import {
  MergedIdentityModal, MergedDirectionModal, MergedInsightsModal,
} from '@/components/dashboard/MergedModals';
import {
  Star, Flame, Zap as ZapIcon, Clock, Brain, Eye, TrendingUp,
  Target, UserCircle, Compass,
} from 'lucide-react';

export function HudSidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { t, language, isRTL } = useTranslation();
  const dashboard = useUnifiedDashboard();
  const xp = useXpProgress();
  const streak = useStreak();
  const tokens = useEnergy();
  const { sessionStats } = useGameState();

  const [orbDNAOpen, setOrbDNAOpen] = useState(false);
  type ModalType = 'identity' | 'direction' | 'insights' | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [insightsTab, setInsightsTab] = useState<string | undefined>();

  const identityTitle = dashboard.identityTitle;
  const readinessVal = Math.min(100, xp.percentage || 85);
  const clarityVal = dashboard.selfConcepts.length > 0 ? 65 : 20;
  const consciousnessVal = dashboard.values.length > 0 ? 72 : 15;

  return (
    <>
      <aside className={cn(
        "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "ltr:border-s rtl:border-e border-border/50 dark:border-primary/15",
        collapsed ? "w-16 min-w-[64px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
      )}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
            collapsed
              ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
              : "ltr:left-2 rtl:right-2"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed
            ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
            : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
          }
        </button>

        {/* ===== COLLAPSED MINI VIEW ===== */}
        {collapsed && (
          <div className="flex flex-col items-center gap-1 h-full pt-7 pb-2 px-1 overflow-hidden">
            {/* Top: Orb + Level */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setOrbDNAOpen(true)} className="flex items-center justify-center w-10 h-10 overflow-visible cursor-pointer">
                <PersonalizedOrb size={40} state="idle" />
              </button>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                Lv.{xp.level}
              </span>
              {/* MapleStory-style EXP bar */}
              <div className="w-full px-0.5">
                <div className="relative w-full h-3 rounded-sm border border-primary/30 bg-background/80 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 transition-all duration-500"
                    style={{ width: `${xp.percentage || 0}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-b from-white/30 to-transparent"
                    style={{ width: `${xp.percentage || 0}%` }}
                  />
                </div>
                <p className="text-[7px] text-center text-muted-foreground font-mono mt-0.5">
                  {xp.current ?? 0}/{xp.required ?? 100} EXP
                </p>
              </div>
            </div>

            {/* Middle: Stats */}
            <div className="flex flex-col items-center gap-1 w-full px-0.5">
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-1" />
              {[
                { icon: ZapIcon, value: tokens.balance, label: language === 'he' ? 'אנרגיה' : 'Energy', color: 'text-accent-foreground' },
                { icon: Flame, value: streak.streak, label: language === 'he' ? 'רצף' : 'Streak', color: 'text-destructive' },
                { icon: Brain, value: consciousnessVal, label: language === 'he' ? 'תודעה' : 'Aware', color: 'text-chart-5' },
                { icon: Eye, value: `${clarityVal}%`, label: language === 'he' ? 'בהירות' : 'Clarity', color: 'text-chart-2' },
                { icon: TrendingUp, value: `${readinessVal}%`, label: language === 'he' ? 'מוכנות' : 'Ready', color: 'text-chart-4' },
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                  <m.icon className={cn("w-4 h-4", m.color)} />
                  <span className="text-[10px] font-bold leading-none">{m.value}</span>
                </div>
              ))}
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-1" />
            </div>

            {/* Bottom: Modal triggers */}
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => setActiveModal('identity')} className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors">
                <UserCircle className="w-4 h-4 text-chart-5" />
              </button>
              <button onClick={() => setActiveModal('direction')} className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors">
                <Compass className="w-4 h-4 text-chart-2" />
              </button>
              <button onClick={() => setActiveModal('insights')} className="p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 hover:bg-accent/10 transition-colors">
                <Brain className="w-4 h-4 text-chart-3" />
              </button>
            </div>
          </div>
        )}

        {/* ===== EXPANDED FULL VIEW ===== */}
        {!collapsed && (
        <div className="flex flex-col items-center gap-2 p-3 pt-8 overflow-hidden h-full">
          <button onClick={() => setOrbDNAOpen(true)} className="flex items-center justify-center w-[140px] h-[140px] overflow-visible cursor-pointer">
            <PersonalizedOrb size={140} state="idle" />
          </button>

          {identityTitle && (
            <div className="flex items-center justify-center gap-1.5 w-full">
              <span className="text-base">{identityTitle.icon}</span>
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {language === 'he' ? identityTitle.title : identityTitle.titleEn}
              </span>
            </div>
          )}

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

          {/* MapleStory-style EXP bar — expanded */}
          <div className="w-full">
            <div className="relative w-full h-4 rounded-sm border border-primary/30 bg-background/80 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]">
              <div
                className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 transition-all duration-500"
                style={{ width: `${xp.percentage || 0}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-sm bg-gradient-to-b from-white/30 to-transparent"
                style={{ width: `${xp.percentage || 0}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-foreground/80 drop-shadow-sm">
                EXP {xp.current ?? 0} / {xp.required ?? 100} ({xp.percentage}%)
              </span>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

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

          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
        )}
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
    </>
  );
}
