/**
 * FocusQueueModal — Today's Focus Queue with 10-day tactical plan integration.
 * Shows prioritized tasks from the tactical plan with drag-and-drop reordering.
 * Includes 10-day selector, talk-to-task, and execution launch.
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyTacticalPlan, type TacticalAction, type DayPlan } from '@/hooks/useWeeklyTacticalPlan';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Play, CheckCircle2, SkipForward, Circle,
  Zap, Target, Dumbbell, Brain, Briefcase, Heart, X,
  MessageSquare, Calendar, Wand2,
} from 'lucide-react';

interface FocusQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuteAction: (action: TacticalAction) => void;
  onTalkToTask: (taskTitle: string) => void;
}

const PILLAR_ICONS: Record<string, typeof Target> = {
  vitality: Heart,
  power: Dumbbell,
  focus: Brain,
  wealth: Briefcase,
  default: Target,
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

export function FocusQueueModal({ open, onOpenChange, onExecuteAction, onTalkToTask }: FocusQueueModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const phasePlan = useWeeklyTacticalPlan();
  const { days, phase, isLoading, toggleActionComplete } = phasePlan as any;

  // 10-day selector state
  const todayIndex = useMemo(() => {
    const idx = (days || []).findIndex((d: DayPlan) => d.isToday);
    return idx >= 0 ? idx : 0;
  }, [days]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Reset to today when modal opens
  useEffect(() => {
    if (open) setSelectedDay(null);
  }, [open]);

  const activeDay = selectedDay ?? todayIndex;
  const activeDayPlan: DayPlan | null = days?.[activeDay] || null;

  // Flatten actions for the active day, sorted by priority (incomplete first)
  const dayActions: TacticalAction[] = useMemo(() => {
    if (!activeDayPlan) return [];
    const all = activeDayPlan.blocks.flatMap((b: any) => b.actions);
    // Sort: incomplete first, then by order
    return [...all].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    });
  }, [activeDayPlan]);

  const [localOrder, setLocalOrder] = useState<string[]>([]);

  // Reset local order when day changes
  useEffect(() => {
    setLocalOrder([]);
  }, [activeDay]);

  const displayActions = useMemo(() => {
    if (localOrder.length === 0) return dayActions;
    const map = new Map(dayActions.map(a => [a.id, a]));
    return localOrder.map(id => map.get(id)).filter(Boolean) as TacticalAction[];
  }, [dayActions, localOrder]);

  const completedCount = dayActions.filter(a => a.completed).length;
  const totalCount = dayActions.length;

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

  const handleToggle = useCallback((action: TacticalAction) => {
    if (toggleActionComplete) {
      toggleActionComplete(action);
    }
  }, [toggleActionComplete]);

  const isToday = activeDayPlan?.isToday ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {isHe ? 'תור המשימות' : 'Focus Queue'}
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? `שלב ${phase}` : `Phase ${phase}`} · {completedCount}/{totalCount} {isHe ? 'הושלמו' : 'done'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 10-Day Selector */}
          <div className="flex gap-1 px-3 pb-2 overflow-x-auto no-scrollbar">
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
                    isActive
                      ? "bg-primary/15 border border-primary/30"
                      : hasActions
                        ? "bg-muted/20 border border-border/20 hover:bg-muted/40"
                        : "bg-transparent border border-transparent opacity-40"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold",
                    isActive ? "text-primary" : "text-foreground/60"
                  )}>
                    {day.dayNumber}
                  </span>
                  <span className={cn(
                    "text-[8px]",
                    isActive ? "text-primary/70" : "text-muted-foreground"
                  )}>
                    {day.completedActions}/{day.totalActions}
                  </span>
                  <span className={cn(
                    "text-[7px]",
                    isActive ? "text-primary/60" : "text-muted-foreground/60"
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
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-2 pb-1" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {activeDayPlan && (
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground font-medium">
                {isHe ? activeDayPlan.label : activeDayPlan.labelEn}
                {isToday && <span className="text-primary ms-1">({isHe ? 'היום' : 'Today'})</span>}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {activeDayPlan.totalMinutes}{isHe ? ' דק׳' : ' min'}
              </span>
            </div>
          )}
        </div>

        {/* Sortable task list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="text-sm font-bold text-foreground">
                {isHe ? 'יום מנוחה' : 'Rest day'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isHe ? 'אין משימות מתוכננות ליום זה' : 'No missions scheduled for this day'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={displayActions.map(a => a.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2 pt-1">
                  {displayActions.map((action, idx) => (
                    <SortableActionCard
                      key={action.id}
                      action={action}
                      index={idx}
                      isFirst={idx === 0 && !action.completed}
                      isHe={isHe}
                      isRTL={isRTL}
                      onToggle={() => handleToggle(action)}
                      onExecute={() => {
                        onOpenChange(false);
                        setTimeout(() => onExecuteAction(action), 150);
                      }}
                      onTalkToTask={() => {
                        onOpenChange(false);
                        setTimeout(() => onTalkToTask(action.title), 150);
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Sortable Action Card ──
interface SortableActionCardProps {
  action: TacticalAction;
  index: number;
  isFirst: boolean;
  isHe: boolean;
  isRTL: boolean;
  onToggle: () => void;
  onExecute: () => void;
  onTalkToTask: () => void;
}

function SortableActionCard({ action, index, isFirst, isHe, isRTL, onToggle, onExecute, onTalkToTask }: SortableActionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const pillar = action.focusArea || 'default';
  const colorClass = PILLAR_COLORS[pillar] || 'text-muted-foreground bg-muted/30';
  const PillarIcon = PILLAR_ICONS[pillar] || PILLAR_ICONS.default;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl border bg-card transition-all",
        isDragging && "shadow-xl shadow-primary/20 scale-[1.02] border-primary/40",
        action.completed && "opacity-50",
        isFirst && !isDragging && !action.completed && "border-primary/30 ring-1 ring-primary/20",
        !isFirst && !isDragging && !action.completed && "border-border/40",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-muted/50 transition-colors"
        >
          {action.completed ? (
            <CheckCircle2 className="h-4 w-4 text-primary" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
          )}
        </button>

        {/* Content — tap to execute */}
        <button
          onClick={onExecute}
          className="flex-1 min-w-0 text-start hover:opacity-80 transition-opacity"
        >
          <h4 className={cn(
            "text-xs font-semibold line-clamp-1",
            action.completed ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {isHe ? action.title : (action.titleEn || action.title)}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            {pillar !== 'default' && (
              <span className={cn("inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md", colorClass)}>
                <PillarIcon className="w-2.5 h-2.5" />
                {pillar}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground">
              {action.estimatedMinutes}{isHe ? ' דק׳' : 'm'}
            </span>
            {action.xpReward > 0 && (
              <span className="text-[9px] text-amber-400 font-medium">+{action.xpReward} XP</span>
            )}
          </div>
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={onTalkToTask}
            className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
            title={isHe ? 'דבר על המשימה' : 'Talk about task'}
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
          {isFirst && !action.completed ? (
            <Button
              size="sm"
              onClick={onExecute}
              className="h-7 px-2 text-[10px] rounded-lg gap-1"
            >
              <Play className="w-3 h-3" fill="currentColor" />
              {isHe ? 'התחל' : 'Start'}
            </Button>
          ) : !action.completed ? (
            <button
              onClick={onExecute}
              className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
