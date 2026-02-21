/**
 * PlanMilestonesSection — Shows today's daily actions from the Now Engine.
 * Displayed on LifeHub and ArenaHub. Shows ALL actions (unified plan).
 */
import { useNowEngine } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Zap, Clock, Target, Play, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlanMilestonesSectionProps {
  hub: 'core' | 'arena';
}

export function PlanMilestonesSection({ hub }: PlanMilestonesSectionProps) {
  const { queue, isLoading: queueLoading } = useNowEngine();
  const { plan, milestones, currentWeek, isLoading: planLoading, hasLifePlan } = useLifePlanWithMilestones();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const isLoading = queueLoading || planLoading;

  if (isLoading || !hasLifePlan) return null;

  // Show ALL queue items (plan is unified across domains)
  const todayQueue = queue.slice(0, 6);
  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Show on both hubs — the plan is unified across all pillars
  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          {isHe ? 'פעולות היום' : "Today's Actions"}
        </h3>
        <Badge variant="secondary" className="text-[10px] gap-1">
          <Sparkles className="w-3 h-3" />
          {isHe ? `שבוע ${currentWeek}/12` : `Week ${currentWeek}/12`}
        </Badge>
      </div>

      {/* Daily Actions Card */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 space-y-3">
        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isHe ? 'התקדמות תוכנית 90 יום' : '90-Day Plan Progress'}</span>
          <span className="font-bold text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />

        {/* Today's Queue */}
        {todayQueue.length > 0 ? (
          <div className="space-y-2">
            {todayQueue.map((item, i) => (
              <motion.div
                key={`${item.pillarId}-${i}`}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all",
                  i === 0
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/30 bg-card/30'
                )}
              >
                <div className={cn(
                  "mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
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
                      {item.sourceType === 'habit' ? (isHe ? 'הרגל' : 'Habit') :
                       item.sourceType === 'plan' ? (isHe ? 'תוכנית' : 'Plan') :
                       item.actionType}
                    </Badge>
                  </div>
                </div>
                {i === 0 && (
                  <Play className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            {isHe ? 'אין פעולות להיום' : 'No actions for today'}
          </div>
        )}
      </div>
    </div>
  );
}
