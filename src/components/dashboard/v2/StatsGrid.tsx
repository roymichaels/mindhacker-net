import { TrendingUp, TrendingDown, Flame, Trophy, Sparkles, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useGameState, useXpProgress } from '@/hooks/useGameState';
import { useWeeklyXP } from '@/hooks/useWeeklyActivity';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function StatsGrid() {
  const { t, isRTL } = useTranslation();
  const { gameState } = useGameState();
  const xpProgress = useXpProgress();
  const { data: weeklyXP } = useWeeklyXP();

  const stats = [
    {
      id: 'level',
      label: t('stats.level'),
      value: gameState?.level ?? 1,
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      progress: xpProgress.percentage,
      showProgress: true,
    },
    {
      id: 'streak',
      label: t('stats.streak'),
      value: gameState?.sessionStreak ?? 0,
      suffix: t('common.days'),
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      animate: (gameState?.sessionStreak ?? 0) > 0,
    },
    {
      id: 'weeklyXp',
      label: t('stats.weeklyXp'),
      value: weeklyXP?.current ?? 0,
      prefix: '+',
      icon: weeklyXP && weeklyXP.change >= 0 ? TrendingUp : TrendingDown,
      color: weeklyXP && weeklyXP.change >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: weeklyXP && weeklyXP.change >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      trend: weeklyXP?.change ?? 0,
    },
    {
      id: 'tokens',
      label: t('stats.tokens'),
      value: gameState?.tokens ?? 0,
      icon: Coins,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
              {/* Decorative glow */}
              <div className={cn(
                "absolute top-0 end-0 w-16 h-16 rounded-full blur-2xl opacity-30",
                stat.bgColor
              )} />
              
              <CardContent className="p-4 relative">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    stat.bgColor
                  )}>
                    <Icon className={cn("h-4 w-4", stat.color, stat.animate && "animate-pulse")} />
                  </div>
                  
                  {stat.trend !== undefined && stat.trend !== 0 && (
                    <span className={cn(
                      "text-xs font-medium",
                      stat.trend >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {stat.trend > 0 ? '+' : ''}{stat.trend}%
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.prefix}{stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.label}
                    {stat.suffix && <span className="ms-1">{stat.suffix}</span>}
                  </p>
                </div>
                
                {stat.showProgress && (
                  <div className="mt-3 space-y-1">
                    <Progress value={stat.progress} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground text-end">
                      {xpProgress.current}/{xpProgress.required} XP
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
