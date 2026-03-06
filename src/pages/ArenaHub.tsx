/**
 * ArenaHub — Tactics page (טקטיקה).
 * AI-generated 10-day phase schedule with fixed time blocks.
 * Clicking a milestone opens the ExecutionModal with full guided execution.
 */
import { useState, useMemo, useCallback } from 'react';
import { Swords, Sparkles, Loader2, Target, Trophy, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, BarChart3, RefreshCw, Flame, Play, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { useQueryClient } from '@tanstack/react-query';
import { type NowQueueItem } from '@/hooks/useNowEngine';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { useWeeklyTacticalPlan, type DayPlan, type TacticalAction, type TacticalBlock, type BlockCategory, type Difficulty } from '@/hooks/useWeeklyTacticalPlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BLOCK_ICONS: Record<BlockCategory, typeof Swords> = {
  health: Zap,
  training: Swords,
  focus: Target,
  action: CheckCircle2,
  creation: Sparkles,
  review: BarChart3,
  social: Trophy,
};

const BLOCK_COLORS: Record<BlockCategory, string> = {
  health: 'text-emerald-400',
  training: 'text-red-400',
  focus: 'text-amber-400',
  action: 'text-blue-400',
  creation: 'text-purple-400',
  review: 'text-teal-400',
  social: 'text-pink-400',
};

const DIFFICULTY_STYLES: Record<Difficulty, { bg: string; text: string; label: { he: string; en: string } }> = {
  easy: { bg: 'bg-emerald-500/15', text: 'text-emerald-500', label: { he: 'קל', en: 'Easy' } },
  medium: { bg: 'bg-amber-500/15', text: 'text-amber-500', label: { he: 'בינוני', en: 'Medium' } },
  hard: { bg: 'bg-red-500/15', text: 'text-red-500', label: { he: 'קשה', en: 'Hard' } },
};

