/**
 * MovementScoreCard — Daily movement score + body/mind/arena coverage.
 * Uses translation keys only. RTL-aware.
 */
import { motion } from 'framer-motion';
import { Activity, Brain, Dumbbell, Briefcase, Flame, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useStreak } from '@/hooks/useGameState';

interface MovementScoreCardProps {
  score: number;
  bodyCovered: boolean;
  mindCovered: boolean;
  arenaCovered: boolean;
  actionsCompleted: number;
  actionsTotal: number;
  isMinDayMode?: boolean;
}

export function MovementScoreCard({
  score,
  bodyCovered,
  mindCovered,
  arenaCovered,
  actionsCompleted,
  actionsTotal,
  isMinDayMode,
}: MovementScoreCardProps) {
  const { t, isRTL } = useTranslation();
  const streak = useStreak();

  const coverageItems = [
    { icon: Dumbbell, labelKey: 'today.body', covered: bodyCovered, color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: Brain, labelKey: 'today.mind', covered: mindCovered, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Briefcase, labelKey: 'today.arena', covered: arenaCovered, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-red-400';
  const scoreGradient = score >= 70 ? 'from-emerald-500' : score >= 40 ? 'from-amber-500' : 'from-red-500';
  const statusKey = score >= 70 ? 'today.excellent' : score >= 40 ? 'today.onTrack' : 'today.startMoving';

  return (
    <div className="rounded-2xl border border-border/30 bg-card/40 p-4 space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">{t('today.movementScore')}</h3>
          {isMinDayMode && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {t('today.minDayMode')}
            </span>
          )}
        </div>
        {streak.streak > 0 && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            {streak.streak}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="shrink-0">
          <span className={cn('text-3xl font-black tabular-nums', scoreColor)}>{score}</span>
          <span className="text-sm text-muted-foreground/60">/100</span>
        </motion.div>

        <div className="flex-1 space-y-1.5">
          <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full bg-gradient-to-r to-primary/50', scoreGradient)}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{actionsCompleted}/{actionsTotal} {t('today.completed')}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              {t(statusKey)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {coverageItems.map(item => (
          <div
            key={item.labelKey}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl border transition-all',
              item.covered ? `${item.bg} border-current/20` : 'bg-muted/10 border-border/20 opacity-40',
            )}
          >
            <item.icon className={cn('w-4 h-4', item.covered ? item.color : 'text-muted-foreground/40')} />
            <span className={cn('text-[10px] font-semibold', item.covered ? item.color : 'text-muted-foreground/40')}>
              {item.covered ? '✓' : '–'} {t(item.labelKey)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
