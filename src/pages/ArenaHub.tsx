/**
 * ArenaHub — Tactics page (טקטיקה).
 * AI-generated 10-day phase schedule with themed blocks containing milestones.
 */
import { useState, useMemo, useCallback } from 'react';
import { Swords, Sparkles, Loader2, Target, CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, Zap, Calendar, BarChart3, Wand2, Play, Download, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyPillarWizard } from '@/components/play/StrategyPillarWizard';
import { useQueryClient } from '@tanstack/react-query';
import { type NowQueueItem } from '@/types/planning';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/play/MilestoneJourneyModal';
import { useWeeklyTacticalPlan, type DayPlan, type TacticalAction, type TacticalBlock, type BlockCategory, type Difficulty } from '@/hooks/useWeeklyTacticalPlan';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getQuestName, getCampaignName } from '@/lib/questNames';
import { exportTacticsPDF } from '@/utils/exportTacticsPDF';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';



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
  const [dayChatOpen, setDayChatOpen] = useState(false);
  const [dayChatDayNumber, setDayChatDayNumber] = useState<number | null>(null);
  const [dayChatTaskTitle, setDayChatTaskTitle] = useState<string | null>(null);
  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, totalActions, completedActions, totalMinutes, isLoading, hasAiSchedule, generateSchedule, wakeTime, sleepTime, toggleActionComplete } = phasePlan as any;

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
    <div className="flex flex-col w-full items-center pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !planLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-amber-400" />
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
              className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'צור תוכנית 100 יום' : 'Create 100-Day Plan'}
            </motion.button>
          </div>
        ) : hasPlan ? (
          <>

            {/* ── 10-DAY SELECTOR (floating above) ── */}
            <div className="flex gap-1 px-1 py-2 overflow-x-auto no-scrollbar">
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
                        ? "bg-amber-500/15 border border-amber-500/30"
                        : hasActions
                          ? "bg-muted/20 border border-border/20 hover:bg-muted/40"
                          : "bg-transparent border border-transparent opacity-40"
                    )}
                  >
                    <span className={cn(
                      "text-[10px] font-bold",
                      isActive ? "text-amber-400" : "text-foreground/60"
                    )}>
                      {day.dayNumber}
                    </span>
                    <span className={cn(
                      "text-[8px]",
                      isActive ? "text-amber-400/70" : "text-muted-foreground"
                    )}>
                      {day.completedActions}/{day.totalActions}
                    </span>
                    <span className={cn(
                      "text-[7px]",
                      isActive ? "text-amber-400/60" : "text-muted-foreground/60"
                    )}>
                      {day.date ? `${day.date.slice(8, 10)}/${day.date.slice(5, 7)}` : ''}
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

            {/* ── PHASE + PROGRESS ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                {/* Campaign name */}
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  {getCampaignName(`phase-${phase}`, isHe ? 'he' : 'en')}
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-400">{phase}</span>
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
                  {/* Action buttons inline with title */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleGenerateSchedule}
                      disabled={scheduleGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25 hover:bg-primary/20 transition-all text-primary text-[11px] font-semibold disabled:opacity-50"
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
                    <button
                      onClick={() => {
                        const BLOCK_LABELS: Record<string, { he: string; en: string }> = {
                          health: { he: 'בריאות', en: 'Health' },
                          training: { he: 'אימון', en: 'Training' },
                          focus: { he: 'מיקוד', en: 'Focus' },
                          action: { he: 'ביצוע', en: 'Action' },
                          creation: { he: 'יצירה', en: 'Creation' },
                          review: { he: 'סקירה', en: 'Review' },
                          social: { he: 'חברתי', en: 'Social' },
                        };
                        const BLOCK_EMOJIS: Record<string, string> = {
                          health: '💚', training: '⚔️', focus: '🎯', action: '✅', creation: '✨', review: '📊', social: '🏆',
                        };
                        exportTacticsPDF({
                          isRTL: isHe,
                          title: isHe ? 'תוכנית טקטית — 10 ימים' : 'Tactical Plan — 10 Days',
                          phaseLabel: isHe ? `שלב ${phase}` : `Phase ${phase}`,
                          progress: `${completedActions}/${totalActions} ${isHe ? 'משימות' : 'actions'} · ${completionPct}%`,
                          days: days.map(d => ({
                            dayNumber: d.dayNumber,
                            label: d.label,
                            labelEn: d.labelEn,
                            isToday: d.isToday,
                            totalActions: d.totalActions,
                            completedActions: d.completedActions,
                            totalMinutes: d.totalMinutes,
                            blocks: d.blocks.map(b => ({
                              category: b.category,
                              emoji: b.emoji || BLOCK_EMOJIS[b.category] || '📋',
                              label: BLOCK_LABELS[b.category]?.he || b.title,
                              labelEn: BLOCK_LABELS[b.category]?.en || b.titleEn,
                              estimatedMinutes: b.estimatedMinutes,
                              completedCount: b.completedCount,
                              actions: b.actions.map(a => ({
                                title: a.title,
                                titleEn: a.titleEn || a.title,
                                focusArea: a.focusArea || a.blockCategory,
                                estimatedMinutes: a.estimatedMinutes,
                                isCompleted: a.completed,
                              })),
                            })),
                          })),
                        });
                        toast({ title: isHe ? 'PDF הורד' : 'PDF downloaded' });
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                      title={isHe ? 'ייצוא PDF' : 'Export PDF'}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
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
                    onTalkToPlan={(dayNumber) => {
                      setDayChatDayNumber(dayNumber);
                      setDayChatTaskTitle(null);
                      setDayChatOpen(true);
                    }}
                    onTalkToTask={(dayNumber, taskTitle) => {
                      setDayChatDayNumber(dayNumber);
                      setDayChatTaskTitle(taskTitle);
                      setDayChatOpen(true);
                    }}
                    onToggleComplete={toggleActionComplete}
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
      <PlanChatWizard open={dayChatOpen} onOpenChange={setDayChatOpen} focusDayNumber={dayChatDayNumber} focusTaskTitle={dayChatTaskTitle} />
    </div>
  );
}

// ── Day View — collapsible block sections ──

/** Determine which block index matches the current time of day */
function getCurrentBlockIndex(blocks: TacticalBlock[]): number {
  const hour = new Date().getHours();
  const categoryByHour = hour < 12 ? 'morning' : hour < 14 ? 'midday' : hour < 18 ? 'afternoon' : 'evening';

  const idx = blocks.findIndex(b => {
    const cat = b.category as string;
    return cat === categoryByHour ||
      (b.title?.includes('בוקר') && categoryByHour === 'morning') ||
      (b.title?.includes('צהריים') && categoryByHour === 'midday') ||
      (b.title?.includes('אחה"צ') && categoryByHour === 'afternoon') ||
      (b.title?.includes('ערב') && categoryByHour === 'evening');
  });
  return idx >= 0 ? idx : 0;
}

function DayView({
  day,
  isHe,
  onExecuteAction,
  hasAiSchedule,
  onTalkToPlan,
  onTalkToTask,
  onToggleComplete,
}: {
  day: DayPlan;
  isHe: boolean;
  onExecuteAction: (action: TacticalAction) => void;
  hasAiSchedule: boolean;
  onTalkToPlan: (dayNumber: number) => void;
  onTalkToTask: (dayNumber: number, taskTitle: string) => void;
  onToggleComplete: (action: TacticalAction) => void;
}) {
  const currentBlockIdx = useMemo(() => day?.isToday ? getCurrentBlockIndex(day.blocks) : 0, [day]);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>(() => {
    // Default: only current phase expanded
    const map: Record<number, boolean> = {};
    day?.blocks.forEach((_, i) => { map[i] = i === currentBlockIdx; });
    return map;
  });

  const toggleBlock = useCallback((idx: number) => {
    setExpandedBlocks(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

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
    <div className="space-y-2">
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-foreground/70">
          {isHe ? day.label : day.labelEn}
          {day.isToday && <span className="text-primary ms-1.5 text-[9px]">({isHe ? 'היום' : 'Today'})</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">
            {day.completedActions}/{day.totalActions} · {day.totalMinutes}{isHe ? ' דק׳' : ' min'}
          </span>
          <button
            onClick={() => onTalkToPlan(day.dayNumber)}
            className="p-1 rounded-lg hover:bg-primary/10 transition-colors"
            aria-label={isHe ? `דבר עם התוכנית — יום ${day.dayNumber}` : `Talk to Plan — Day ${day.dayNumber}`}
            title={isHe ? `דבר עם התוכנית — יום ${day.dayNumber}` : `Talk to Plan — Day ${day.dayNumber}`}
          >
            <Wand2 className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
      </div>

      {/* Collapsible block list */}
      {day.blocks.map((block, blockIdx) => {
        const blockComplete = block.completedCount === block.actions.length && block.actions.length > 0;
        const isExpanded = expandedBlocks[blockIdx] ?? false;

        return (
          <div key={block.id} className="space-y-1.5">
            {/* Block header — clickable to toggle */}
            <button
              onClick={() => toggleBlock(blockIdx)}
              className="w-full flex items-center gap-3 px-2 pt-2 pb-1 hover:bg-muted/30 rounded-lg transition-colors"
            >
              <span className="text-base">{blockComplete ? '✅' : block.emoji}</span>
              <div className="flex-1 min-w-0 text-start">
                <h3 className={cn(
                  "text-xs font-bold",
                  blockComplete ? "text-primary" : "text-foreground/70"
                )}>
                  {isHe ? block.title : block.titleEn}
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {block.completedCount}/{block.actions.length} · {block.estimatedMinutes}{isHe ? ' דק׳' : 'm'}
              </span>
              <ChevronDown className={cn(
                "w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </button>

            {/* Tasks — collapsible */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 ps-2">
                    {block.actions.map((action) => (
                      <div
                        key={action.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all border",
                          action.completed
                            ? "border-primary/20 bg-primary/5 opacity-60"
                            : "border-border/30 bg-card/80"
                        )}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onToggleComplete(action); }}
                          className="shrink-0 p-0.5 rounded-full hover:bg-muted/50 transition-colors"
                          aria-label={action.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {action.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
                          )}
                        </button>

                        {/* Content */}
                        <button
                          onClick={() => onExecuteAction(action)}
                          className="flex-1 min-w-0 text-start hover:opacity-80 transition-opacity"
                        >
                          <p className={cn(
                            "text-xs font-semibold line-clamp-1",
                            action.completed ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {isHe ? action.title : (action.titleEn || action.title)}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {action.estimatedMinutes}{isHe ? ' דק׳' : 'm'}
                            {action.focusArea && <span className="ms-1.5 opacity-60">· {action.focusArea}</span>}
                          </p>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); onTalkToTask(day.dayNumber, action.title); }}
                          className="shrink-0 p-1 rounded-full hover:bg-primary/10 transition-colors"
                          aria-label={isHe ? 'דבר על המשימה' : 'Talk about task'}
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-primary opacity-40 hover:opacity-100" />
                        </button>
                        <Play className="h-3.5 w-3.5 text-primary shrink-0 opacity-40" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
