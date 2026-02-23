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

  const { data: actionItems, isLoading } = useQuery({
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
              {milestone.goal || milestone.title}
            </DialogTitle>
          </DialogHeader>
          {milestone.focus_area && (
            <p className="text-xs text-muted-foreground mt-1">{milestone.focus_area}</p>
          )}
        </div>

        {/* Action Items */}
        <ScrollArea className="max-h-[55vh]">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <ListTodo className="w-4 h-4 text-muted-foreground" />
                {isHe ? 'משימות' : 'Tasks'}
              </div>
              {total > 0 && (
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
            ) : total === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                {isHe ? 'אין משימות עדיין' : 'No tasks yet'}
              </p>
            ) : (
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
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
