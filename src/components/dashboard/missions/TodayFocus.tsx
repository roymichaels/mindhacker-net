import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Sun, Clock } from 'lucide-react';
import { DayData, MissionItem } from '@/hooks/useMissionsRoadmap';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface TodayFocusProps {
  today: DayData;
  overdueTasks: MissionItem[];
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
  isHebrew: boolean;
}

export function TodayFocus({ today, overdueTasks, onToggleItem, isHebrew }: TodayFocusProps) {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleToggle = async (itemId: string, currentState: boolean) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    await onToggleItem(itemId, !currentState);
    setLoadingItems(prev => { const n = new Set(prev); n.delete(itemId); return n; });
  };

  const allItems = [...overdueTasks, ...today.items.filter(i => !overdueTasks.find(o => o.id === i.id))];
  const totalCount = allItems.length;
  const completedCount = allItems.filter(i => i.is_completed).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-5 w-5 text-amber-500" />
            {isHebrew ? 'המוקד של היום' : "Today's Focus"}
          </CardTitle>
          <Badge variant={completedCount === totalCount && totalCount > 0 ? 'default' : 'secondary'} className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progress} className="h-2" />

        {overdueTasks.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {isHebrew ? `${overdueTasks.length} משימות באיחור` : `${overdueTasks.length} overdue`}
            </p>
            {overdueTasks.map(item => (
              <TaskRow key={`overdue-${item.id}`} item={item} isOverdue onToggle={handleToggle} loading={loadingItems.has(item.id)} isHebrew={isHebrew} />
            ))}
          </div>
        )}

        {today.items.length === 0 && overdueTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isHebrew ? '🎉 אין משימות להיום!' : '🎉 No tasks for today!'}
          </p>
        ) : (
          <div className="space-y-1">
            {today.items
              .filter(i => !overdueTasks.find(o => o.id === i.id))
              .map(item => (
                <TaskRow key={item.id} item={item} onToggle={handleToggle} loading={loadingItems.has(item.id)} isHebrew={isHebrew} />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TaskRow({ item, isOverdue, onToggle, loading, isHebrew }: {
  item: MissionItem; isOverdue?: boolean;
  onToggle: (id: string, current: boolean) => void;
  loading: boolean; isHebrew: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-2 rounded-lg transition-colors",
      item.is_completed ? "bg-muted/30" : "hover:bg-muted/50",
      isOverdue && !item.is_completed && "bg-destructive/5 border border-destructive/20",
      loading && "opacity-50"
    )}>
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={() => onToggle(item.id, item.is_completed)}
        disabled={loading}
        className="shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", item.is_completed && "line-through text-muted-foreground")}>
          {item.content}
        </p>
        {item.checklist_title && (
          <p className="text-xs text-muted-foreground">{item.checklist_title}</p>
        )}
      </div>
      {isOverdue && !item.is_completed && (
        <Clock className="h-3.5 w-3.5 text-destructive shrink-0" />
      )}
    </div>
  );
}
