/**
 * MissionControlTab — Interactive tab with 10-day roadmap + media player controls.
 * Combines the milestone roadmap selector and task execution interface.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { MilestoneJourneyModal } from '@/components/tactics/MilestoneJourneyModal';
import { PlanChatWizard } from '@/components/plan/PlanChatWizard';
import { useQueryClient } from '@tanstack/react-query';
import type { NowQueueItem } from '@/types/planning';
import {
  Play, SkipBack, SkipForward, CheckCircle2, Circle,
  GripVertical, MessageSquare, Target, Heart, Dumbbell, Brain, Briefcase, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PILLAR_ICONS: Record<string, typeof Target> = {
  vitality: Heart, power: Dumbbell, focus: Brain, wealth: Briefcase, default: Target,
};
const PILLAR_COLORS: Record<string, string> = {
  vitality: 'text-rose-400 bg-rose-500/15',
  power: 'text-orange-400 bg-orange-500/15',
  combat: 'text-red-400 bg-red-500/15',
  focus: 'text-sky-400 bg-sky-500/15',
  consciousness: 'text-violet-400 bg-violet-500/15',
  expansion: 'text-indigo-400 bg-indigo-500/15',
  wealth: 'text-emerald-400 bg-emerald-500/15',
  influence: 'text-amber-400 bg-amber-500/15',
  relationships: 'text-pink-400 bg-pink-500/15',
  business: 'text-cyan-400 bg-cyan-500/15',
  projects: 'text-teal-400 bg-teal-500/15',
  play: 'text-fuchsia-400 bg-fuchsia-500/15',
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
    completed: !!action.completed,
    calendarDate: action.calendarDate,
  };
}

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
  const [localOrder, setLocalOrder] = useState<string[]>([]);

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

  useEffect(() => { setLocalOrder([]); }, [activeDay]);

  const displayActions = useMemo(() => {
    if (localOrder.length === 0) return dayActions;
    const map = new Map(dayActions.map(a => [a.id, a]));
    return localOrder.map(id => map.get(id)).filter(Boolean) as TacticalAction[];
  }, [dayActions, localOrder]);

  const incompleteActions = dayActions.filter(a => !a.completed);
  const nextAction = incompleteActions[0] || null;
  const completedCount = dayActions.filter(a => a.completed).length;
  const totalCount = dayActions.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const currentList = localOrder.length > 0 ? localOrder : dayActions.map(a => a.id);
    const oldIndex = currentList.indexOf(active.id as string);
    const newIndex = currentList.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    setLocalOrder(arrayMove(currentList, oldIndex, newIndex));
  }, [localOrder, dayActions]);

  const handleExecute = useCallback((action: TacticalAction) => {
    if (action.sourceMilestoneId) {
      setJourneyAction(action);
      setJourneyOpen(true);
    } else {
      setExecutionAction(tacticalToNowItem(action));
      setExecutionOpen(true);
    }
  }, []);

  const handleToggle = useCallback((action: TacticalAction) => {
    if (toggleActionComplete) toggleActionComplete(action);
  }, [toggleActionComplete]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['tactical-schedule'] });
  }, [queryClient]);

  const nextIndex = nextAction ? dayActions.indexOf(nextAction) : -1;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
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

        {/* ── Media Player Bar ── */}
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
                  {nextAction ? (isHe ? nextAction.title : (nextAction.titleEn || nextAction.title)) : (isHe ? 'כל המשימות הושלמו! 🏆' : 'All missions complete! 🏆')}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress */}
          <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-3 mx-4">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => { if (nextIndex > 0) handleExecute(dayActions[nextIndex - 1]); }}
              disabled={nextIndex <= 0}
              className="w-9 h-9 rounded-xl bg-muted/40 hover:bg-muted/60 flex items-center justify-center transition-all text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <SkipBack className="w-4 h-4" />
            </button>

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
        </div>

        {/* ── Task List (sortable) ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayActions.length === 0 ? (
          <div className="rounded-2xl border border-border/30 bg-card/50 p-8 text-center">
            <div className="text-4xl mb-3">🌙</div>
            <h3 className="text-sm font-bold text-foreground">{isHe ? 'יום מנוחה' : 'Rest day'}</h3>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayActions.map(a => a.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {displayActions.map((action, idx) => (
                  <SortableCard
                    key={action.id}
                    action={action}
                    isFirst={idx === 0 && !action.completed}
                    isHe={isHe}
                    onToggle={() => handleToggle(action)}
                    onExecute={() => handleExecute(action)}
                    onTalk={() => { setChatTaskTitle(action.title); setChatOpen(true); }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </motion.div>

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

// ── Sortable Card ──
function SortableCard({ action, isFirst, isHe, onToggle, onExecute, onTalk }: {
  action: TacticalAction; isFirst: boolean; isHe: boolean;
  onToggle: () => void; onExecute: () => void; onTalk: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: action.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };
  const pillar = action.focusArea || 'default';
  const colorClass = PILLAR_COLORS[pillar] || 'text-muted-foreground bg-muted/30';
  const PillarIcon = PILLAR_ICONS[pillar] || PILLAR_ICONS.default;

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "rounded-xl border bg-card transition-all",
      isDragging && "shadow-xl shadow-primary/20 scale-[1.02] border-primary/40",
      action.completed && "opacity-50",
      isFirst && !isDragging && !action.completed && "border-primary/30 ring-1 ring-primary/20",
      !isFirst && !isDragging && !action.completed && "border-border/40",
    )}>
      <div className="flex items-center gap-2 p-3">
        <button {...attributes} {...listeners} className="flex-shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="flex-shrink-0 p-0.5 rounded-full hover:bg-muted/50 transition-colors">
          {action.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />}
        </button>
        <button onClick={onExecute} className="flex-1 min-w-0 text-start hover:opacity-80 transition-opacity">
          <h4 className={cn("text-xs font-semibold line-clamp-1", action.completed ? "line-through text-muted-foreground" : "text-foreground")}>
            {isHe ? action.title : (action.titleEn || action.title)}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            {pillar !== 'default' && (
              <span className={cn("inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md", colorClass)}>
                <PillarIcon className="w-2.5 h-2.5" />{pillar}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground">{action.estimatedMinutes}{isHe ? ' דק׳' : 'm'}</span>
          </div>
        </button>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={onTalk} className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          {isFirst && !action.completed ? (
            <Button size="sm" onClick={onExecute} className="h-7 px-2 text-[10px] rounded-lg gap-1">
              <Play className="w-3 h-3" fill="currentColor" />{isHe ? 'התחל' : 'Start'}
            </Button>
          ) : !action.completed ? (
            <button onClick={onExecute} className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors">
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
