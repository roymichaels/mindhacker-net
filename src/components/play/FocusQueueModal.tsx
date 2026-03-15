/**
 * FocusQueueModal — Today's Focus Queue.
 * Draggable cards sorted by priority. Reordering persists to DB.
 */
import { useState, useCallback } from 'react';
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
import { useFocusQueue, type FocusQueueItem } from '@/hooks/useFocusQueue';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  GripVertical, Play, CheckCircle2, SkipForward, Clock,
  Zap, Target, Dumbbell, Brain, Briefcase, Heart, X,
} from 'lucide-react';

interface FocusQueueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function FocusQueueModal({ open, onOpenChange }: FocusQueueModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { items, isLoading, reorder, complete, skip, completedCount, totalCount } = useFocusQueue();
  const [localItems, setLocalItems] = useState<FocusQueueItem[]>([]);

  // Sync local items when modal opens or items change
  const displayItems = localItems.length > 0 ? localItems : items;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayItems.findIndex(i => i.id === active.id);
    const newIndex = displayItems.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(displayItems, oldIndex, newIndex);
    setLocalItems(reordered);

    try {
      await reorder(reordered.map(i => i.id));
    } catch (e) {
      console.error('Reorder failed:', e);
      setLocalItems([]);
    }
  }, [displayItems, reorder]);

  const handleComplete = async (id: string) => {
    await complete(id);
    setLocalItems([]);
  };

  const handleSkip = async (id: string) => {
    await skip(id);
    setLocalItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-hidden p-0 gap-0 rounded-2xl" preventClose>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isHe ? 'תור המשימות' : "Today's Focus Queue"}
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {completedCount}/{totalCount} {isHe ? 'הושלמו' : 'completed'}
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

        {/* Queue progress */}
        <div className="px-4 pt-3 pb-2" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Sortable list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-sm font-bold text-foreground">
                {isHe ? 'אין משימות להיום' : 'No tasks for today'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {isHe ? 'צור משימות חדשות או חכה לאיזון יומי' : 'Create tasks or wait for daily rebalance'}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={displayItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2 pt-1">
                  {displayItems.map((item, idx) => (
                    <SortableTaskCard
                      key={item.id}
                      item={item}
                      index={idx}
                      isNext={idx === 0}
                      isHe={isHe}
                      isRTL={isRTL}
                      onComplete={() => handleComplete(item.id)}
                      onSkip={() => handleSkip(item.id)}
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

// ── Sortable Task Card ──
interface SortableTaskCardProps {
  item: FocusQueueItem;
  index: number;
  isNext: boolean;
  isHe: boolean;
  isRTL: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

function SortableTaskCard({ item, index, isNext, isHe, isRTL, onComplete, onSkip }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const pillar = item.pillar || 'default';
  const colorClass = PILLAR_COLORS[pillar] || 'text-muted-foreground bg-muted/30';
  const PillarIcon = PILLAR_ICONS[pillar] || PILLAR_ICONS.default;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-xl border bg-card transition-all",
        isDragging && "shadow-xl shadow-primary/20 scale-[1.02] border-primary/40",
        isNext && !isDragging && "border-primary/30 ring-1 ring-primary/20",
        !isNext && !isDragging && "border-border/40",
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

        {/* Priority badge */}
        <div className={cn(
          "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold",
          isNext ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground"
        )}>
          {index + 1}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground line-clamp-1">
            {item.title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            {item.pillar && (
              <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md", colorClass)}>
                <PillarIcon className="w-2.5 h-2.5" />
                {item.pillar}
              </span>
            )}
            {item.xp_reward > 0 && (
              <span className="text-[10px] text-amber-400 font-medium">+{item.xp_reward} XP</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isNext ? (
            <Button
              size="sm"
              onClick={onComplete}
              className="h-7 px-2.5 text-xs rounded-lg gap-1"
            >
              <Play className="w-3 h-3" fill="currentColor" />
              {isHe ? 'התחל' : 'Start'}
            </Button>
          ) : (
            <button
              onClick={onComplete}
              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/15 transition-colors"
              title={isHe ? 'השלם' : 'Complete'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSkip}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title={isHe ? 'דלג' : 'Skip'}
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
