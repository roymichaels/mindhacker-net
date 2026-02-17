import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as PieChartIcon, Sparkles, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeAnalysis } from '@/hooks/useLifeAnalysis';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function LifeAnalysisChart() {
  const { t, isRTL, language } = useTranslation();
  const { data, isLoading } = useLifeAnalysis();
  const { isLaunchpadComplete } = useLaunchpadProgress();

  if (isLoading) return <Card><CardContent className="p-3"><Skeleton className="h-24 w-full" /></CardContent></Card>;

  const chartData = data?.slices || [];
  const balanceIndex = data?.balanceIndex || 0;
  const hasData = data?.hasData || false;

  return (
    <Card className="bg-gradient-to-br from-muted/30 to-transparent overflow-hidden">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-2 mb-2">
          <PieChartIcon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">{language === 'he' ? 'ניתוח חיים' : 'Life Analysis'}</span>
          {hasData && (
            <span className="text-[10px] text-muted-foreground ms-auto flex items-center gap-0.5">
              <Sparkles className="h-2.5 w-2.5 text-primary" />{balanceIndex}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative h-[100px] w-[100px] sm:h-[110px] sm:w-[110px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey={language === 'he' ? 'nameHe' : 'name'} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={2} animationDuration={600}>
                  {chartData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={1.5} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '10px', direction: isRTL ? 'rtl' : 'ltr' }} formatter={(value: number, name: string) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-foreground">{balanceIndex}</span>
              <span className="text-[8px] text-muted-foreground">{language === 'he' ? 'איזון' : 'Balance'}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-0.5" dir={isRTL ? 'rtl' : 'ltr'}>
            {chartData.map((slice) => (
              <div key={slice.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-[10px] text-muted-foreground truncate">{language === 'he' ? slice.nameHe : slice.name}</span>
                <span className="text-[10px] font-medium">{slice.value}%</span>
              </div>
            ))}
          </div>
        </div>
        {!hasData && (
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" />
              {!isLaunchpadComplete ? (language === 'he' ? 'השלם את המסע לפתיחת תובנות' : 'Complete journey to unlock') : (language === 'he' ? 'המשך להשתמש לבניית פרופיל' : 'Keep using to build profile')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
