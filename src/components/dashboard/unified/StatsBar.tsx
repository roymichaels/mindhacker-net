import { Flame, Coins, Target, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface StatsBarProps {
  streak: number;
  tokens: number;
  sessions: number;
  level: number;
  className?: string;
}

export function StatsBar({ streak, tokens, sessions, level, className }: StatsBarProps) {
  const { t, isRTL } = useTranslation();

  const stats = [
    {
      icon: Flame,
      value: streak,
      label: t('unified.statsBar.streak'),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: Coins,
      value: tokens,
      label: t('unified.statsBar.tokens'),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: Target,
      value: sessions,
      label: t('unified.statsBar.sessions'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Trophy,
      value: `Lv.${level}`,
      label: t('unified.statsBar.level'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <div 
      className={cn(
        "grid grid-cols-4 gap-1.5 p-2 rounded-lg bg-card border",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={cn(
            "flex flex-col items-center justify-center p-1.5 rounded-md",
            stat.bgColor
          )}
        >
          <stat.icon className={cn("h-3.5 w-3.5 mb-0.5", stat.color)} />
          <span className="font-bold text-xs">{stat.value}</span>
          <span className="text-[9px] text-muted-foreground truncate max-w-full">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
