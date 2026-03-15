/**
 * MissionControlBar — Media-player style control bar for the Play page.
 * Uses tactical plan data (useTodayExecution) as SSOT.
 * Large glowing Play button, prev/next/skip controls.
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { FocusQueueModal } from './FocusQueueModal';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useWeeklyTacticalPlan, type TacticalAction } from '@/hooks/useWeeklyTacticalPlan';
import { useQueryClient } from '@tanstack/react-query';
import type { NowQueueItem } from '@/types/planning';
import {
  Play, SkipBack, SkipForward, FastForward, ListMusic, MessageSquare,
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

export function MissionControlBar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const [queueOpen, setQueueOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskTitle, setChatTaskTitle] = useState<string | null>(null);

  const { queue, actionsCompleted, actionsTotal, hasPlan } = useTodayExecution();
  const phasePlan = useWeeklyTacticalPlan();
  const { days, toggleActionComplete } = phasePlan as any;

  // Get today's actions flattened from tactical plan
  const todayPlan = days?.find((d: any) => d.isToday) || null;
  const todayActions: TacticalAction[] = todayPlan
    ? todayPlan.blocks.flatMap((b: any) => b.actions)
    : [];

  const incompleteActions = todayActions.filter(a => !a.completed);
  const nextAction = incompleteActions[0] || null;
  const nextIndex = nextAction ? todayActions.indexOf(nextAction) : -1;
  const prevAction = nextIndex > 0 ? todayActions[nextIndex - 1] : null;

  const completedCount = todayActions.filter(a => a.completed).length;
  const totalCount = todayActions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const currentTitle = nextAction
    ? (isHe ? nextAction.title : (nextAction.titleEn || nextAction.title))
    : (isHe ? 'כל המשימות הושלמו!' : 'All missions complete!');

  const pillarLabel = nextAction?.focusArea
    ? nextAction.focusArea.charAt(0).toUpperCase() + nextAction.focusArea.slice(1)
    : '';

  const handleExecute = useCallback((action: TacticalAction) => {
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      const nowItem = tacticalToNowItem(action);
      setExecutionAction(nowItem);
      setExecutionOpen(true);
    }
  }, []);

  const handleSkip = useCallback((action: TacticalAction) => {
    if (toggleActionComplete) {
      toggleActionComplete({ ...action, completed: false } as any);
    }
  }, [toggleActionComplete]);

  const handleTalkToTask = useCallback((taskTitle: string) => {
    setChatTaskTitle(taskTitle);
    setChatOpen(true);
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  }, [queryClient]);

  return (
    <>
      <div className="w-full max-w-xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Now Playing display */}
        <div className="text-center mb-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={nextAction?.id || 'done'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xs text-muted-foreground font-medium tracking-wider uppercase mb-1">
                {nextAction
                  ? `${isHe ? 'משימה' : 'Mission'} ${nextIndex + 1}/${totalCount}`
                  : (isHe ? 'סיום' : 'Complete')
                }
              </p>
              <h2 className="text-base font-bold text-foreground line-clamp-1 px-8">
                {currentTitle}
              </h2>
              {pillarLabel && (
                <p className="text-[10px] text-primary/80 font-semibold mt-0.5">{pillarLabel}</p>
              )}
              {nextAction && (
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {nextAction.estimatedMinutes}{isHe ? ' דק׳' : 'min'}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-4 mx-6">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-4">
          {/* Queue button */}
          <button
            onClick={() => setQueueOpen(true)}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground"
            title={isHe ? 'תור משימות' : 'Task Queue'}
          >
            <ListMusic className="w-4.5 h-4.5" />
          </button>

          {/* Previous */}
          <button
            onClick={() => prevAction && handleExecute(prevAction)}
            disabled={!prevAction}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipBack className="w-4.5 h-4.5" />
          </button>

          {/* PLAY — the hero button */}
          <motion.button
            onClick={() => {
              if (nextAction) {
                handleExecute(nextAction);
              }
            }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "relative w-16 h-16 rounded-full flex items-center justify-center",
              "bg-gradient-to-br from-primary via-primary to-secondary",
              "shadow-[0_0_30px_hsl(var(--primary)/0.4),0_0_60px_hsl(var(--primary)/0.2)]",
              "hover:shadow-[0_0_40px_hsl(var(--primary)/0.6),0_0_80px_hsl(var(--primary)/0.3)]",
              "transition-shadow duration-300",
              !nextAction && "opacity-60 from-emerald-500 via-emerald-400 to-teal-500 shadow-[0_0_30px_hsl(160_60%_45%/0.4)]"
            )}
          >
            <div className="absolute inset-0 rounded-full animate-pulse-glow opacity-50" />
            {nextAction ? (
              <Play className="w-7 h-7 text-primary-foreground ms-0.5" fill="currentColor" />
            ) : (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-lg">
                🏆
              </motion.div>
            )}
          </motion.button>

          {/* Next */}
          <button
            onClick={() => {
              if (nextAction && incompleteActions.length > 1) {
                handleExecute(incompleteActions[1]);
              }
            }}
            disabled={incompleteActions.length <= 1}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4.5 h-4.5" />
          </button>

          {/* Talk to task */}
          <button
            onClick={() => nextAction && handleTalkToTask(nextAction.title)}
            disabled={!nextAction}
            className="w-10 h-10 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
            title={isHe ? 'דבר על המשימה' : 'Talk to task'}
          >
            <MessageSquare className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tap to start label */}
        {nextAction && (
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2 font-medium">
            {isHe ? 'לחץ Play להתחלת סשן' : 'Press Play to start session'}
          </p>
        )}
      </div>

      {/* Focus Queue Modal — with 10-day plan */}
      <FocusQueueModal
        open={queueOpen}
        onOpenChange={setQueueOpen}
        onExecuteAction={handleExecute}
        onTalkToTask={handleTalkToTask}
      />

      {/* Execution Modal */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={invalidateAll}
      />

      {/* Milestone Journey Modal */}
      <MilestoneJourneyModal
        open={journeyOpen}
        onOpenChange={setJourneyOpen}
        milestoneId={journeyAction?.sourceMilestoneId || null}
        milestoneTitle={journeyAction?.title || ''}
        milestoneDescription={journeyAction?.description || undefined}
        focusArea={journeyAction?.focusArea || undefined}
        durationMinutes={journeyAction?.estimatedMinutes || 30}
        onComplete={invalidateAll}
      />

      {/* Talk to Task Chat */}
      <PlanChatWizard
        open={chatOpen}
        onOpenChange={setChatOpen}
        focusDayNumber={todayPlan?.dayNumber || null}
        focusTaskTitle={chatTaskTitle}
      />
    </>
  );
}
