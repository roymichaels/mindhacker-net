import React from 'react';
import { cn } from '@/lib/utils';
import { useXpProgress } from '@/hooks/useGameState';

interface LevelProgressProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelProgress({ className, showLabel = true, size = 'md' }: LevelProgressProps) {
  const { level, current, required, percentage } = useXpProgress();

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className={cn('flex items-center justify-between', textSizes[size])}>
          <span className="font-medium text-foreground">
            Level {level}
          </span>
          <span className="text-muted-foreground">
            {current}/{required} XP
          </span>
        </div>
      )}
      <div className={cn('glass-progress', sizeClasses[size])}>
        <div
          className="glass-progress-fill"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
