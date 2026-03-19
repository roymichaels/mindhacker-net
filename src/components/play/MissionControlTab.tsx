/**
 * MissionControlTab — Interactive tab with 10-day roadmap + media player controls.
 * Task queue content is in the modal only. This tab shows:
 * - 10-day phase roadmap
 * - Media player bar with controls
 * - Queue & Talk buttons
 * - Motivation card for the current task
 */
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { FocusQueueModal } from './FocusQueueModal';
import { useQueryClient } from '@tanstack/react-query';
import type { NowQueueItem } from '@/types/planning';
import {
  Play, SkipBack, SkipForward, CheckCircle2,
  ListMusic, MessageSquare, Zap, Sparkles, Target, Clock, Flame,
} from 'lucide-react';

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
    completed: !!action.completed,
    calendarDate: action.calendarDate,
  };
}

const PILLAR_META: Record<string, { label: string; labelEn: string; color: string; motivation: string; motivationEn: string }> = {
  vitality: { label: 'חיוניות', labelEn: 'Vitality', color: 'text-rose-400', motivation: 'הגוף שלך הוא המקדש — כל תנועה מקרבת אותך לגרסה החזקה ביותר שלך.', motivationEn: 'Your body is your temple — every movement brings you closer to your strongest self.' },
  power: { label: 'כוח', labelEn: 'Power', color: 'text-orange-400', motivation: 'כוח אמיתי נבנה במשמעת היומית. כל חזרה חורטת את הזהות שלך.', motivationEn: 'Real power is forged in daily discipline. Each rep sculpts your identity.' },
  focus: { label: 'מיקוד', labelEn: 'Focus', color: 'text-sky-400', motivation: 'ריכוז הוא כוח-על. 30 דקות של עבודה עמוקה שוות שעות של הסחה.', motivationEn: 'Focus is your superpower. 30 minutes of deep work beats hours of distraction.' },
  wealth: { label: 'עושר', labelEn: 'Wealth', color: 'text-emerald-400', motivation: 'כל פעולה כלכלית חכמה מייצרת תנופה. אתה בונה חופש כלכלי — צעד אחד בכל פעם.', motivationEn: 'Every smart financial move builds momentum. You\'re building freedom — one step at a time.' },
  consciousness: { label: 'תודעה', labelEn: 'Consciousness', color: 'text-violet-400', motivation: 'התודעה שלך היא הכלי הכי חזק. שקט פנימי = בהירות חיצונית.', motivationEn: 'Your awareness is your most powerful tool. Inner quiet = outer clarity.' },
  combat: { label: 'לחימה', labelEn: 'Combat', color: 'text-red-400', motivation: 'הלוחם בפנים מתעורר. כל אימון הוא קרב שאתה בוחר לנצח.', motivationEn: 'The warrior within is awakening. Every session is a battle you choose to win.' },
  expansion: { label: 'התרחבות', labelEn: 'Expansion', color: 'text-indigo-400', motivation: 'צמיחה קורית מחוץ לאזור הנוחות. הלך אל מה שמפחיד — שם נמצא הגודל.', motivationEn: 'Growth lives outside comfort zones. Step into what scares you — that\'s where greatness lives.' },
  influence: { label: 'השפעה', labelEn: 'Influence', color: 'text-amber-400', motivation: 'ההשפעה שלך מתרחבת עם כל פעולה אותנטית. אנשים מרגישים מנהיגות אמיתית.', motivationEn: 'Your influence grows with each authentic action. People feel real leadership.' },
  relationships: { label: 'מערכות יחסים', labelEn: 'Relationships', color: 'text-pink-400', motivation: 'קשרים עמוקים הם העושר האמיתי. תן — וקבל בחזרה פי עשר.', motivationEn: 'Deep connections are true wealth. Give — and receive tenfold in return.' },
  business: { label: 'עסקים', labelEn: 'Business', color: 'text-cyan-400', motivation: 'כל פעולה עסקית מחושבת מקרבת אותך לחזון. בנה בסבלנות, פעל בנחישות.', motivationEn: 'Every calculated business move brings you closer to your vision. Build patiently, act decisively.' },
  projects: { label: 'פרויקטים', labelEn: 'Projects', color: 'text-teal-400', motivation: 'פרויקטים הם איך שאתה הופך חלומות למציאות. כל שלב קטן מוביל לתוצאה גדולה.', motivationEn: 'Projects are how you turn dreams into reality. Every small step leads to a big outcome.' },
  play: { label: 'משחק', labelEn: 'Play', color: 'text-fuchsia-400', motivation: 'חיים בלי הנאה הם לא חיים. המשחק מחדד את היצירתיות ומחדש את האנרגיה.', motivationEn: 'A life without joy isn\'t life. Play sharpens creativity and renews energy.' },
};

