import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useWeeklyActivity } from '@/hooks/useWeeklyActivity';
import { cn } from '@/lib/utils';

export function WeeklyActivityChart() {
  const { t, isRTL, language } = useTranslation();
  const { data: activity, isLoading } = useWeeklyActivity();

  const dayLabelsHe: Record<string, string> = {
    'Sun': 'א׳',
    'Mon': 'ב׳',
    'Tue': 'ג׳',
    'Wed': 'ד׳',
    'Thu': 'ה׳',
    'Fri': 'ו׳',
    'Sat': 'ש׳',
  };

  const chartData = activity?.map(day => ({
    ...day,
    name: language === 'he' ? dayLabelsHe[day.dayLabel] : day.dayLabel,
  })) || [];

  const totalActivity = chartData.reduce((sum, d) => sum + d.total, 0);
  const maxActivity = Math.max(...chartData.map(d => d.total), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-muted/30 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {language === 'he' ? 'פעילות שבועית' : 'Weekly Activity'}
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {totalActivity} {language === 'he' ? 'פעולות' : 'actions'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                width={30}
                domain={[0, maxActivity + 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    hypnosis: language === 'he' ? 'היפנוזה' : 'Hypnosis',
                    habits: language === 'he' ? 'הרגלים' : 'Habits',
                    tasks: language === 'he' ? 'משימות' : 'Tasks',
                  };
                  return [value, labels[name] || name];
                }}
              />
              <Bar 
                dataKey="hypnosis" 
                stackId="a"
                fill="hsl(var(--primary))" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="habits" 
                stackId="a"
                fill="hsl(142 76% 36%)" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="tasks" 
                stackId="a"
                fill="hsl(38 92% 50%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">
              {language === 'he' ? 'היפנוזה' : 'Hypnosis'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(142 76% 36%)' }} />
            <span className="text-xs text-muted-foreground">
              {language === 'he' ? 'הרגלים' : 'Habits'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(38 92% 50%)' }} />
            <span className="text-xs text-muted-foreground">
              {language === 'he' ? 'משימות' : 'Tasks'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
