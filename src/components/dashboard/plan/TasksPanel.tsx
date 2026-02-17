import { useMemo } from 'react';
import { ListChecks, Check, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChecklistsData } from '@/hooks/aurora/useChecklistsData';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface TaskItem {
  id: string;
  content: string;
  is_completed: boolean;
  order_index: number;
  due_date?: string | null;
  completed_at?: string | null;
  checklist_title: string;
}

export function TasksPanel() {
  const { user } = useAuth();
  const { checklists, loading, toggleItem } = useChecklistsData(user);
  const { language } = useTranslation();

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    const result = await toggleItem(itemId, !isCompleted);
    if (result && !isCompleted) {
      toast.success(language === 'he' ? 'משימה הושלמה! +10 XP' : 'Task completed! +10 XP', { icon: '🎉' });
    }
  };

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

    const todayItems = allItems.filter(item => {
      if (item.is_completed) return false;
      if (!item.due_date) return false;
      return item.due_date.split('T')[0] === todayStr;
    });

    const overdueItems = allItems.filter(item => {
      if (item.is_completed || !item.due_date) return false;
      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });

    const completedTodayItems = allItems.filter(item => {
      if (!item.is_completed || !item.completed_at) return false;
      return item.completed_at.split('T')[0] === todayStr;
    });

    if (todayItems.length === 0 && overdueItems.length === 0) {
      const uncompletedItems = allItems.filter(item => !item.is_completed).slice(0, 10);
      return { todayTasks: uncompletedItems, overdueTasks: [] as TaskItem[], completedToday: completedTodayItems };
    }

    return { todayTasks: todayItems, overdueTasks: overdueItems, completedToday: completedTodayItems };
  }, [checklists]);

  const totalForToday = todayTasks.length + overdueTasks.length + completedToday.length;
  const doneCount = completedToday.length;
  const progress = totalForToday > 0 ? Math.round((doneCount / totalForToday) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (todayTasks.length === 0 && overdueTasks.length === 0 && completedToday.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ListChecks className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          {language === 'he' ? 'אין משימות להיום' : 'No tasks for today'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      {totalForToday > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">
                {language === 'he' ? 'התקדמות היום' : "Today's Progress"}
              </span>
              <span className="text-xs text-muted-foreground">{doneCount}/{totalForToday}</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs font-semibold text-destructive">
              {language === 'he' ? 'באיחור' : 'Overdue'} ({overdueTasks.length})
            </span>
          </div>
          <div className="space-y-1">
            {overdueTasks.map(item => (
              <TaskRow key={item.id} item={item} onToggle={handleToggleItem} isOverdue />
            ))}
          </div>
        </div>
      )}

      {/* Today */}
      {todayTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Clock className="w-3.5 h-3.5 text-foreground" />
            <span className="text-xs font-semibold">
              {language === 'he' ? 'היום' : 'Today'} ({todayTasks.length})
            </span>
          </div>
          <div className="space-y-1">
            {todayTasks.map(item => (
              <TaskRow key={item.id} item={item} onToggle={handleToggleItem} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedToday.length > 0 && (
        <div className="pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground mb-2 block px-1">
            {language === 'he' ? `✓ הושלמו היום (${completedToday.length})` : `✓ Done today (${completedToday.length})`}
          </span>
          <div className="space-y-1">
            {completedToday.map(item => (
              <TaskRow key={item.id} item={item} onToggle={handleToggleItem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ item, onToggle, isOverdue }: { item: TaskItem; onToggle: (id: string, completed: boolean) => void; isOverdue?: boolean }) {
  return (
    <button
      onClick={() => onToggle(item.id, item.is_completed)}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-start transition-colors',
        'hover:bg-muted/50 border border-transparent',
        item.is_completed && 'opacity-50',
        isOverdue && !item.is_completed && 'bg-destructive/5 border-destructive/10'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
          item.is_completed ? 'bg-primary border-primary' : isOverdue ? 'border-destructive/70' : 'border-muted-foreground/40'
        )}
      >
        {item.is_completed && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
      <span className={cn(
        'text-sm flex-1 break-words whitespace-normal leading-relaxed',
        item.is_completed && 'line-through text-muted-foreground'
      )}>
        {item.content}
      </span>
    </button>
  );
}
