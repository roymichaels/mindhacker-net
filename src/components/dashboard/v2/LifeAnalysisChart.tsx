import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.slices || [];
  const balanceIndex = data?.balanceIndex || 0;
  const hasData = data?.hasData || false;

  return (
    <Card className="bg-gradient-to-br from-muted/30 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            {language === 'he' ? 'ניתוח חיים' : 'Life Analysis'}
          </CardTitle>
          {hasData && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>{language === 'he' ? 'מאוזן' : 'Balance'}: {balanceIndex}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Pie Chart */}
          <div className="relative h-[150px] w-[150px] sm:h-[180px] sm:w-[180px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey={language === 'he' ? 'nameHe' : 'name'}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                    direction: isRTL ? 'rtl' : 'ltr',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-foreground">{balanceIndex}</span>
              <span className="text-[10px] text-muted-foreground">
                {language === 'he' ? 'איזון' : 'Balance'}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div 
            className="flex-1 grid grid-cols-2 gap-x-3 gap-y-1.5 w-full"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {chartData.map((slice, index) => (
              <motion.div
                key={slice.id}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-1.5"
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-xs text-muted-foreground truncate">
                  {language === 'he' ? slice.nameHe : slice.name}
                </span>
                <span className="text-xs font-medium text-foreground ms-auto">
                  {slice.value}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State Message - differentiate between no journey and no data */}
        {!hasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              {!isLaunchpadComplete
                ? (language === 'he' 
                    ? 'השלם את מסע התודעה כדי לפתוח תובנות' 
                    : 'Complete the consciousness journey to unlock insights')
                : (language === 'he' 
                    ? 'המשך להשתמש באפליקציה כדי לבנות את הפרופיל שלך' 
                    : 'Continue using the app to build your profile')
              }
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
