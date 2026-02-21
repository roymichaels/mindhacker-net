/**
 * PlanMilestonesSection — Shows 90-day plan milestones relevant to a hub (Core or Arena).
 * Displayed on LifeHub and ArenaHub when user has an active plan.
 */
import { useLifePlanWithMilestones, useCompleteMilestone } from '@/hooks/useLifePlan';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MapPin, CheckCircle2, Circle, ChevronRight, ChevronLeft, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PlanMilestonesSectionProps {
  hub: 'core' | 'arena';
}

export function PlanMilestonesSection({ hub }: PlanMilestonesSectionProps) {
  const { plan, milestones, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const completeMilestone = useCompleteMilestone();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading || !hasLifePlan || milestones.length === 0) return null;

  // Show milestones around current week (current + next 2)
  const relevantMilestones = milestones
    .filter(m => m.week_number >= currentWeek - 1)
    .slice(0, 4);

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const currentMilestone = milestones.find(m => m.week_number === currentWeek);

  const handleComplete = (milestoneId: string) => {
    if (!plan?.id) return;
    completeMilestone.mutate({ milestoneId, planId: plan.id });
  };

  const accentColor = hub === 'core' ? 'rose' : 'amber';

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Target className={cn("w-4 h-4", hub === 'core' ? 'text-rose-400' : 'text-amber-400')} />
          {isHe ? 'תוכנית 90 יום' : '90-Day Plan'}
        </h3>
        <Badge variant="secondary" className="text-[10px]">
          {isHe ? `שבוע ${currentWeek}` : `Week ${currentWeek}`}
        </Badge>
      </div>

      {/* Progress */}
      <div className={cn(
        "rounded-2xl border p-4 space-y-3",
        hub === 'core'
          ? 'border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent'
          : 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent'
      )}>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{isHe ? 'התקדמות כוללת' : 'Overall Progress'}</span>
          <span className="font-bold text-foreground">{completedCount}/{totalCount}</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />

        {/* Current Week Highlight */}
        {currentMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "rounded-xl border p-3 space-y-1.5",
              hub === 'core'
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-amber-500/30 bg-amber-500/5'
            )}
          >
            <div className="flex items-start gap-2">
              <MapPin className={cn("w-4 h-4 mt-0.5 shrink-0", hub === 'core' ? 'text-rose-400' : 'text-amber-400')} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground mb-0.5">
                  {isHe ? `שבוע ${currentMilestone.week_number} — עכשיו` : `Week ${currentMilestone.week_number} — Now`}
                </p>
                <p className="text-sm font-semibold text-foreground break-words leading-snug">
                  {currentMilestone.title}
                </p>
                {currentMilestone.focus_area && (
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed break-words">
                    {currentMilestone.focus_area}
                  </p>
                )}
              </div>
            </div>
            {!currentMilestone.is_completed && (
              <button
                onClick={() => handleComplete(currentMilestone.id)}
                disabled={completeMilestone.isPending}
                className={cn(
                  "w-full text-xs font-semibold py-2 rounded-lg transition-all",
                  hub === 'core'
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400'
                )}
              >
                {isHe ? '✓ סמן כהושלם' : '✓ Mark Complete'}
              </button>
            )}
          </motion.div>
        )}

        {/* Upcoming milestones */}
        <div className="space-y-1">
          {relevantMilestones
            .filter(m => m.id !== currentMilestone?.id)
            .slice(0, 3)
            .map((ms) => (
              <div key={ms.id} className="flex items-center gap-2.5 py-1.5 px-1">
                {ms.is_completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                )}
                <span className={cn(
                  "text-xs flex-1 break-words leading-snug",
                  ms.is_completed ? 'text-muted-foreground line-through' : 'text-foreground/80'
                )}>
                  {ms.title}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {isHe ? `ש׳${ms.week_number}` : `W${ms.week_number}`}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
