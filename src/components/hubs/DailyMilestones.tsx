/**
 * DailyMilestones — Shows today's milestone for each pillar from the 100-day plan.
 * Reads from plan_missions + life_plan_milestones tables (not legacy plan_data JSON).
 * Picks one milestone per pillar based on day-of-plan offset.
 * If a pillar hasn't completed its assessment, clicking opens DomainAssessModal first.
 */
import { useMemo, useState } from 'react';
import { useAuroraActions } from '@/contexts/AuroraActionsContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { isAssessmentReady } from '@/utils/assessmentQuality';
import { supabase } from '@/integrations/supabase/client';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { Calendar, Play, Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { useAuroraChatContext } from '@/contexts/AuroraChatContext';
import type { NowQueueItem } from '@/hooks/useNowEngine';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const dotBgMap: Record<string, string> = {
  blue: 'bg-blue-500/15', fuchsia: 'bg-fuchsia-500/15', red: 'bg-red-500/15',
  amber: 'bg-amber-500/15', cyan: 'bg-cyan-500/15', slate: 'bg-slate-500/15',
  indigo: 'bg-indigo-500/15', emerald: 'bg-emerald-500/15', purple: 'bg-purple-500/15',
  sky: 'bg-sky-500/15', rose: 'bg-rose-500/15', violet: 'bg-violet-500/15', teal: 'bg-teal-500/15',
};

const dotBorderMap: Record<string, string> = {
  blue: 'border-blue-500/50', fuchsia: 'border-fuchsia-500/50', red: 'border-red-500/50',
  amber: 'border-amber-500/50', cyan: 'border-cyan-500/50', slate: 'border-slate-500/50',
  indigo: 'border-indigo-500/50', emerald: 'border-emerald-500/50', purple: 'border-purple-500/50',
  sky: 'border-sky-500/50', rose: 'border-rose-500/50', violet: 'border-violet-500/50', teal: 'border-teal-500/50',
};

interface DailyMilestone {
  pillarId: string;
  domain: LifeDomain;
  missionTitle: string;
  milestoneTitle: string;
  milestoneId: string;
  milestoneIndex: number;
  totalMilestones: number;
  isCompleted: boolean;
}

interface DailyMilestonesProps {
  hub?: 'core' | 'arena' | 'both';
  hideHeader?: boolean;
}

function getDayOfPlan(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export function DailyMilestones({ hub = 'both', hideHeader = false }: DailyMilestonesProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { corePlan, arenaPlan, generateStrategy, isGenerating, isHealing } = useStrategyPlans();
  const { statusMap, getDomain: getDomainRow } = useLifeDomains();
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const { startAssessment } = useAuroraChatContext();
  const { openHypnosis } = useAuroraActions();

  // Determine which plan IDs to query
  const planIds = useMemo(() => {
    const ids: string[] = [];
    if ((hub === 'core' || hub === 'both') && corePlan?.id) ids.push(corePlan.id);
    if ((hub === 'arena' || hub === 'both') && arenaPlan?.id) ids.push(arenaPlan.id);
    return ids;
  }, [hub, corePlan?.id, arenaPlan?.id]);

  // Fetch missions from DB
  const { data: missions } = useQuery({
    queryKey: ['daily-missions', planIds],
    queryFn: async () => {
      if (planIds.length === 0) return [];
      const { data, error } = await supabase
        .from('plan_missions')
        .select('id, plan_id, pillar, mission_number, title, title_en')
        .in('plan_id', planIds)
        .order('pillar')
        .order('mission_number');
      if (error) throw error;
      return data || [];
    },
    enabled: planIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch milestones from DB
  const { data: milestones } = useQuery({
    queryKey: ['daily-milestones', planIds],
    queryFn: async () => {
      if (planIds.length === 0) return [];
      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('id, plan_id, mission_id, milestone_number, title, title_en, is_completed, focus_area')
        .in('plan_id', planIds)
        .order('milestone_number')
        .order('mission_id')
        .order('id');
      if (error) throw error;
      return data || [];
    },
    enabled: planIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const allDomains = useMemo(() => {
    const domains: LifeDomain[] = [];
    if (hub === 'core' || hub === 'both') domains.push(...CORE_DOMAINS);
    if (hub === 'arena' || hub === 'both') domains.push(...ARENA_DOMAINS);
    return domains;
  }, [hub]);

  const dailyMilestones = useMemo(() => {
    const results: DailyMilestone[] = [];
    if (!missions?.length || !milestones?.length) return results;

    // Determine plan start dates
    const planStartMap: Record<string, string> = {};
    if (corePlan?.id && corePlan.start_date) planStartMap[corePlan.id] = corePlan.start_date;
    if (arenaPlan?.id && arenaPlan.start_date) planStartMap[arenaPlan.id] = arenaPlan.start_date;

    for (const domain of allDomains) {
      // Get all milestones for this pillar across its missions
      const pillarMissions = missions.filter(m => m.pillar === domain.id);
      if (pillarMissions.length === 0) continue;

      const pillarMilestones = milestones.filter(ms => 
        pillarMissions.some(m => m.id === ms.mission_id)
      );
      if (pillarMilestones.length === 0) continue;

      // Get the plan for this domain
      const planId = pillarMissions[0].plan_id;
      const startDate = planStartMap[planId];
      if (!startDate) continue;

      const dayOfPlan = getDayOfPlan(startDate);
      
      // Find first incomplete milestone, or cycle through all
      const incomplete = pillarMilestones.filter(ms => !ms.is_completed);
      const target = incomplete.length > 0 
        ? incomplete[dayOfPlan % incomplete.length]
        : pillarMilestones[dayOfPlan % pillarMilestones.length];

      // Find which mission this milestone belongs to
      const parentMission = pillarMissions.find(m => m.id === target.mission_id);

      results.push({
        pillarId: domain.id,
        domain,
        missionTitle: isHe ? (parentMission?.title || '') : (parentMission?.title_en || parentMission?.title || ''),
        milestoneTitle: isHe ? (target.title || '') : (target.title_en || target.title || ''),
        milestoneId: target.id,
        milestoneIndex: pillarMilestones.indexOf(target) + 1,
        totalMilestones: pillarMilestones.length,
        isCompleted: target.is_completed ?? false,
      });
    }

    // Inject daily hypnosis under Consciousness
    if (hub === 'core' || hub === 'both') {
      const consciousnessDomain = CORE_DOMAINS.find(d => d.id === 'consciousness');
      if (consciousnessDomain) {
        results.unshift({
          pillarId: 'consciousness-hypnosis',
          domain: consciousnessDomain,
          missionTitle: isHe ? 'טרנספורמציה יומית' : 'Daily Transformation',
          milestoneTitle: isHe ? '🧠 היפנוזה יומית — סשן תודעה מותאם אישית' : '🧠 Daily Hypnosis — Personalized Session',
          milestoneId: 'hypnosis',
          milestoneIndex: 1,
          totalMilestones: 1,
          isCompleted: false,
        });
      }
    }

    return results;
  }, [missions, milestones, allDomains, corePlan, arenaPlan, isHe, hub]);

  const handleExecute = (dm: DailyMilestone) => {
    if (dm.pillarId === 'consciousness-hypnosis') {
      openHypnosis();
      return;
    }

    // Check if this pillar has a completed assessment
    const domainRow = getDomainRow(dm.pillarId);
    const hasAssessment = isAssessmentReady(dm.pillarId, domainRow?.domain_config as Record<string, any> | undefined);
    
    if (!hasAssessment) {
      // Open assessment modal instead — pillar needs diagnosis first
      setAssessDomainId(dm.pillarId);
      return;
    }

    const hubType = CORE_DOMAINS.some(d => d.id === dm.pillarId) ? 'core' : 'arena';
    setExecutionAction({
      pillarId: dm.pillarId,
      hub: hubType,
      actionType: dm.pillarId,
      title: dm.milestoneTitle,
      titleEn: dm.milestoneTitle,
      durationMin: 15,
      urgencyScore: 80,
      reason: dm.missionTitle,
      sourceType: 'plan',
    });
    setExecutionOpen(true);
  };

  // Show generate CTA if the requested hub has no plan
  const missingCore = (hub === 'core' || hub === 'both') && !corePlan;
  const missingArena = (hub === 'arena' || hub === 'both') && !arenaPlan;
  const missingHubs = [
    ...(missingCore ? ['core' as const] : []),
    ...(missingArena ? ['arena' as const] : []),
  ];

  if (dailyMilestones.length === 0 && missingHubs.length > 0) {
    // If healing is in progress, show loading state instead of generate CTA
    if (isHealing || isGenerating) {
      return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col items-center gap-3 py-8 px-4 rounded-2xl border border-border/40 bg-card/30">
          <Loader2 className="w-8 h-8 text-primary/60 animate-spin" />
          <p className="text-sm font-medium text-center text-foreground/80">
            {isHe ? 'מסנכרן תוכנית 100 יום...' : 'Syncing 100-day plan...'}
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            {isHe ? 'המערכת מזהה ומשלימה את התוכנית עבורך' : 'The system is detecting and completing your plan'}
          </p>
        </div>
      );
    }

    // Build pillar assessment status for all relevant domains
    const pillarStatuses = allDomains.map(d => {
      const row = getDomainRow(d.id);
      const completed = isAssessmentReady(d.id, row?.domain_config as Record<string, any> | undefined);
      return { domain: d, completed };
    });
    const completedAssessments = pillarStatuses.filter(p => p.completed).length;
    const totalAssessments = pillarStatuses.length;

    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="flex flex-col gap-4 py-4 px-4 rounded-2xl border border-border/40 bg-card/30">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <Rocket className="w-8 h-8 text-primary/60" />
          <p className="text-sm font-medium text-center text-foreground/80">
            {isHe
              ? `טרם יצרת תוכנית 100 יום ל${missingHubs.map(h => h === 'core' ? 'ליבה' : 'זירה').join(' ו')}`
              : `Generate your 100-day plan for ${missingHubs.map(h => h === 'core' ? 'Core' : 'Arena').join(' & ')}`}
          </p>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            {isHe ? 'התוכנית תייצר משימות יומיות מותאמות אישית לכל תחום' : 'The plan will create personalized daily missions for every pillar'}
          </p>
        </div>

        {/* Assessment progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{isHe ? 'אבחונים שהושלמו' : 'Assessments completed'}</span>
            <span className="font-semibold">{completedAssessments}/{totalAssessments}</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Pillar cards grid */}
        <div className="grid grid-cols-2 gap-2">
          {pillarStatuses.map(({ domain: d, completed }) => {
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => {
                  if (!completed) setAssessDomainId(d.id);
                }}
                disabled={completed}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border transition-all text-start",
                  completed
                    ? "border-primary/20 bg-primary/5 opacity-60 cursor-default"
                    : "border-border/50 bg-card/50 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  completed ? 'bg-primary/10' : (dotBgMap[d.color] || 'bg-muted')
                )}>
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Icon className={cn('w-4 h-4', domainColorMap[d.color])} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-medium truncate", completed && "text-muted-foreground")}>
                    {isHe ? d.labelHe : d.labelEn}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {completed
                      ? (isHe ? '✓ הושלם' : '✓ Done')
                      : (isHe ? 'נדרש אבחון' : 'Needs assessment')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate button */}
        <Button
          size="sm"
          className="gap-1.5 w-full"
          disabled={isGenerating}
          onClick={() => {
            const openFirstMissing = (missingPillars?: any[]) => {
              const firstMissing = missingPillars?.[0]?.pillarId || missingPillars?.[0]?.pillar;
              const fallbackPillar = firstMissing || allDomains.find(d => {
                const row = getDomainRow(d.id);
                return !isAssessmentReady(d.id, row?.domain_config as Record<string, any> | undefined);
              })?.id;
              if (fallbackPillar) setAssessDomainId(fallbackPillar);
            };

            generateStrategy.mutate({ hub: 'both', forceRegenerate: false }, {
              onSuccess: (data: any) => {
                if (data?.error === 'MISSING_ASSESSMENT_DATA') {
                  openFirstMissing(data.missing_pillars);
                }
              },
              onError: (err: any) => {
                if (err?.message === 'MISSING_ASSESSMENT_DATA' || err?.code === 'MISSING_ASSESSMENT_DATA') {
                  openFirstMissing(err.missingPillars);
                }
              },
            });
          }}
        >
          {isGenerating ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />{isHe ? 'מייצר...' : 'Generating...'}</>
          ) : (
            <><Rocket className="w-3.5 h-3.5" />{isHe ? 'צור תוכנית 100 יום' : 'Generate 100-Day Plan'}</>
          )}
        </Button>

        {/* Assessment popup */}
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

  if (dailyMilestones.length === 0) return null;

  const title = hub === 'both'
    ? (isHe ? '🔥 המשימות של היום' : '🔥 Today\'s Missions')
    : hub === 'core'
      ? (isHe ? '⚡ משימות ליבה להיום' : '⚡ Core Missions Today')
      : (isHe ? '🎯 משימות זירה להיום' : '🎯 Arena Missions Today');

  const completedCount = dailyMilestones.filter(dm => dm.isCompleted).length;
  const progressPercent = dailyMilestones.length > 0 ? Math.round((completedCount / dailyMilestones.length) * 100) : 0;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-4 shadow-sm">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold">{title}</h3>
          <span className="text-sm font-semibold text-muted-foreground">
            {completedCount}/{dailyMilestones.length}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-5">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Vertical roadmap timeline */}
      <div className="relative">
        {dailyMilestones.map((dm, idx) => {
          const Icon = dm.domain.icon;
          const isLast = idx === dailyMilestones.length - 1;
          const dotBorder = dm.isCompleted
            ? 'bg-primary border-primary'
            : `border-2 ${dotBorderMap[dm.domain.color] || 'border-muted-foreground/40'}`;

          return (
            <motion.div
              key={dm.pillarId}
              initial={{ opacity: 0, x: isRTL ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="relative flex items-start gap-3 group"
            >
              {/* Timeline connector line */}
              {!isLast && (
                <div className={cn(
                  "absolute top-7 w-0.5 h-[calc(100%-12px)]",
                  "ltr:left-[13px] rtl:right-[13px]",
                  dm.isCompleted ? 'bg-primary/40' : 'bg-border/60'
                )} />
              )}

              {/* Milestone dot */}
              <button
                onClick={() => handleExecute(dm)}
                className={cn(
                  "relative z-10 w-7 h-7 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center transition-all",
                  "cursor-pointer hover:scale-110",
                  dotBorder,
                  dm.isCompleted && 'shadow-sm shadow-primary/30'
                )}
              >
                {dm.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Icon className={cn('w-3.5 h-3.5', domainColorMap[dm.domain.color])} />
                )}
              </button>

              {/* Content */}
              <button
                onClick={() => handleExecute(dm)}
                className={cn(
                  "flex-1 min-w-0 pb-4 text-start group-hover:opacity-100 transition-opacity",
                  dm.isCompleted && 'opacity-50'
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn('text-[10px] font-bold uppercase tracking-wider', domainColorMap[dm.domain.color])}>
                    {isHe ? dm.domain.labelHe : dm.domain.labelEn}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 font-medium">
                    {dm.milestoneIndex}/{dm.totalMilestones}
                  </span>
                  {dm.isCompleted && (
                    <span className="text-[9px] text-primary font-semibold">
                      {isHe ? '✓ הושלם' : '✓ Done'}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-sm font-medium leading-snug",
                  dm.isCompleted && 'line-through text-muted-foreground'
                )}>
                  {dm.milestoneTitle}
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 line-clamp-1">{dm.missionTitle}</p>
              </button>

              {/* Execute arrow */}
              <Play className="w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-primary shrink-0 mt-2 transition-colors" />
            </motion.div>
          );
        })}
      </div>

      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => {}}
      />

      {/* Assessment popup for pillars that haven't completed assessment */}
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
