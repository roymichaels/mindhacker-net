import React from 'react';
import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/useGameState';
import { Flame, Check } from 'lucide-react';

interface StreakCounterProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakCounter({ className, showLabel = true, size = 'md' }: StreakCounterProps) {
  const { streak, isActiveToday } = useStreak();

  const sizeClasses = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <div className={cn('flex items-center', sizeClasses[size], className)}>
      <div className={cn(
        'relative',
        streak > 0 && 'animate-pulse'
      )}>
        <Flame 
          size={iconSizes[size]} 
          className={cn(
            'transition-colors',
            streak > 0 ? 'text-orange-500 fill-orange-500/30' : 'text-muted-foreground'
          )} 
        />
        {isActiveToday && (
          <Check 
            size={iconSizes[size] * 0.6} 
            className="absolute -bottom-0.5 -right-0.5 text-green-500" 
          />
        )}
      </div>
      <span className={cn(
        'font-bold tabular-nums',
        streak > 0 ? 'text-orange-500' : 'text-muted-foreground'
      )}>
        {streak}
      </span>
      {showLabel && (
        <span className="text-muted-foreground">
          {streak === 1 ? 'day' : 'days'}
        </span>
      )}
    </div>
  );
}
