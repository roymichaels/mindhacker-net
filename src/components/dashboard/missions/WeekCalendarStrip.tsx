import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DayData, MissionItem } from '@/hooks/useMissionsRoadmap';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayTaskList } from './DayTaskList';

interface WeekCalendarStripProps {
  days: DayData[];
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
  isHebrew: boolean;
}

export function WeekCalendarStrip({ days, onToggleItem, isHebrew }: WeekCalendarStripProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const locale = isHebrew ? he : enUS;

  const selectedDayData = selectedDay ? days.find(d => d.dateStr === selectedDay) : null;

  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const isSelected = selectedDay === day.dateStr;
              const allDone = day.totalCount > 0 && day.completedCount === day.totalCount;
              const hasItems = day.totalCount > 0;
              const hasIncomplete = day.totalCount > 0 && day.completedCount < day.totalCount;

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDay(isSelected ? null : day.dateStr)}
                  className={cn(
                    "flex flex-col items-center p-1.5 rounded-lg transition-all text-center min-h-[60px]",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && day.isToday && "bg-primary/10 ring-2 ring-primary/30",
                    !isSelected && !day.isToday && "hover:bg-muted/50",
                    day.isPast && !day.isToday && !isSelected && "opacity-60"
                  )}
                >
                  <span className="text-[10px] uppercase font-medium">
                    {format(day.date, 'EEE', { locale }).slice(0, 2)}
                  </span>
                  <span className={cn("text-sm font-bold", day.isToday && !isSelected && "text-primary")}>
                    {format(day.date, 'd')}
                  </span>
                  {/* Status dots */}
                  <div className="flex gap-0.5 mt-0.5">
                    {hasItems && (
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        allDone ? "bg-green-500" :
                        hasIncomplete ? (isSelected ? "bg-primary-foreground/70" : "bg-amber-500") :
                        "bg-muted-foreground/30"
                      )} />
                    )}
                    {day.totalCount > 3 && (
                      <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        allDone ? "bg-green-500" : isSelected ? "bg-primary-foreground/50" : "bg-muted-foreground/20"
                      )} />
                    )}
                  </div>
                  {hasItems && (
                    <span className={cn("text-[9px] mt-0.5", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {day.completedCount}/{day.totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expanded day tasks */}
      {selectedDayData && selectedDayData.totalCount > 0 && (
        <DayTaskList
          day={selectedDayData}
          onToggleItem={onToggleItem}
          isHebrew={isHebrew}
        />
      )}
    </div>
  );
}