export function MissionControlTab() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, isLoading, toggleActionComplete } = phasePlan as any;

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskTitle, setChatTaskTitle] = useState<string | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);

  const todayIndex = useMemo(() => {
    const idx = (days || []).findIndex((d: DayPlan) => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);

  const activeDay = selectedDay ?? todayIndex;
  const activeDayPlan: DayPlan | null = days?.[activeDay] || null;

  const dayActions: TacticalAction[] = useMemo(() => {
    if (!activeDayPlan) return [];
    return [...activeDayPlan.blocks.flatMap((b: any) => b.actions)].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });
  }, [activeDayPlan]);

  const incompleteActions = dayActions.filter(a => !a.completed);
  const nextAction = incompleteActions[0] || null;
  const completedCount = dayActions.filter(a => a.completed).length;
  const totalCount = dayActions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const nextIndex = nextAction ? dayActions.indexOf(nextAction) : -1;

  const handleExecute = useCallback((action: TacticalAction) => {
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      setExecutionAction(tacticalToNowItem(action));
      setExecutionOpen(true);
    }
  }, []);

  const handleTalkToTask = useCallback((taskTitle: string) => {
    setChatTaskTitle(taskTitle);
    setChatOpen(true);
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  }, [queryClient]);

  // Motivation data for current task
  const currentPillar = nextAction?.focusArea || 'focus';
  const pillarMeta = PILLAR_META[currentPillar] || PILLAR_META.focus;
  const currentTitle = nextAction
    ? (isHe ? nextAction.title : (nextAction.titleEn || nextAction.title))
    : (isHe ? 'כל המשימות הושלמו!' : 'All missions complete!');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* ── 10-Day Roadmap ── */}
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/20">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {isHe ? `שלב ${phase}` : `Phase ${phase}`}
            </span>
            <span className="text-[10px] text-muted-foreground ms-auto">
              {completedCount}/{totalCount}
            </span>
          </div>

          <div className="flex gap-1 px-3 py-2 overflow-x-auto no-scrollbar">
            {(days || []).map((day: DayPlan) => {
              const isActive = day.dayIndex === activeDay;
              const hasActions = day.totalActions > 0;
              const dayPct = day.totalActions > 0 ? Math.round((day.completedActions / day.totalActions) * 100) : 0;

              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setSelectedDay(day.dayIndex)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[36px] relative",
                    isActive ? "bg-primary/15 border border-primary/30"
                      : hasActions ? "bg-muted/20 border border-border/20 hover:bg-muted/40"
                      : "bg-transparent border border-transparent opacity-40"
                  )}
                >
                  <span className={cn("text-[10px] font-bold", isActive ? "text-primary" : "text-foreground/60")}>
                    {day.dayNumber}
                  </span>
                  <span className={cn("text-[8px]", isActive ? "text-primary/70" : "text-muted-foreground")}>
                    {day.completedActions}/{day.totalActions}
                  </span>
                  <span className={cn("text-[7px]", isActive ? "text-primary/60" : "text-muted-foreground/60")}>
                    {day.date ? `${day.date.slice(8, 10)}/${day.date.slice(5, 7)}` : ''}
                  </span>
                  {day.isToday && <div className="absolute -top-0.5 -end-0.5 w-1.5 h-1.5 rounded-full bg-primary" />}
                  {dayPct === 100 && day.totalActions > 0 && (
                    <div className="absolute -top-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Media Player Card ── */}
        <div className="rounded-2xl border border-border/40 bg-card p-4">
          {/* Now playing */}
          <div className="text-center mb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={nextAction?.id || 'done'}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase mb-0.5">
                  {nextAction ? `${isHe ? 'משימה' : 'Mission'} ${nextIndex + 1}/${totalCount}` : (isHe ? 'סיום' : 'Complete')}
                </p>
                <h3 className="text-sm font-bold text-foreground line-clamp-1 px-6">
                  {currentTitle}
                </h3>
                {nextAction && (
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-semibold", pillarMeta.color)}>
                      {isHe ? pillarMeta.label : pillarMeta.labelEn}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {nextAction.estimatedMinutes}{isHe ? ' דק׳' : 'min'}
                    </span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress */}
          <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-4 mx-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {/* Previous */}
            <button
              onClick={() => { if (nextIndex > 0) handleExecute(dayActions[nextIndex - 1]); }}
              disabled={nextIndex <= 0}
              className="w-9 h-9 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* PLAY */}
            <motion.button
              onClick={() => { if (nextAction) handleExecute(nextAction); }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative w-14 h-14 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-primary via-primary to-secondary",
                "shadow-[0_0_24px_hsl(var(--primary)/0.4)]",
                "hover:shadow-[0_0_36px_hsl(var(--primary)/0.6)]",
                "transition-shadow duration-300",
                !nextAction && "opacity-60 from-emerald-500 via-emerald-400 to-teal-500"
              )}
            >
              {nextAction ? (
                <Play className="w-6 h-6 text-primary-foreground ms-0.5" fill="currentColor" />
              ) : (
                <span className="text-lg">🏆</span>
              )}
            </motion.button>

            {/* Next */}
            <button
              onClick={() => {
                if (nextAction && incompleteActions.length > 1) handleExecute(incompleteActions[1]);
              }}
              disabled={incompleteActions.length <= 1}
              className="w-9 h-9 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Tap to start label */}
          {nextAction && (
            <p className="text-center text-[10px] text-muted-foreground/60 mt-2 font-medium">
              {isHe ? 'לחץ Play להתחלת סשן' : 'Press Play to start session'}
            </p>
          )}
        </div>

        {/* ── Action Buttons: Queue + Talk ── */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setQueueOpen(true)}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all",
              "border-primary/20 bg-primary/[0.06] hover:border-primary/40 hover:bg-primary/[0.1]",
              "active:scale-[0.97]"
            )}
          >
            <ListMusic className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              {isHe ? 'תור משימות' : 'Task Queue'}
            </span>
          </button>

          <button
            onClick={() => nextAction && handleTalkToTask(nextAction.title)}
            disabled={!nextAction}
            className={cn(
              "flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all",
              "border-violet-500/20 bg-violet-500/[0.06] hover:border-violet-500/40 hover:bg-violet-500/[0.1]",
              "active:scale-[0.97]",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-foreground">
              {isHe ? 'דבר על המשימה' : 'Talk to Task'}
            </span>
          </button>
        </div>

        {/* ── Motivation Card ── */}
        {nextAction ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-border/30 bg-gradient-to-br from-card via-card to-muted/20 p-4 relative overflow-hidden"
          >
            {/* Decorative glow */}
            <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    {isHe ? 'למה זה חשוב' : 'Why This Matters'}
                  </h4>
                </div>
              </div>

              {/* Current Mission */}
              <div className="mb-3 pb-3 border-b border-border/20">
                <div className="flex items-start gap-2">
                  <Target className={cn("w-4 h-4 mt-0.5 flex-shrink-0", pillarMeta.color)} />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-foreground line-clamp-2 mb-1">{currentTitle}</h5>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[9px] font-semibold px-2 py-0.5 rounded-md",
                        `${pillarMeta.color} bg-current/10`
                      )} style={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}>
                        {isHe ? pillarMeta.label : pillarMeta.labelEn}
                      </span>
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {nextAction.estimatedMinutes}{isHe ? ' דק׳' : ' min'}
                      </span>
                      {nextAction.description && (
                        <span className="text-[9px] text-muted-foreground/70">
                          •  {nextAction.description.length > 50 ? nextAction.description.slice(0, 50) + '…' : nextAction.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation Text */}
              <div className="flex gap-2">
                <Flame className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isHe ? pillarMeta.motivation : pillarMeta.motivationEn}
                </p>
              </div>

              {/* Progress context */}
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {isHe ? 'התקדמות היום' : "Today's Progress"}
                  </span>
                  <span className="font-bold text-foreground">
                    {completedCount}/{totalCount} {isHe ? 'הושלמו' : 'done'}
                  </span>
                </div>
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden mt-1.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-emerald-500/70"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                {incompleteActions.length > 1 && (
                  <p className="text-[9px] text-muted-foreground/60 mt-1.5">
                    {isHe
                      ? `עוד ${incompleteActions.length - 1} משימות אחרי זו — אתה במסלול!`
                      : `${incompleteActions.length - 1} more missions after this — you're on track!`
                    }
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          /* All complete card */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 text-center"
          >
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="text-sm font-bold text-foreground mb-1">
              {isHe ? 'כל המשימות הושלמו!' : 'All Missions Complete!'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {isHe
                ? 'עבודה מדהימה — סיימת את כל המשימות להיום. מחר מגיע עם אתגרים חדשים.'
                : 'Amazing work — you completed all missions for today. Tomorrow brings new challenges.'
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Focus Queue Modal */}
      <FocusQueueModal
        open={queueOpen}
        onOpenChange={setQueueOpen}
        onExecuteAction={handleExecute}
        onTalkToTask={handleTalkToTask}
      />

      <ExecutionModal open={executionOpen} onOpenChange={setExecutionOpen} action={executionAction} onComplete={invalidateAll} />
      <MilestoneJourneyModal
        open={journeyOpen} onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.sourceMilestoneId || null}
        milestoneTitle={journeyAction?.title || ''}
        milestoneDescription={journeyAction?.description || undefined}
        focusArea={journeyAction?.focusArea || undefined}
        durationMinutes={journeyAction?.estimatedMinutes || 30}
        onComplete={invalidateAll}
      />
      <PlanChatWizard
        open={chatOpen} onOpenChange={setChatOpen}
        focusDayNumber={activeDayPlan?.dayNumber || null}
        focusTaskTitle={chatTaskTitle}
      />
    </>
  );
}
