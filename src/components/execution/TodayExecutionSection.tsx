/**
 * TodayExecutionSection — Replaces PlanMilestonesSection in hubs.
 * Shows: Next Action hero + schedule timeline + movement score
 * Filtered by hub (core/arena) or shows all.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Sparkles, Play, Zap, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution, ScheduleSlot } from '@/hooks/useTodayExecution';
import { NowQueueItem } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { TodayScheduleCard } from './TodayScheduleCard';
import { MovementScoreCard } from './MovementScoreCard';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getDomainById } from '@/navigation/lifeDomains';

interface TodayExecutionSectionProps {
  hub?: 'core' | 'arena'; // Filter by hub, or undefined for all
}

export function TodayExecutionSection({ hub }: TodayExecutionSectionProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const {
    queue, nextAction, schedule, tier,
    movementScore, bodyCovered, mindCovered, arenaCovered,
    actionsCompleted, actionsTotal,
    isMinDayMode, fallbackPlan, hoursRemaining,
    isLoading, refetch,
  } = useTodayExecution();
  const { currentWeek, milestones, currentMilestone, hasLifePlan } = useLifePlanWithMilestones();

  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const handleExecute = (action: NowQueueItem) => {
    setExecutionAction(action);
    setExecutionOpen(true);
  };

  if (isLoading || !hasLifePlan) return null;

  // Filter queue/schedule by hub if specified
  const filteredQueue = hub ? queue.filter(q => q.hub === hub) : queue;
  const filteredSchedule: ScheduleSlot[] = hub
    ? schedule.map(s => ({ ...s, actions: s.actions.filter(a => a.hub === hub) })).filter(s => s.actions.length > 0)
    : schedule;
  const filteredNextAction = hub ? filteredQueue[0] || null : nextAction;

  // 90-day progress
  const completedMilestones = milestones.filter(m => m.is_completed).length;
  const totalMilestones = milestones.length;
  const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── 90-Day Progress Mini ── */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-foreground">
            <Target className="w-3.5 h-3.5 text-primary" />
            {isHe ? 'תוכנית 90 יום' : '90-Day Plan'}
          </span>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <Sparkles className="w-3 h-3" />
            {isHe ? `שבוע ${currentWeek}/12` : `Week ${currentWeek}/12`}
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
        {currentMilestone && (
          <p className="text-[11px] text-muted-foreground truncate">
            📍 {(currentMilestone as any).title}
          </p>
        )}
      </div>

      {/* ── Min Day Warning ── */}
      {isMinDayMode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="text-amber-200">
            {isHe
              ? `נותרו ${hoursRemaining} שעות — מצב יום מינימלי פעיל (${fallbackPlan.length} פעולות מפתח)`
              : `${hoursRemaining}h remaining — Minimum Viable Day active (${fallbackPlan.length} key actions)`}
          </span>
        </motion.div>
      )}

      {/* ── Next Action Hero Card ── */}
      {filteredNextAction && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 cursor-pointer group"
          onClick={() => handleExecute(filteredNextAction)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-1 mb-2">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {isHe ? 'הפעולה הבאה' : 'Next Action'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {(() => {
                  const domain = getDomainById(filteredNextAction.pillarId);
                  const Icon = domain?.icon;
                  return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 text-muted-foreground mb-1">
                      {Icon && <Icon className="h-3 w-3" />}
                      {domain ? (isHe ? domain.labelHe : domain.labelEn) : filteredNextAction.pillarId}
                    </span>
                  );
                })()}
                <h3 className="text-base font-bold mt-1 break-words">
                  {isHe ? filteredNextAction.title : filteredNextAction.titleEn}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {filteredNextAction.durationMin} {isHe ? 'דקות' : 'min'}
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                className="flex-shrink-0 gap-1.5"
                onClick={(e) => { e.stopPropagation(); handleExecute(filteredNextAction); }}
              >
                <Play className="h-3.5 w-3.5" />
                {isHe ? 'התחל' : 'Start'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Schedule Timeline ── */}
      <TodayScheduleCard schedule={filteredSchedule} onActionClick={handleExecute} />

      {/* ── Movement Score ── */}
      <MovementScoreCard
        score={movementScore}
        bodyCovered={bodyCovered}
        mindCovered={mindCovered}
        arenaCovered={arenaCovered}
        actionsCompleted={actionsCompleted}
        actionsTotal={actionsTotal}
        isMinDayMode={isMinDayMode}
      />

      {/* Execution Modal */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
