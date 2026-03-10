/**
 * ArenaHub — Tactics page (טקטיקה).
 * AI-generated 10-day phase schedule with themed blocks containing milestones.
 */
import { useState, useMemo, useCallback } from 'react';
import { Swords, Sparkles, Loader2, Target, CheckCircle2, Clock, ChevronDown, ChevronUp, Zap, Calendar, BarChart3, Wand2, Play, Download, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { useQueryClient } from '@tanstack/react-query';
import { type NowQueueItem } from '@/types/planning';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
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
    <div className="flex flex-col w-full items-center pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
                {/* Campaign name */}
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  {getCampaignName(`phase-${phase}`, isHe ? 'he' : 'en')}
                </p>
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
                  <div className="flex items-center gap-1.5">
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

// ── Day View — flat block list matching Now tab style ──

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
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});

  const toggleBlock = (blockId: string) => {
    setOpenBlocks(prev => ({ ...prev, [blockId]: !prev[blockId] }));
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
    <div className="space-y-2">
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-foreground/70">
          {isHe ? day.label : day.labelEn}
          {day.isToday && <span className="text-primary ms-1.5 text-[9px]">({isHe ? 'היום' : 'Today'})</span>}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {day.completedActions}/{day.totalActions} · {day.totalMinutes}{isHe ? ' דק׳' : ' min'}
        </span>
      </div>

      {/* Flat block list */}
      {day.blocks.map((block) => {
        const isOpen = !!openBlocks[block.id];
        const blockComplete = block.completedCount === block.actions.length && block.actions.length > 0;

        return (
          <div
            key={block.id}
            className={cn(
              "rounded-2xl border overflow-hidden transition-all duration-300",
              blockComplete ? "border-emerald-500/25 bg-emerald-500/5" : "border-border/30 bg-card/50",
            )}
          >
            {/* Block Header */}
            <button
              onClick={() => toggleBlock(block.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col items-center min-w-[40px]">
                <span className="text-lg">{blockComplete ? '✅' : block.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-semibold",
                  blockComplete ? "text-emerald-500" : "text-foreground"
                )}>
                  {isHe ? block.title : block.titleEn}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {block.actions.length} {isHe ? 'משימות' : 'tasks'} · {block.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                  {block.completedCount > 0 && (
                    <span className="text-emerald-500 ms-1.5">
                      ✓ {block.completedCount}/{block.actions.length}
                    </span>
                  )}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>

            {/* Expanded actions */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 space-y-1.5 border-t border-border/20 pt-2">
                    {block.actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => onExecuteAction(action)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-start transition-all border",
                          action.completed
                            ? "border-emerald-500/20 bg-emerald-500/5 opacity-60"
                            : "border-border/30 hover:border-primary/30 bg-card/80 hover:bg-accent/10 active:scale-[0.99]"
                        )}
                      >
                        <div className="flex-1 min-w-0">
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
                        </div>
                        {action.completed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Play className="h-3.5 w-3.5 text-primary shrink-0" />
                        )}
                      </button>
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