/** Convert a TacticalAction to a NowQueueItem for ExecutionModal */
function tacticalToNowItem(action: TacticalAction): NowQueueItem {
  return {
    pillarId: action.focusArea || action.blockCategory || 'general',
    hub: 'arena',
    actionType: action.actionType || action.blockCategory || 'milestone',
    title: action.title,
    titleEn: action.titleEn || action.title,
    durationMin: action.estimatedMinutes,
    isTimeBased: action.executionTemplate === 'timer_focus' || action.executionTemplate === 'sets_reps_timer',
    urgencyScore: 80,
    reason: '',
    sourceType: 'milestone',
    sourceId: action.sourceMilestoneId || undefined,
    milestoneId: action.sourceMilestoneId || undefined,
    milestoneTitle: action.title,
    missionId: action.missionId || undefined,
    executionTemplate: (action.executionTemplate as NowQueueItem['executionTemplate']) || undefined,
  };
}

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { plan, milestones, isLoading: planLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [scheduleGenerating, setScheduleGenerating] = useState(false);
  // Journey modal state
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, totalActions, completedActions, totalMinutes, isLoading, hasAiSchedule, generateSchedule, wakeTime, sleepTime } = phasePlan;

  // Generate AI schedule
  const handleGenerateSchedule = useCallback(async () => {
    if (scheduleGenerating) return;
    setScheduleGenerating(true);
    try {
      await generateSchedule();
      queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
      toast({ title: isHe ? '✅ לו"ז נוצר בהצלחה' : '✅ Schedule generated!' });
    } catch {
      toast({ title: isHe ? 'שגיאה ביצירת לו"ז' : 'Schedule generation failed', variant: 'destructive' });
    } finally {
      setScheduleGenerating(false);
    }
  }, [generateSchedule, scheduleGenerating, queryClient, toast, isHe]);

  // Find today's day index within the 10-day phase
  const todayIndex = useMemo(() => {
    const idx = days.findIndex(d => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const activeDay = selectedDay ?? todayIndex;

  const completionPct = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const activeDays = days.filter(d => d.totalActions > 0).length;
  const activeBlocks = days.reduce((s, d) => s + d.blocks.length, 0);

  const statItems = [
    { icon: Calendar, value: `${activeDays}/10`, label: isHe ? 'ימים פעילים' : 'Active Days', color: 'text-amber-400' },
    { icon: Target, value: activeBlocks, label: isHe ? 'בלוקים' : 'Blocks', color: 'text-teal-400' },
    { icon: CheckCircle2, value: `${completedActions}/${totalActions}`, label: isHe ? 'פעולות' : 'Actions', color: 'text-orange-400' },
    { icon: Clock, value: `${totalMinutes > 0 ? Math.round(totalMinutes / Math.max(1, activeDays)) : 0}′`, label: isHe ? 'דק׳/יום' : 'Min/Day', color: 'text-emerald-400' },
  ];

  const handleOpenExecution = useCallback((action: TacticalAction) => {
    const nowItem = tacticalToNowItem(action);
    setExecutionAction(nowItem);
    setExecutionOpen(true);
  }, []);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !planLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'טרם יצרת תוכנית 100 יום' : 'No 100-Day Plan Yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe ? 'צור אסטרטגיה כדי לראות את הטקטיקה שלך' : 'Create a strategy to see your tactical breakdown'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'צור תוכנית 100 יום' : 'Create 100-Day Plan'}
            </motion.button>
          </div>
        ) : hasPlan ? (
          <>
            {/* ── PHASE STATS ── */}
            <div className="grid grid-cols-4 gap-2">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2.5 flex flex-col items-center gap-1">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── PHASE + PROGRESS ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
                    <span className="text-sm font-bold text-destructive">{phase}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? `שלב ${phase} — תוכנית 10 ימים` : `Phase ${phase} — 10-Day Plan`}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {completedActions}/{totalActions} {isHe ? 'משימות' : 'missions'} · {completionPct}%
                      {hasAiSchedule && <span className="ms-1.5 text-primary">⚡ AI</span>}
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateSchedule}
                    disabled={scheduleGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(204,88%,53%)]/10 border border-[hsl(204,88%,53%)]/25 hover:bg-[hsl(204,88%,53%)]/20 transition-all text-[hsl(204,88%,53%)] text-[11px] font-semibold disabled:opacity-50"
                  >
                    {scheduleGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5" />
                    )}
                    {scheduleGenerating
                      ? (isHe ? 'יוצר לו"ז...' : 'Generating...')
                      : hasAiSchedule
                        ? (isHe ? 'כיול מחדש' : 'Recalibrate')
                        : (isHe ? 'צור לו"ז AI' : 'Generate AI Schedule')}
                  </button>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* ── 10-DAY SELECTOR ── */}
              <div className="flex gap-1 px-3 py-2.5 overflow-x-auto no-scrollbar border-b border-border/20">
                {days.map((day) => {
                  const isActive = day.dayIndex === activeDay;
                  const hasActions = day.totalActions > 0;
                  const dayPct = day.totalActions > 0 ? Math.round((day.completedActions / day.totalActions) * 100) : 0;

                  return (
                    <button
                      key={day.dayIndex}
                      onClick={() => setSelectedDay(day.dayIndex)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[38px] relative",
                        isActive
                          ? "bg-destructive/15 border border-destructive/30"
                          : hasActions
                            ? "bg-muted/20 border border-border/20 hover:bg-muted/40"
                            : "bg-transparent border border-transparent opacity-40"
                      )}
                    >
                      <span className={cn(
                        "text-[10px] font-bold",
                        isActive ? "text-destructive" : "text-foreground/60"
                      )}>
                        {day.dayNumber}
                      </span>
                      <span className={cn(
                        "text-[8px]",
                        isActive ? "text-destructive/70" : "text-muted-foreground"
                      )}>
                        {day.totalActions > 0 ? `${day.completedActions}/${day.totalActions}` : '—'}
                      </span>
                      {day.isToday && (
                        <div className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                      {dayPct === 100 && day.totalActions > 0 && (
                        <div className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── DAY CONTENT ── */}
              <div className="px-4 py-3">
                {(isLoading || scheduleGenerating) && totalActions === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {scheduleGenerating
                        ? (isHe ? 'Aurora יוצרת את הלו"ז שלך...' : 'Aurora is crafting your schedule...')
                        : (isHe ? 'טוען...' : 'Loading...')}
                    </p>
                  </div>
                ) : !hasAiSchedule && totalActions === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <Wand2 className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground text-center max-w-xs">
                      {isHe
                        ? 'לחץ "צור לו"ז AI" כדי ש-Aurora תבנה לך תוכנית יומית עם שעות מדויקות'
                        : 'Click "Generate AI Schedule" for Aurora to build your daily plan with exact time blocks'}
                    </p>
                  </div>
                ) : (
                  <DayView
                    day={days[activeDay]}
                    isHe={isHe}
                    onExecuteAction={handleOpenExecution}
                    hasAiSchedule={hasAiSchedule}
                  />
                )}
              </div>
            </div>

            {/* ── PHASE OVERVIEW ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <h3 className="text-xs font-bold text-foreground/70">
                  {isHe ? 'סקירת עומס שלב' : 'Phase Load Overview'}
                </h3>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {days.map((day) => {
                  const avgMins = totalMinutes > 0 ? totalMinutes / Math.max(1, activeDays) : 100;
                  const loadPct = avgMins > 0 ? Math.min(100, Math.round((day.totalMinutes / avgMins) * 50)) : 0;

                  return (
                    <button
                      key={day.dayIndex}
                      onClick={() => setSelectedDay(day.dayIndex)}
                      className="flex items-center gap-2 w-full hover:bg-muted/10 rounded-lg px-1 py-0.5 transition-colors"
                    >
                      <span className={cn(
                        "text-[10px] w-8 text-start font-medium",
                        day.isToday ? "text-primary font-bold" : "text-muted-foreground"
                      )}>
                        {isHe ? `${day.dayNumber}` : `D${day.dayNumber}`}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            day.completedActions === day.totalActions && day.totalActions > 0
                              ? "bg-emerald-500/60"
                              : day.isToday
                                ? "bg-primary/50"
                                : "bg-foreground/15"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, loadPct)}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-10 text-end">
                        {day.totalMinutes > 0 ? `${day.totalMinutes}′` : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <StrategyPillarWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onPlanGenerated={handlePlanGenerated}
      />
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['life-plan'] });
          queryClient.invalidateQueries({ queryKey: ['now-engine'] });
          queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
        }}
      />
    </div>
  );
}

// ── Day View Component with Time Blocks ──

function DayView({
  day,
  isHe,
  onExecuteAction,
  hasAiSchedule,
}: {
  day: DayPlan;
  isHe: boolean;
  onExecuteAction: (action: TacticalAction) => void;
  hasAiSchedule: boolean;
}) {
  if (!day || day.totalActions === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-muted-foreground">
          {isHe ? 'יום מנוחה — אין משימות מתוכננות' : 'Rest day — no missions scheduled'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Day summary */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-foreground/70">
          {isHe ? day.label : day.labelEn}
          {day.isToday && <span className="text-primary ms-1.5 text-[9px]">({isHe ? 'היום' : 'Today'})</span>}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {day.blocks.length} {isHe ? 'בלוקים' : 'blocks'} · {day.totalMinutes}{isHe ? ' דק׳' : ' min'}
        </span>
      </div>

      {/* Time-block schedule */}
      <div className="relative">
        {/* Timeline line */}
        {hasAiSchedule && (
          <div className="absolute start-4 top-2 bottom-2 w-px bg-border/30" />
        )}

        <div className="space-y-1.5">
          {day.blocks.map((block) => {
            const action = block.actions[0];
            if (!action) return null;
            const Icon = BLOCK_ICONS[block.category] || Swords;
            const color = BLOCK_COLORS[block.category] || 'text-foreground/60';
            const diffStyle = DIFFICULTY_STYLES[action.difficulty];

            return (
              <button
                key={block.id}
                onClick={() => onExecuteAction(action)}
                className={cn(
                  "flex items-start gap-3 w-full text-start py-2.5 px-3 rounded-xl transition-all group",
                  action.completed
                    ? "opacity-50 bg-emerald-500/5 border border-emerald-500/10"
                    : "hover:bg-primary/5 border border-border/20 hover:border-primary/20"
                )}
              >
                {/* Time column */}
                {hasAiSchedule && block.startTime ? (
                  <div className="flex flex-col items-center shrink-0 w-12 pt-0.5">
                    <span className="text-[11px] font-bold text-foreground/70 tabular-nums">
                      {block.startTime}
                    </span>
                    <span className="text-[8px] text-muted-foreground/50 tabular-nums">
                      {block.endTime}
                    </span>
                  </div>
                ) : null}

                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  action.completed
                    ? "bg-emerald-500/15"
                    : "bg-primary/10 group-hover:bg-primary/20"
                )}>
                  {action.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-primary ms-0.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <Icon className={cn("w-3.5 h-3.5 shrink-0 mt-0.5", action.completed ? "text-emerald-500" : color)} />
                    <p className={cn(
                      "text-xs leading-snug font-medium flex-1",
                      action.completed ? "line-through text-muted-foreground" : "text-foreground/80"
                    )}>
                      {isHe ? action.title : (action.titleEn || action.title)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap ms-5">
                    <span className={cn("text-[8px] font-semibold px-1.5 py-0.5 rounded-full", diffStyle.bg, diffStyle.text)}>
                      {isHe ? diffStyle.label.he : diffStyle.label.en}
                    </span>
                    <span className="text-[8px] text-muted-foreground/50 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" />
                      {action.xpReward} XP
                    </span>
                    <span className="text-[8px] text-muted-foreground/50">
                      {action.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                    </span>
                    {!action.completed && (
                      <span className="text-[8px] text-primary/60 font-medium">
                        {isHe ? 'לחץ להתחיל ▶' : 'Tap to start ▶'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
