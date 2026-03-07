/**
 * ArenaHub — Tactics page (טקטיקה).
 * AI-generated 10-day phase schedule with themed blocks containing milestones.
 */
import { useState, useMemo, useCallback } from 'react';
import { Swords, Sparkles, Loader2, Target, Trophy, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, BarChart3, RefreshCw, Flame, Play, Wand2, Star } from 'lucide-react';
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

const BLOCK_GRADIENTS: Record<BlockCategory, string> = {
  health: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
  training: 'from-red-500/15 to-red-500/5 border-red-500/20',
  focus: 'from-amber-500/15 to-amber-500/5 border-amber-500/20',
  action: 'from-blue-500/15 to-blue-500/5 border-blue-500/20',
  creation: 'from-purple-500/15 to-purple-500/5 border-purple-500/20',
  review: 'from-teal-500/15 to-teal-500/5 border-teal-500/20',
  social: 'from-pink-500/15 to-pink-500/5 border-pink-500/20',
};

const BLOCK_ICON_COLORS: Record<BlockCategory, string> = {
  health: 'text-emerald-400',
  training: 'text-red-400',
  focus: 'text-amber-400',
  action: 'text-blue-400',
  creation: 'text-purple-400',
  review: 'text-teal-400',
  social: 'text-pink-400',
};

const DIFFICULTY_LABELS: Record<number, { he: string; en: string }> = {
  1: { he: '⭐', en: '⭐' },
  2: { he: '⭐⭐', en: '⭐⭐' },
  3: { he: '⭐⭐⭐', en: '⭐⭐⭐' },
  4: { he: '⭐⭐⭐⭐', en: '⭐⭐⭐⭐' },
  5: { he: '⭐⭐⭐⭐⭐', en: '⭐⭐⭐⭐⭐' },
};

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
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, totalActions, completedActions, totalMinutes, isLoading, hasAiSchedule, generateSchedule, wakeTime, sleepTime } = phasePlan;

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
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      const nowItem = tacticalToNowItem(action);
      setExecutionAction(nowItem);
      setExecutionOpen(true);
    }
  }, []);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[100dvh] pb-56" dir={isRTL ? 'rtl' : 'ltr'}>
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
                        ? 'לחץ "צור לו"ז AI" כדי ש-Aurora תבנה לך תוכנית יומית עם בלוקים נושאיים'
                        : 'Click "Generate AI Schedule" for Aurora to build themed blocks with milestones'}
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
      <MilestoneJourneyModal
        open={journeyOpen}
        onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.sourceMilestoneId || null}
        milestoneTitle={journeyAction?.title || ''}
        milestoneDescription={journeyAction?.description || undefined}
        focusArea={journeyAction?.focusArea || undefined}
        durationMinutes={journeyAction?.estimatedMinutes || 30}
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['life-plan'] });
          queryClient.invalidateQueries({ queryKey: ['now-engine'] });
          queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
        }}
      />
    </div>
  );
}

