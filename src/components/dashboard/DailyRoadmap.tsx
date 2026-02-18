/**
 * DailyRoadmap - Unified vertical timeline merging habits, tasks, milestones, and daily pulse
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { useDailyPulse } from '@/hooks/useDailyPulse';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ListChecks, MapPin, Activity, Check, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

type RoadmapItemType = 'pulse' | 'habit' | 'task' | 'milestone';

interface RoadmapItem {
  id: string;
  title: string;
  type: RoadmapItemType;
  done: boolean;
  toggleable: boolean;
}

export function DailyRoadmap() {
  const { language } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isHe = language === 'he';

  // Data sources
  const { habits, toggleHabit, completedCount: habitsCompleted, totalCount: habitsTotal } = useTodaysHabits();
  const { hasLoggedToday } = useDailyPulse();
  const { currentMilestone } = useLifePlanWithMilestones();

  const { data: taskItems = [] } = useQuery({
    queryKey: ['daily-roadmap-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('action_items')
        .select('id, title, status')
        .eq('user_id', user.id)
        .eq('type', 'task')
        .neq('status', 'archived')
        .order('order_index', { ascending: true })
        .limit(10);
      return (data || []).map(t => ({ id: t.id, title: t.title, done: t.status === 'done' }));
    },
    enabled: !!user?.id,
  });

  const [showCompleted, setShowCompleted] = useState(false);

  // Build unified items
  const items: RoadmapItem[] = [];

  // Daily Pulse as first item if not logged
  if (!hasLoggedToday) {
    items.push({ id: 'pulse', title: isHe ? 'צ׳ק-אין יומי' : 'Daily Check-in', type: 'pulse', done: false, toggleable: false });
  }

  // Habits
  habits.forEach(h => {
    items.push({ id: h.id, title: h.title, type: 'habit', done: h.isCompleted, toggleable: true });
  });

  // Tasks
  taskItems.forEach(t => {
    items.push({ id: t.id, title: t.title, type: 'task', done: t.done, toggleable: true });
  });

  // Current milestone
  if (currentMilestone) {
    items.push({
      id: (currentMilestone as any).id || 'milestone',
      title: (currentMilestone as any).title || (isHe ? 'אבן דרך נוכחית' : 'Current Milestone'),
      type: 'milestone',
      done: false,
      toggleable: false,
    });
  }

  const pendingItems = items.filter(i => !i.done);
  const completedItems = items.filter(i => i.done);
  const totalItems = items.length;
  const completedTotal = completedItems.length;
  const progressPercent = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

  const handleToggle = async (item: RoadmapItem) => {
    if (!item.toggleable) return;
    if (item.type === 'habit') {
      toggleHabit(item.id, !item.done);
    } else if (item.type === 'task') {
      const newDone = !item.done;
      await supabase.from('action_items').update({
        status: newDone ? 'done' : 'pending',
        completed_at: newDone ? new Date().toISOString() : null,
      }).eq('id', item.id);
      queryClient.invalidateQueries({ queryKey: ['daily-roadmap-tasks'] });
    }
  };

  const iconForType = (type: RoadmapItemType) => {
    switch (type) {
      case 'habit': return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      case 'task': return <ListChecks className="w-3.5 h-3.5 text-violet-500" />;
      case 'milestone': return <MapPin className="w-3.5 h-3.5 text-amber-500" />;
      case 'pulse': return <Activity className="w-3.5 h-3.5 text-primary" />;
    }
  };

  const dotColorForType = (type: RoadmapItemType, done: boolean) => {
    if (done) return 'bg-primary border-primary';
    switch (type) {
      case 'habit': return 'border-emerald-500/50';
      case 'task': return 'border-violet-500/50';
      case 'milestone': return 'border-amber-500/50';
      case 'pulse': return 'border-primary/50';
    }
  };

  const lineColorForDone = (done: boolean) => done ? 'bg-primary/40' : 'bg-border/60';

  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold">
          {isHe ? 'המסלול היומי' : "Today's Journey"}
        </h3>
        <span className="text-sm font-semibold text-muted-foreground">
          {completedTotal}/{totalItems}
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercent} className="h-2 mb-4" />

      {/* Pending items timeline */}
      <div className="relative">
        {pendingItems.map((item, idx) => (
          <div key={item.id} className="relative flex items-start gap-3 group">
            {/* Timeline line */}
            {idx < pendingItems.length - 1 && (
              <div className={cn(
                "absolute top-6 w-0.5 h-[calc(100%-8px)]",
                "ltr:left-[9px] rtl:right-[9px]",
                lineColorForDone(false)
              )} />
            )}

            {/* Dot / check circle */}
            <button
              onClick={() => item.toggleable && handleToggle(item)}
              disabled={!item.toggleable}
              className={cn(
                "relative z-10 w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all",
                item.toggleable && "cursor-pointer hover:scale-110",
                !item.toggleable && "cursor-default",
                dotColorForType(item.type, item.done)
              )}
            />

            {/* Content */}
            <div className="flex items-center gap-2 min-w-0 pb-3.5 min-h-[44px]">
              {iconForType(item.type)}
              <span className="text-sm truncate">{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Completed section */}
      {completedItems.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowCompleted(prev => !prev)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full min-h-[44px]"
          >
            <ChevronDown className={cn("w-3 h-3 transition-transform", showCompleted && "rotate-180")} />
            <span className="font-medium">
              {isHe ? `הושלמו (${completedItems.length})` : `Completed (${completedItems.length})`}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-1.5">
                  {completedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 opacity-50 min-h-[40px]">
                      <button
                        onClick={() => item.toggleable && handleToggle(item)}
                        className={cn(
                          "w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center",
                          "bg-primary border-2 border-primary",
                          item.toggleable && "cursor-pointer"
                        )}
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </button>
                      <div className="flex items-center gap-2 min-w-0">
                        {iconForType(item.type)}
                        <span className="text-sm line-through text-muted-foreground truncate">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {totalItems === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">
          {isHe ? 'אין פריטים להיום' : 'No items for today'}
        </p>
      )}
    </div>
  );
}
