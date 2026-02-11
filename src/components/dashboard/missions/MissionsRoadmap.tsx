import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, Circle, Calendar, Sparkles, Trophy, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMissionsRoadmap } from '@/hooks/useMissionsRoadmap';
import { TodayFocus } from './TodayFocus';
import { WeekCalendarStrip } from './WeekCalendarStrip';
import { MonthTimeline } from './MonthTimeline';

export function MissionsRoadmap() {
  const { language, isRTL } = useTranslation();
  const { calendarData, loading, stats, toggleItem, currentWeek, currentMonth, roadmap } = useMissionsRoadmap();
  const isHebrew = language === 'he';

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Global Progress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-primary" />
              {isHebrew ? 'מפת המשימות' : 'Missions Roadmap'}
            </CardTitle>
            {roadmap.currentMilestone && (
              <Badge variant="outline" className="gap-1">
                <Trophy className="h-3 w-3" />
                {isHebrew ? `שבוע ${currentWeek}` : `Week ${currentWeek}`}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-2">
            <Progress value={stats.progress} className="flex-1" />
            <span className="text-sm font-medium">{stats.progress}%</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              {stats.completed} {isHebrew ? 'הושלמו' : 'completed'}
            </span>
            <span className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              {stats.remaining} {isHebrew ? 'נותרו' : 'remaining'}
            </span>
            {stats.todayTotal > 0 && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-500" />
                {stats.todayRemaining} {isHebrew ? 'להיום' : 'today'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Milestone */}
      {roadmap.currentMilestone && (
        <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/30">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{roadmap.currentMilestone.title}</p>
                <p className="text-xs text-muted-foreground truncate">{roadmap.currentMilestone.goal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Focus */}
      <TodayFocus
        today={calendarData.today}
        overdueTasks={calendarData.overdueTasks}
        onToggleItem={toggleItem}
        isHebrew={isHebrew}
      />

      {/* Week Calendar Strip */}
      <WeekCalendarStrip
        days={calendarData.currentWeekDays}
        onToggleItem={toggleItem}
        isHebrew={isHebrew}
      />

      {/* 90-Day Timeline */}
      <MonthTimeline
        months={calendarData.months}
        currentWeek={currentWeek}
        currentMonth={currentMonth}
        onToggleItem={toggleItem}
        isHebrew={isHebrew}
      />
    </div>
  );
}
