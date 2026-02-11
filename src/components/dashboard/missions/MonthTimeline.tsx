import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Target, Trophy, CheckCircle2, Calendar } from 'lucide-react';
import { MonthData, WeekData } from '@/hooks/useMissionsRoadmap';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DayTaskList } from './DayTaskList';

interface MonthTimelineProps {
  months: MonthData[];
  currentWeek: number;
  currentMonth: number;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
  isHebrew: boolean;
}

export function MonthTimeline({ months, currentWeek, currentMonth, onToggleItem, isHebrew }: MonthTimelineProps) {
  const [openMonths, setOpenMonths] = useState<Set<number>>(new Set([currentMonth]));
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set([currentWeek]));

  const toggleMonth = (m: number) => {
    setOpenMonths(prev => { const n = new Set(prev); n.has(m) ? n.delete(m) : n.add(m); return n; });
  };

  const toggleWeek = (w: number) => {
    setOpenWeeks(prev => { const n = new Set(prev); n.has(w) ? n.delete(w) : n.add(w); return n; });
  };

  if (months.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          {isHebrew ? 'אין תוכנית 90 יום פעילה' : 'No active 90-day plan'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        {isHebrew ? 'ציר הזמן - 90 יום' : '90-Day Timeline'}
      </h3>

      {months.map(month => (
        <Collapsible key={month.monthNumber} open={openMonths.has(month.monthNumber)} onOpenChange={() => toggleMonth(month.monthNumber)}>
          <Card className={cn(month.monthNumber === currentMonth && "border-primary/30")}>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                      month.monthNumber === currentMonth ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {month.monthNumber}
                    </div>
                    <div className="text-start">
                      <p className="font-medium text-sm">{isHebrew ? `חודש ${month.monthNumber}` : `Month ${month.monthNumber}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {month.completedCount}/{month.totalCount} {isHebrew ? 'משימות' : 'tasks'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={month.progress} className="w-16 h-2" />
                    <span className="text-xs font-medium w-8 text-end">{month.progress}%</span>
                    {openMonths.has(month.monthNumber) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 px-4 pb-4 space-y-2">
                {month.weeks.map(week => (
                  <WeekCard
                    key={week.weekNumber}
                    week={week}
                    isCurrent={week.isCurrent}
                    isOpen={openWeeks.has(week.weekNumber)}
                    onToggle={() => toggleWeek(week.weekNumber)}
                    onToggleItem={onToggleItem}
                    isHebrew={isHebrew}
                  />
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
}

function WeekCard({ week, isCurrent, isOpen, onToggle, onToggleItem, isHebrew }: {
  week: WeekData; isCurrent: boolean; isOpen: boolean;
  onToggle: () => void;
  onToggleItem: (itemId: string, isCompleted: boolean) => Promise<boolean>;
  isHebrew: boolean;
}) {
  const locale = isHebrew ? he : enUS;
  const dateRange = `${format(week.startDate, 'd/M', { locale })} - ${format(week.endDate, 'd/M', { locale })}`;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className={cn("transition-all", isCurrent && "ring-2 ring-primary/30 bg-primary/5")}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-3 p-3">
            <div className={cn(
              "shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold",
              week.milestone?.is_completed ? "bg-green-500 text-white" :
              isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {week.milestone?.is_completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : week.weekNumber}
            </div>
            <div className="flex-1 min-w-0 text-start">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {week.milestone?.title || (isHebrew ? `שבוע ${week.weekNumber}` : `Week ${week.weekNumber}`)}
                </p>
                {isCurrent && <Badge variant="default" className="text-[10px] h-4">{isHebrew ? 'עכשיו' : 'Now'}</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{dateRange}</span>
                <span>·</span>
                <span>{week.completedCount}/{week.totalCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Progress value={week.progress} className="w-12 h-1.5" />
              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {week.milestone?.goal && (
              <div className="bg-muted/50 rounded-lg p-2 flex items-start gap-2">
                <Trophy className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{week.milestone.goal}</p>
              </div>
            )}
            {week.days.filter(d => d.totalCount > 0).map(day => (
              <DayTaskList key={day.dateStr} day={day} onToggleItem={onToggleItem} isHebrew={isHebrew} />
            ))}
            {week.totalCount === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {isHebrew ? 'אין משימות לשבוע זה' : 'No tasks this week'}
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