// ── Day View with Collapsible Themed Blocks ──

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
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(() => {
    // Auto-expand first block
    return new Set(day?.blocks?.[0] ? [day.blocks[0].id] : []);
  });

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      if (next.has(blockId)) next.delete(blockId);
      else next.add(blockId);
      return next;
    });
  };

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
    <div className="space-y-2.5">
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-foreground/70">
          {isHe ? day.label : day.labelEn}
          {day.isToday && <span className="text-primary ms-1.5 text-[9px]">({isHe ? 'היום' : 'Today'})</span>}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {day.blocks.length} {isHe ? 'בלוקים' : 'blocks'} · {day.totalMinutes}{isHe ? ' דק׳' : ' min'}
        </span>
      </div>

      {/* Themed Block Cards */}
      {day.blocks.map((block) => {
        const isExpanded = expandedBlocks.has(block.id);
        const Icon = BLOCK_ICONS[block.category] || Swords;
        const gradient = BLOCK_GRADIENTS[block.category] || BLOCK_GRADIENTS.action;
        const iconColor = BLOCK_ICON_COLORS[block.category] || 'text-foreground/60';
        const blockComplete = block.completedCount === block.actions.length && block.actions.length > 0;

        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border overflow-hidden transition-all",
              blockComplete ? "border-emerald-500/30 bg-emerald-500/5" : `bg-gradient-to-b ${gradient}`
            )}
          >
            {/* Block Header - clickable to expand/collapse */}
            <button
              onClick={() => toggleBlock(block.id)}
              className="flex items-center gap-3 w-full text-start px-3.5 py-3 group"
            >
              {/* Time */}
              {hasAiSchedule && block.startTime && (
                <div className="flex flex-col items-center shrink-0 w-10">
                  <span className="text-[11px] font-bold text-foreground/60 tabular-nums">
                    {block.startTime}
                  </span>
                  <span className="text-[8px] text-muted-foreground/40 tabular-nums">
                    {block.endTime}
                  </span>
                </div>
              )}

              {/* Emoji + Icon */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg",
                blockComplete ? "bg-emerald-500/15" : "bg-background/50"
              )}>
                {blockComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span>{block.emoji}</span>
                )}
              </div>

              {/* Block info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={cn("w-3 h-3 shrink-0", blockComplete ? "text-emerald-500" : iconColor)} />
                  <p className={cn(
                    "text-xs font-bold leading-snug",
                    blockComplete ? "text-emerald-500" : "text-foreground/80"
                  )}>
                    {isHe ? block.title : block.titleEn}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-muted-foreground">
                    {block.actions.length} {isHe ? 'משימות' : 'tasks'}
                  </span>
                  <span className="text-[9px] text-muted-foreground">·</span>
                  <span className="text-[9px] text-muted-foreground">
                    {block.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                  </span>
                  {block.completedCount > 0 && (
                    <>
                      <span className="text-[9px] text-muted-foreground">·</span>
                      <span className="text-[9px] text-emerald-500 font-medium">
                        {block.completedCount}/{block.actions.length} ✓
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Expand indicator */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
              </motion.div>
            </button>

            {/* Block Progress Bar */}
            {block.actions.length > 1 && (
              <div className="px-3.5 pb-1">
                <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500/50"
                    initial={{ width: 0 }}
                    animate={{ width: `${block.actions.length > 0 ? (block.completedCount / block.actions.length) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            )}

            {/* Expanded: Milestones inside the block */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-1 space-y-1">
                    {block.actions.map((action, actionIdx) => {
                      const stars = typeof action.difficulty === 'number' ? action.difficulty : (actionIdx % 5) + 1;
                      return (
                        <button
                          key={action.id}
                          onClick={() => onExecuteAction(action)}
                          className={cn(
                            "flex items-center gap-2.5 w-full text-start py-2 px-2.5 rounded-lg transition-all group/item",
                            action.completed
                              ? "opacity-50 bg-emerald-500/5"
                              : "hover:bg-background/60"
                          )}
                        >
                          {/* Step number / completion */}
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border",
                            action.completed
                              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500"
                              : "bg-background/50 border-border/30 text-foreground/50 group-hover/item:border-primary/30 group-hover/item:text-primary"
                          )}>
                            {action.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-2.5 h-2.5 ms-0.5" />
                            )}
                          </div>

                          {/* Milestone content */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[11px] leading-snug font-medium",
                              action.completed ? "line-through text-muted-foreground" : "text-foreground/75"
                            )}>
                              {isHe ? action.title : (action.titleEn || action.title)}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="flex items-center gap-px">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-2 h-2",
                                      i < stars ? "text-amber-400 fill-amber-400" : "text-muted-foreground/15"
                                    )}
                                  />
                                ))}
                              </span>
                              <span className="text-[7px] text-muted-foreground/50 flex items-center gap-0.5">
                                <Flame className="w-2 h-2" />
                                {action.xpReward}
                              </span>
                              <span className="text-[7px] text-muted-foreground/50">
                                {action.estimatedMinutes}′
                              </span>
                            </div>
                          </div>

                          {/* Play hint */}
                          {!action.completed && (
                            <div className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <Play className="w-3.5 h-3.5 text-primary/60" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
