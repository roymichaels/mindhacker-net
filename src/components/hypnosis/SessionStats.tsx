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
    { icon: Target, value: sessionStats?.totalSessions || 0, label: language === 'he' ? 'סשנים' : 'Sessions', color: 'text-blue-500' },
    { icon: Clock, value: sessionStats?.totalDurationSeconds ? Math.floor(sessionStats.totalDurationSeconds / 60) : 0, label: language === 'he' ? 'דקות' : 'Min', color: 'text-green-500' },
    { icon: Zap, value: gameState?.experience || 0, label: 'XP', color: 'text-amber-500' },
    { icon: TrendingUp, value: gameState?.level || 1, label: language === 'he' ? 'רמה' : 'Lvl', color: 'text-purple-500' },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-1.5", className)}>
      {stats.map((stat) => (
        <Card key={stat.label} className="p-1.5 text-center">
          <stat.icon className={cn("w-3 h-3 mx-auto", stat.color)} />
          <p className="text-sm font-bold tabular-nums">{stat.value.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
