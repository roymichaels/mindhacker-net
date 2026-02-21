/**
 * PlanMilestonesSection — Shows today's daily actions from the Now Engine.
 * Displayed on LifeHub and ArenaHub when user has an active plan.
 */
import { useNowEngine } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, Circle, Clock, Target, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface PlanMilestonesSectionProps {
  hub: 'core' | 'arena';
}

export function PlanMilestonesSection({ hub }: PlanMilestonesSectionProps) {
  const { queue, isLoading: queueLoading } = useNowEngine();
  const { plan, milestones, currentWeek, isLoading: planLoading, hasLifePlan } = useLifePlanWithMilestones();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  const isLoading = queueLoading || planLoading;

  if (isLoading || !hasLifePlan) return null;

  // Filter queue items by hub
  const hubQueue = queue.filter(item => item.hub === hub);
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const accentColor = hub === 'core' ? 'rose' : 'amber';

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className={cn("w-4 h-4", hub === 'core' ? 'text-rose-400' : 'text-amber-400')} />
          {isHe ? 'פעולות היום' : "Today's Actions"}
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          {isHe ? `שבוע ${currentWeek} · ${hubQueue.length} פעולות` : `Week ${currentWeek} · ${hubQueue.length} actions`}
        </Badge>
      </div>

      {/* Daily Actions Card */}
      <div className={cn(
        "rounded-2xl border p-4 space-y-3",
        hub === 'core'
          ? 'border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent'
          : 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent'
      )}>
        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isHe ? 'התקדמות תוכנית' : 'Plan Progress'}</span>
          <span className="font-bold text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />

        {/* Today's Queue */}
        {hubQueue.length > 0 ? (
          <div className="space-y-2">
            {hubQueue.map((item, i) => (
              <motion.div
                key={`${item.pillarId}-${i}`}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all",
                  i === 0
                    ? hub === 'core'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-amber-500/30 bg-amber-500/5'
                    : 'border-border/30 bg-card/30'
                )}
              >
                <div className={cn(
                  "mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === 0
                    ? hub === 'core' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground break-words leading-snug">
                    {isHe ? item.title : item.titleEn}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.durationMin}{isHe ? ' דק׳' : ' min'}
                    </span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {item.pillarId}
                    </Badge>
                  </div>
                </div>
                {i === 0 && (
                  <Play className={cn(
                    "w-4 h-4 shrink-0 mt-0.5",
                    hub === 'core' ? 'text-rose-400' : 'text-amber-400'
                  )} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {isHe ? 'אין פעולות להיום בתחום הזה' : 'No actions for today in this domain'}
          </div>
        )}
      </div>
    </div>
  );
}
