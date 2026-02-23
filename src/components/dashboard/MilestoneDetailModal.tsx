import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Check, Target, ListTodo, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MilestoneDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: {
    id: string;
    title: string;
    goal: string | null;
    focus_area: string | null;
    week_number: number;
    month_number: number;
    is_completed: boolean | null;
  } | null;
}

export function MilestoneDetailModal({ open, onOpenChange, milestone }: MilestoneDetailModalProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  // Fetch milestone's built-in tasks from the milestone row itself
  const { data: milestoneRow, isLoading: loadingMilestone } = useQuery({
    queryKey: ['milestone-row', milestone?.id],
    queryFn: async () => {
      if (!milestone?.id) return null;
      const { data } = await supabase
        .from('life_plan_milestones')
        .select('tasks, tasks_en, description, description_en, goal, goal_en, challenge, hypnosis_recommendation')
        .eq('id', milestone.id)
        .maybeSingle();
      return data;
    },
    enabled: !!milestone?.id && open,
  });

  // Also check for linked action_items
  const { data: actionItems, isLoading: loadingActions } = useQuery({
    queryKey: ['milestone-actions', milestone?.id],
    queryFn: async () => {
      if (!milestone?.id) return [];
      const { data } = await supabase
        .from('action_items')
        .select('id, title, description, status, type, scheduled_date, completed_at')
        .eq('milestone_id', milestone.id)
        .order('order_index', { ascending: true });
      return data || [];
    },
    enabled: !!milestone?.id && open,
  });

  if (!milestone) return null;

  const isLoading = loadingMilestone || loadingActions;

  // Get tasks from milestone row (bilingual)
  const builtInTasks: string[] = isHe
    ? (milestoneRow?.tasks as string[] || [])
    : (milestoneRow?.tasks_en as string[] || milestoneRow?.tasks as string[] || []);

  const goalText = isHe
    ? (milestoneRow?.goal || milestone.goal)
    : (milestoneRow?.goal_en || milestoneRow?.goal || milestone.goal);

  const descText = isHe
    ? milestoneRow?.description
    : (milestoneRow?.description_en || milestoneRow?.description);

  const hasActionItems = (actionItems?.length ?? 0) > 0;
  const completed = actionItems?.filter(a => a.status === 'done').length ?? 0;
  const total = actionItems?.length ?? 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const weekLabel = isHe ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`;
  const monthLabel = isHe ? `חודש ${milestone.month_number}` : `Month ${milestone.month_number}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden p-0" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="p-4 pb-3 border-b bg-gradient-to-r from-amber-500/10 to-transparent">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">{monthLabel}</Badge>
              <Badge variant="outline" className="text-xs">{weekLabel}</Badge>
              {milestone.is_completed && (
                <Badge className="bg-amber-500/20 text-amber-600 text-xs gap-1">
                  <Trophy className="w-3 h-3" />
                  {isHe ? 'הושלם' : 'Done'}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-base font-semibold leading-snug">
              {goalText || milestone.title}
            </DialogTitle>
          </DialogHeader>
          {milestone.focus_area && (
            <p className="text-xs text-muted-foreground mt-1">{milestone.focus_area}</p>
          )}
          {descText && (
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{descText}</p>
          )}
        </div>

        {/* Tasks */}
        <ScrollArea className="max-h-[55vh]">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
                {isHe ? 'משימות' : 'Tasks'}
              </div>
              {hasActionItems && total > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                  <div className="w-16">
                    <Progress value={progress} className="h-1.5 [&>div]:bg-amber-500" />
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : hasActionItems ? (
              /* Linked action_items */
              <div className="space-y-1.5">
                {actionItems?.map(item => (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-start gap-2.5 p-2.5 rounded-lg border bg-card/50',
                      item.status === 'done' && 'opacity-60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                        item.status === 'done' ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/40'
                      )}
                    >
                      {item.status === 'done' && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        'text-xs block',
                        item.status === 'done' && 'line-through text-muted-foreground'
                      )}>
                        {item.title}
                      </span>
                      {item.description && (
                        <span className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 block">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : builtInTasks.length > 0 ? (
              /* Built-in tasks from milestone row */
              <div className="space-y-1.5">
                {builtInTasks.map((task, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-card/50"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/40 shrink-0 mt-0.5" />
                    <span className="text-xs block flex-1">{task}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">
                {isHe ? 'אין משימות עדיין' : 'No tasks yet'}
              </p>
            )}

            {/* Challenge / Hypnosis recommendation */}
            {milestoneRow?.challenge && (
              <div className="mt-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <p className="text-[10px] font-semibold text-amber-600 mb-1">
                  {isHe ? '⚡ אתגר השבוע' : '⚡ Weekly Challenge'}
                </p>
                <p className="text-xs text-muted-foreground">{milestoneRow.challenge}</p>
              </div>
            )}

            {milestoneRow?.hypnosis_recommendation && (
              <div className="mt-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-[10px] font-semibold text-primary mb-1">
                  {isHe ? '🧠 המלצת היפנוזה' : '🧠 Hypnosis Recommendation'}
                </p>
                <p className="text-xs text-muted-foreground">{milestoneRow.hypnosis_recommendation}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
