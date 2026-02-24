/**
 * TodayExecutionSection — Primary execution surface for Dashboard + Hubs.
 * Shows: Strategy CTA (if none) → Next Action hero → Today Blocks → Movement Score
 * 
 * NO "Week X" text. NO milestone-first UI.
 * Filtered by hub (core/arena) or shows all (dashboard).
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Play, AlertTriangle, Loader2, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { NowQueueItem } from '@/hooks/useNowEngine';
import { TodayScheduleCard } from './TodayScheduleCard';
import { MovementScoreCard } from './MovementScoreCard';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { DomainAssessModal } from '@/components/domain-assess/DomainAssessModal';
import { Button } from '@/components/ui/button';
import { getDomainById } from '@/navigation/lifeDomains';

interface TodayExecutionSectionProps {
  hub?: 'core' | 'arena';
}

export function TodayExecutionSection({ hub }: TodayExecutionSectionProps) {
  const { t, isRTL, language } = useTranslation();
  const {
    queue, nextAction, schedule, tier,
    movementScore, bodyCovered, mindCovered, arenaCovered,
    actionsCompleted, actionsTotal,
    isMinDayMode, fallbackPlan, hoursRemaining,
    isLoading,
    refetch,
  } = useTodayExecution();

  const {
    hasAnyStrategy, corePlan, arenaPlan,
    coreStrategy, arenaStrategy,
    coreWeek, arenaWeek,
    generateStrategy, isGenerating,
  } = useStrategyPlans();

  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [assessDomainId, setAssessDomainId] = useState<string | null>(null);

  const handleExecute = (action: NowQueueItem) => {
    setExecutionAction(action);
    setExecutionOpen(true);
  };

  const handleGenerateStrategy = () => {
    generateStrategy.mutate({ hub: 'both', forceRegenerate: false }, {
      onError: (err: any) => {
        if (err?.message === 'MISSING_ASSESSMENT_DATA' || err?.code === 'MISSING_ASSESSMENT_DATA') {
          const firstMissing = err.missingPillars?.[0]?.pillarId || err.missingPillars?.[0]?.pillar || 'consciousness';
          setAssessDomainId(firstMissing);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">{t('today.computingDay')}</span>
      </div>
    );
  }

  // Show strategy generation CTA if no strategy exists for this hub
  const needsStrategy = hub
    ? (hub === 'core' ? !corePlan : !arenaPlan)
    : !hasAnyStrategy;

  // Filter by hub
  const filteredQueue = hub ? queue.filter(q => q.hub === hub) : queue;
  const filteredSchedule = hub
    ? schedule.map(s => ({ ...s, actions: s.actions.filter(a => a.hub === hub) })).filter(s => s.actions.length > 0)
    : schedule;
  const filteredNextAction = hub ? filteredQueue[0] || null : nextAction;

  // Current strategy context
  const currentStrategy = hub === 'core' ? coreStrategy : hub === 'arena' ? arenaStrategy : null;
  const currentWeek = hub === 'core' ? coreWeek : hub === 'arena' ? arenaWeek : null;
  const currentWeekData = currentStrategy?.weeks?.find(w => w.week === currentWeek);

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Strategy Generation CTA */}
      {needsStrategy && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              {isRTL ? 'צור תוכנית 100 יום' : 'Generate 100-Day Strategy'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {isRTL
              ? 'בהתבסס על האבחונים שלך, אורורה תבנה תוכנית אסטרטגית ב-10 שלבים ל-100 הימים הקרובים.'
              : 'Based on your assessments, Aurora will build a 10-phase strategic plan for the next 100 days.'}
          </p>
          <Button
            size="sm"
            onClick={handleGenerateStrategy}
            disabled={isGenerating}
            className="gap-1.5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isRTL ? 'מייצר...' : 'Generating...'}
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                {isRTL ? 'צור אסטרטגיה' : 'Generate Strategy'}
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Weekly Theme Banner (if strategy exists) */}
      {currentWeekData && currentWeek && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/30 text-xs"
        >
          <Target className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground font-medium truncate">
            {isRTL ? currentWeekData.theme_he : currentWeekData.theme_en}
          </span>
        </motion.div>
      )}

      {/* Min Day Warning */}
      {isMinDayMode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-amber-200">
            {hoursRemaining} {t('today.hoursLeft')} — {t('today.minDayWarning')} ({fallbackPlan.length} {t('today.keyActions')})
          </span>
        </motion.div>
      )}

      {/* Next Action Hero */}
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
                {t('today.nextAction')}
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
                      {domain ? (isRTL ? domain.labelHe : domain.labelEn) : filteredNextAction.pillarId}
                    </span>
                  );
                })()}
                <h3 className="text-base font-bold mt-1 break-words">
                  {isRTL ? filteredNextAction.title : filteredNextAction.titleEn}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  {filteredNextAction.durationMin} {t('today.minutesShort')}
                </span>
              </div>
              <Button
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={(e) => { e.stopPropagation(); handleExecute(filteredNextAction); }}
              >
                <Play className="h-3.5 w-3.5" />
                {t('today.startNow')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Schedule — grouped by pillar */}
      {filteredQueue.length > 0 && (
        <TodayScheduleCard schedule={filteredSchedule} queue={filteredQueue} onActionClick={handleExecute} />
      )}

      {/* Movement Score */}
      {filteredQueue.length > 0 && (
        <MovementScoreCard
          score={movementScore}
          bodyCovered={bodyCovered}
          mindCovered={mindCovered}
          arenaCovered={arenaCovered}
          actionsCompleted={actionsCompleted}
          actionsTotal={actionsTotal}
          isMinDayMode={isMinDayMode}
        />
      )}

      {/* Execution Modal */}
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />

      {/* Assessment popup for missing pillars */}
      {assessDomainId && (
        <DomainAssessModal
          open={!!assessDomainId}
          onOpenChange={(open) => { if (!open) setAssessDomainId(null); }}
          domainId={assessDomainId}
        />
      )}
    </div>
  );
}
