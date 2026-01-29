import React from 'react';
import { cn } from '@/lib/utils';
import type { Achievement } from '@/lib/achievements';

interface AchievementToastProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementToast({ achievement, className }: AchievementToastProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl glass-card-premium',
      className
    )}>
      <div className="text-3xl">{achievement.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground truncate">
          {achievement.name}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {achievement.description}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs">
          {achievement.xp && (
            <span className="text-primary">+{achievement.xp} XP</span>
          )}
          {achievement.tokens && (
            <span className="text-amber-500">+{achievement.tokens} Tokens</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Static toast content for sonner
export function createAchievementToastContent(achievement: Achievement) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-2xl">{achievement.icon}</div>
      <div>
        <p className="font-bold">{achievement.name}</p>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
      </div>
    </div>
  );
}
