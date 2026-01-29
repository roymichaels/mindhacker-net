import { motion } from 'framer-motion';
import { Clock, Target, Zap, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useGameState } from '@/contexts/GameStateContext';
import { cn } from '@/lib/utils';

interface SessionStatsProps {
  language: 'he' | 'en';
  className?: string;
}

export function SessionStats({ language, className }: SessionStatsProps) {
  const { sessionStats, gameState } = useGameState();

  const stats = [
    {
      icon: Target,
      value: sessionStats?.totalSessions || 0,
      label: language === 'he' ? 'סשנים' : 'Sessions',
      color: 'text-blue-500',
    },
    {
      icon: Clock,
      value: sessionStats?.totalDurationSeconds 
        ? Math.floor(sessionStats.totalDurationSeconds / 60) 
        : 0,
      label: language === 'he' ? 'דקות' : 'Minutes',
      color: 'text-green-500',
    },
    {
      icon: Zap,
      value: gameState?.experience || 0,
      label: 'XP',
      color: 'text-amber-500',
    },
    {
      icon: TrendingUp,
      value: gameState?.level || 1,
      label: language === 'he' ? 'רמה' : 'Level',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-3 text-center">
            <stat.icon className={cn("w-4 h-4 mx-auto mb-1", stat.color)} />
            <p className="text-lg font-bold tabular-nums">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {stat.label}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
