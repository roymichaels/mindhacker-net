import { useState, useMemo } from 'react';
import { ListChecks, Check, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChecklistsData } from '@/hooks/aurora/useChecklistsData';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TaskItem {
  id: string;
  content: string;
  is_completed: boolean;
  order_index: number;
  due_date?: string | null;
  completed_at?: string | null;
  checklist_title: string;
}

export function TasksPopover() {
  const { user } = useAuth();
  const { checklists, loading, toggleItem } = useChecklistsData(user);
  const { language, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    const result = await toggleItem(itemId, !isCompleted);
    if (result && !isCompleted) {
      toast.success(language === 'he' ? 'משימה הושלמה! +10 XP' : 'Task completed! +10 XP', { icon: '🎉' });
    }
  };

  // Extract today's tasks and overdue tasks
  const { todayTasks, overdueTasks, completedToday } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const allItems: TaskItem[] = checklists.flatMap(c =>
      (c.aurora_checklist_items || []).map(item => ({
        ...item,
        checklist_title: c.title,
      }))
    );

    // Tasks due today (not completed)
    const todayItems = allItems.filter(item => {
      if (item.is_completed) return false;
      if (!item.due_date) return false;
      const dueDate = item.due_date.split('T')[0];
      return dueDate === todayStr;
    });

    // Overdue tasks (not completed, due before today)
    const overdueItems = allItems.filter(item => {
      if (item.is_completed) return false;
      if (!item.due_date) return false;
      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    // Completed today
    const completedTodayItems = allItems.filter(item => {
      if (!item.is_completed || !item.completed_at) return false;
      const completedDate = item.completed_at.split('T')[0];
      return completedDate === todayStr;
    });

    // If no date-based tasks, show all uncompleted tasks as fallback
    if (todayItems.length === 0 && overdueItems.length === 0) {
      const uncompletedItems = allItems.filter(item => !item.is_completed).slice(0, 10);
      return { todayTasks: uncompletedItems, overdueTasks: [] as TaskItem[], completedToday: completedTodayItems };
    }

    return { todayTasks: todayItems, overdueTasks: overdueItems, completedToday: completedTodayItems };
  }, [checklists]);

  const totalForToday = todayTasks.length + overdueTasks.length + completedToday.length;
  const doneCount = completedToday.length;
  const progress = totalForToday > 0 ? Math.round((doneCount / totalForToday) * 100) : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground/70 hover:text-foreground hover:bg-muted/60"
          title={language === 'he' ? 'משימות היום' : "Today's Tasks"}
        >
          <ListChecks className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-popover border shadow-lg z-[100] max-h-[80vh] overflow-hidden"
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
      >
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="p-3 border-b bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-sm">
                  {language === 'he' ? '📋 המשימות להיום' : "📋 Today's Tasks"}
                </span>
              </div>
              {totalForToday > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {doneCount}/{totalForToday}
                  </span>
                  <div className="w-12">
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-4 text-center">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          ) : todayTasks.length === 0 && overdueTasks.length === 0 && completedToday.length === 0 ? (
            <div className="p-6 text-center">
              <ListChecks className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'אין משימות להיום' : 'No tasks for today'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="p-3 space-y-1.5">
                {/* Overdue tasks */}
                {overdueTasks.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                      <span className="text-xs font-medium text-destructive">
                        {language === 'he' ? 'באיחור' : 'Overdue'}
                      </span>
                    </div>
                    {overdueTasks.map(item => (
                      <TaskRow key={item.id} item={item} onToggle={handleToggleItem} isOverdue />
                    ))}
                  </div>
                )}

                {/* Today's tasks */}
                {todayTasks.length > 0 && (
                  <div className="mb-2">
                    {overdueTasks.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Clock className="w-3.5 h-3.5 text-foreground" />
                        <span className="text-xs font-medium">
                          {language === 'he' ? 'היום' : 'Today'}
                        </span>
                      </div>
                    )}
                    {todayTasks.map(item => (
                      <TaskRow key={item.id} item={item} onToggle={handleToggleItem} />
                    ))}
                  </div>
                )}

                {/* Completed today */}
                {completedToday.length > 0 && (
                  <div className="pt-1 border-t">
                    <span className="text-[10px] text-muted-foreground mb-1 block">
                      {language === 'he' ? `✓ הושלמו היום (${completedToday.length})` : `✓ Done today (${completedToday.length})`}
                    </span>
                    {completedToday.map(item => (
                      <TaskRow key={item.id} item={item} onToggle={handleToggleItem} />
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          {totalForToday > 0 && (
            <div className="p-2 border-t bg-muted/20">
              <p className="text-[10px] text-center text-muted-foreground">
                <Sparkles className="w-3 h-3 inline-block me-1" />
                {language === 'he' ? 'לחץ על משימה לסימון' : 'Click task to mark complete'}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TaskRow({ item, onToggle, isOverdue }: { item: TaskItem; onToggle: (id: string, completed: boolean) => void; isOverdue?: boolean }) {
  return (
    <button
      onClick={() => onToggle(item.id, item.is_completed)}
      className={cn(
        'w-full flex items-center gap-2 p-2 rounded-md text-start transition-colors',
        'hover:bg-muted/50',
        item.is_completed && 'opacity-50',
        isOverdue && !item.is_completed && 'bg-destructive/5'
      )}
    >
      <div
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
          item.is_completed ? 'bg-primary border-primary' : isOverdue ? 'border-destructive/70' : 'border-muted-foreground/50'
        )}
      >
        {item.is_completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>
      <span className={cn(
        'text-xs flex-1 break-words whitespace-normal leading-relaxed',
        item.is_completed && 'line-through text-muted-foreground'
      )}>
        {item.content}
      </span>
    </button>
  );
}
