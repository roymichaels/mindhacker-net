/**
 * PlayHub — Unified Play page with 2-tab layout:
 * Tab 1 (default): Text overview — motivating, non-demanding, shows strategy & all tasks
 * Tab 2: Mission Control — interactive with 10-day roadmap, media player, task execution
 */
import { useState, useMemo, lazy, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Flame, Briefcase, MessageSquare, Search, X, MapPin, Trophy, Target, Clock, Zap, Star, BookOpen, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAuroraChatContextSafe } from '@/contexts/AuroraChatContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useWeeklyTacticalPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';

import { TodayOverviewTab } from '@/components/play/TodayOverviewTab';
import { MissionControlTab } from '@/components/play/MissionControlTab';

const LifeHub = lazy(() => import('./LifeHub'));
const WorkHub = lazy(() => import('./WorkHub'));

export default function PlayHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [activeTab, setActiveTab] = useState<'overview' | 'control'>('overview');
  const [chatOpen, setChatOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const auroraChat = useAuroraChatContextSafe();

  // ── Data for unified stats ──
  const { plan, milestones } = useLifePlanWithMilestones();
  const { statusMap } = useLifeDomains();
  const { queue } = useTodayExecution();
  const phasePlan = useWeeklyTacticalPlan();
  const { totalActions: tacticTotal, completedActions: tacticCompleted, totalMinutes, days } = phasePlan as any;

  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m: any) => m.is_completed).length || 0;
  const overallPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const activeDays = days?.filter((d: any) => d.totalActions > 0).length || 0;
  const avgMinPerDay = totalMinutes > 0 ? Math.round(totalMinutes / Math.max(1, activeDays)) : 0;

  const statItems = [
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
    { icon: Zap, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: queue?.length || 0, label: isHe ? 'פעולות היום' : "Today's Tasks", color: 'text-teal-400' },
    { icon: Star, value: `${tacticCompleted || 0}/${tacticTotal || 0}`, label: isHe ? 'שלב' : 'Phase', color: 'text-violet-400' },
    { icon: Clock, value: `${avgMinPerDay}′`, label: isHe ? 'דק׳/יום' : 'Min/Day', color: 'text-sky-400' },
  ];

  const openFindCoachWizard = () => {
    if (!user) { navigate('/auth'); return; }
    if (!auroraChat) return;
    auroraChat.setActivePillar('coach-find');
    auroraChat.setIsDockVisible(true);
    auroraChat.setIsChatExpanded(true);
    auroraChat.setPendingAssistantGreeting(
      isHe
        ? '👋 שלום! אני Aurora, ואני אעזור לך למצוא את המאמן המושלם בשבילך.\n\n**ספר/י לי — מה הדבר שהכי רוצה לשפר בחיים שלך עכשיו?**'
        : "👋 Hey! I'm Aurora, and I'll help you find your perfect coach.\n\n**Tell me — what's the one thing you'd most like to improve in your life right now?**"
    );
  };

  const tabs = [
    { key: 'overview' as const, icon: BookOpen, label: isHe ? 'סקירה' : 'Overview' },
    { key: 'control' as const, icon: Gamepad2, label: isHe ? 'בקרת משימות' : 'Mission Control' },
  ];

  return (
    <div className="flex flex-col w-full items-center" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Quick Action Cards — compact 4-col */}
      <div className="w-full max-w-xl px-4 pt-3 pb-1">
        <div className="grid grid-cols-4 gap-2">
          {[
            { onClick: () => setStrategyOpen(true), icon: Flame, label: isHe ? 'אסטרטגיה' : 'Strategy', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.06]', iconBg: 'bg-amber-500/15', iconColor: 'text-amber-500', hoverBorder: 'hover:border-amber-500/40' },
            { onClick: () => setWorkOpen(true), icon: Briefcase, label: isHe ? 'עבודה' : 'Work', border: 'border-violet-500/20', bg: 'bg-violet-500/[0.06]', iconBg: 'bg-violet-500/15', iconColor: 'text-violet-500', hoverBorder: 'hover:border-violet-500/40' },
            { onClick: () => setChatOpen(true), icon: MessageSquare, label: isHe ? 'שיחה' : 'Chat', border: 'border-primary/20', bg: 'bg-primary/[0.06]', iconBg: 'bg-primary/15', iconColor: 'text-primary', hoverBorder: 'hover:border-primary/40' },
            { onClick: openFindCoachWizard, icon: Search, label: isHe ? 'מאמן' : 'Coach', border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.06]', iconBg: 'bg-emerald-500/15', iconColor: 'text-emerald-500', hoverBorder: 'hover:border-emerald-500/40' },
          ].map((card) => (
            <button
              key={card.label}
              onClick={card.onClick}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all active:scale-[0.97]",
                card.border, card.bg, card.hoverBorder
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.iconBg)}>
                <card.icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight text-center">{card.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Unified Stats Strip ── */}
      {plan && (
        <div className="w-full max-w-xl px-4 pt-1 pb-1">
          <div className="grid grid-cols-6 gap-1.5">
            {statItems.map((s) => (
              <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2 flex flex-col items-center gap-0.5">
                <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                <span className="text-xs font-bold text-foreground leading-none">{s.value}</span>
                <span className="text-[8px] text-muted-foreground text-center leading-tight">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab Switcher ── */}
      <div className="w-full max-w-xl px-4 pt-3 pb-2">
        <div className="flex rounded-xl bg-muted/30 border border-border/30 p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="w-full max-w-xl px-4 pb-6">
        {activeTab === 'overview' ? <TodayOverviewTab /> : <MissionControlTab />}
      </div>

      {/* Strategy Modal */}
      <Dialog open={strategyOpen} onOpenChange={setStrategyOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />{isHe ? 'אסטרטגיה' : 'Strategy'}
            </h2>
            <button onClick={() => setStrategyOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>{strategyOpen && <LifeHub />}</Suspense>
        </DialogContent>
      </Dialog>

      {/* Work Hub Modal */}
      <Dialog open={workOpen} onOpenChange={setWorkOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0" preventClose>
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-500" />{isHe ? 'מרכז העבודה' : 'Work Hub'}
            </h2>
            <button onClick={() => setWorkOpen(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Suspense fallback={null}>{workOpen && <WorkHub />}</Suspense>
        </DialogContent>
      </Dialog>

      <PlanChatWizard open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}
