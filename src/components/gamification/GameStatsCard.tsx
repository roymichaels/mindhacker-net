import React from 'react';
import { cn } from '@/lib/utils';
import { useGameState, useXpProgress, useStreak, useTokens } from '@/hooks/useGameState';
import { LevelProgress } from './LevelProgress';
import { StreakCounter } from './StreakCounter';
import { TokenBalance } from './TokenBalance';
import { getEgoState } from '@/lib/egoStates';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp, Clock, Target } from 'lucide-react';

interface GameStatsCardProps {
  className?: string;
  compact?: boolean;
}

export function GameStatsCard({ className, compact = false }: GameStatsCardProps) {
  const { gameState, sessionStats, loading } = useGameState();
  const { t } = useTranslation();

  if (loading || !gameState) {
    return (
      <div className={cn('glass-card p-4 animate-pulse', className)}>
        <div className="h-20 bg-muted rounded" />
      </div>
    );
  }

  const activeEgo = getEgoState(gameState.activeEgoState);
  const totalMinutes = Math.floor((sessionStats?.totalDurationSeconds || 0) / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-4 p-3 glass-card rounded-xl', className)}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{activeEgo.icon}</span>
          <span className="font-medium">Lv.{gameState.level}</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <StreakCounter size="sm" showLabel={false} />
        <div className="h-4 w-px bg-border" />
        <TokenBalance size="sm" />
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-4 space-y-4', className)}>
      {/* Header with Level and Ego State */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${activeEgo.colors.primary}, ${activeEgo.colors.secondary})` 
            }}
          >
            {activeEgo.icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t('gamification.activeEgoState')}
            </p>
            <p className="font-bold">
              {activeEgo.name}
            </p>
          </div>
        </div>
        <div className="text-end">
          <TokenBalance size="lg" />
        </div>
      </div>

      {/* Level Progress */}
      <LevelProgress size="md" />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <StreakCounter size="sm" showLabel={false} className="justify-center" />
          <p className="text-xs text-muted-foreground mt-1">
            {t('gamification.streak')}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1">
            <Target size={16} className="text-primary" />
            <span className="font-bold">{sessionStats?.totalSessions || 0}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('gamification.sessions')}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1">
            <Clock size={16} className="text-accent" />
            <span className="font-bold">
              {totalHours > 0 ? `${totalHours}h ${remainingMinutes}m` : `${totalMinutes}m`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('gamification.totalTime')}
          </p>
        </div>
      </div>
    </div>
  );
}
