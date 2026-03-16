/**
 * TaskCardsGrid — Premium 3-column grid of today's tactical actions as cards.
 */
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction } from '@/hooks/useWeeklyTacticalPlan';
import { useQueryClient } from '@tanstack/react-query';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import type { NowQueueItem } from '@/types/planning';
import {
  Play, CheckCircle2, Clock, MessageSquare, Zap, Target,
} from 'lucide-react';

const CATEGORY_STYLES: Record<string, { border: string; bg: string; icon: string; glow: string }> = {
  training: { border: 'border-orange-500/30', bg: 'bg-orange-500/10', icon: 'text-orange-400', glow: 'shadow-orange-500/10' },
  action: { border: 'border-primary/30', bg: 'bg-primary/10', icon: 'text-primary', glow: 'shadow-primary/10' },
  review: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
  creation: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', icon: 'text-violet-400', glow: 'shadow-violet-500/10' },
  health: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
  focus: { border: 'border-sky-500/30', bg: 'bg-sky-500/10', icon: 'text-sky-400', glow: 'shadow-sky-500/10' },
  social: { border: 'border-pink-500/30', bg: 'bg-pink-500/10', icon: 'text-pink-400', glow: 'shadow-pink-500/10' },
};

const DEFAULT_STYLE = { border: 'border-border/40', bg: 'bg-muted/10', icon: 'text-muted-foreground', glow: '' };

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

export function TaskCardsGrid() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const queryClient = useQueryClient();

  const phasePlan = useWeeklyTacticalPlan();
  const { days, toggleActionComplete } = phasePlan as any;

  const todayPlan = days?.find((d: any) => d.isToday) || null;
  const todayActions: TacticalAction[] = todayPlan
    ? todayPlan.blocks.flatMap((b: any) => b.actions)
    : [];

  // Sort: incomplete first, then by orderIndex
  const sortedActions = [...todayActions].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.orderIndex - b.orderIndex;
  });

  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [journeyAction, setJourneyAction] = useState<TacticalAction | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTaskTitle, setChatTaskTitle] = useState<string | null>(null);

  const handleExecute = useCallback((action: TacticalAction) => {
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      setExecutionAction(tacticalToNowItem(action));
      setExecutionOpen(true);
    }
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  }, [queryClient]);

  if (!sortedActions.length) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-3">🏆</div>
        <p className="text-sm font-semibold text-foreground">
          {isHe ? 'כל המשימות הושלמו!' : 'All missions complete!'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHe ? 'אין משימות להיום. מגיע לך מנוחה.' : 'No tasks for today. You earned your rest.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {sortedActions.map((action, idx) => {
            const style = CATEGORY_STYLES[action.blockCategory] || DEFAULT_STYLE;
            const title = isHe ? action.title : (action.titleEn || action.title);
            const pillarLabel = action.focusArea
              ? action.focusArea.charAt(0).toUpperCase() + action.focusArea.slice(1)
              : action.blockCategory?.charAt(0).toUpperCase() + action.blockCategory?.slice(1);

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                className={cn(
                  "group relative rounded-xl border px-3 py-2 transition-all duration-200",
                  "bg-card hover:shadow-lg",
                  style.border,
                  style.glow && `hover:${style.glow}`,
                  action.completed && "opacity-50"
                )}
              >
                {/* Category accent line */}
                <div className={cn("absolute top-0 inset-x-4 h-[2px] rounded-full", style.bg.replace('/10', '/40'))} />

                {/* Header: pillar + duration */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", style.icon)}>
                    {pillarLabel}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {action.estimatedMinutes}{isHe ? '׳' : 'm'}
                  </span>
                </div>

                {/* Title */}
                <h3 className={cn(
                  "text-xs font-bold text-foreground leading-tight line-clamp-1 mb-1.5",
                  action.completed && "line-through text-muted-foreground"
                )}>
                  {title}
                </h3>

                {/* Difficulty dots */}
                {action.difficulty && (
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          i < action.difficulty ? style.bg.replace('/10', '/60') : 'bg-muted/30'
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  {!action.completed ? (
                    <>
                      <button
                        onClick={() => handleExecute(action)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all",
                          "bg-primary/15 text-primary hover:bg-primary/25 active:scale-[0.97]"
                        )}
                      >
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                        {isHe ? 'התחל' : 'Start'}
                      </button>
                      <button
                        onClick={() => {
                          setChatTaskTitle(action.title);
                          setChatOpen(true);
                        }}
                        className="p-2 rounded-xl bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                        title={isHe ? 'דבר על המשימה' : 'Talk about task'}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      {isHe ? 'הושלם' : 'Done'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

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
