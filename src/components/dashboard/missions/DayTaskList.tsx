import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { DayData } from '@/hooks/useMissionsRoadmap';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayTaskListProps {
  day: DayData;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
  isHebrew: boolean;
}

export function DayTaskList({ day, onToggleItem, isHebrew }: DayTaskListProps) {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const locale = isHebrew ? he : enUS;

  const handleToggle = async (itemId: string, currentState: boolean) => {
    setLoadingItems(prev => new Set(prev).add(itemId));
    await onToggleItem(itemId, !currentState);
    setLoadingItems(prev => { const n = new Set(prev); n.delete(itemId); return n; });
  };

  const dateLabel = format(day.date, 'EEEE, d MMMM', { locale });

  return (
    <Card className={cn(day.isToday && "border-primary/30")}>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {dateLabel}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {day.completedCount}/{day.totalCount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0">
        <div className="space-y-1">
          {day.items.map(item => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                item.is_completed ? "bg-muted/30" : "hover:bg-muted/50",
                loadingItems.has(item.id) && "opacity-50"
              )}
            >
              <Checkbox
                checked={item.is_completed}
                onCheckedChange={() => handleToggle(item.id, item.is_completed)}
                disabled={loadingItems.has(item.id)}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", item.is_completed && "line-through text-muted-foreground")}>
                  {item.content}
                </p>
                {item.category && (
                  <Badge variant="outline" className="text-[10px] mt-0.5 h-4">
                    {item.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
