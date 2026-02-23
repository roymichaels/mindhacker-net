/**
 * DailyMilestones — Shows today's milestone for each pillar from the 90-day plan.
 * Picks based on day-of-plan offset, cycling through the 3×5×10 structure.
 */
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { Calendar, Play, CheckCircle2, Flame } from 'lucide-react';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
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

interface DailyMilestone {
  pillarId: string;
  domain: LifeDomain;
  goalTitle: string;
  subGoalTitle: string;
  milestone: string;
  milestoneIndex: number;
  totalMilestones: number;
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
  const { coreStrategy, arenaStrategy, corePlan, arenaPlan } = useStrategyPlans();
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const dailyMilestones = useMemo(() => {
    const results: DailyMilestone[] = [];
    
    const processHub = (strategy: any, plan: any, domains: LifeDomain[], hubType: 'core' | 'arena') => {
      if (!strategy?.pillars || !plan?.start_date) return;
      const dayOfPlan = getDayOfPlan(plan.start_date);
      
      for (const domain of domains) {
        const pillarData = (strategy.pillars as Record<string, { goals: any[] }>)[domain.id];
        if (!pillarData?.goals?.length) continue;
        
        // Collect ALL milestones flat for this pillar
        const allMilestones: { goalTitle: string; subGoalTitle: string; milestone: string; idx: number; total: number }[] = [];
        
        for (const goal of pillarData.goals) {
          const goalTitle = isHe ? (goal.goal_he || goal.goal_en) : (goal.goal_en || goal.goal_he);
          for (const sg of (goal.sub_goals || [])) {
            const subGoalTitle = isHe ? (sg.sub_goal_he || sg.sub_goal_en) : (sg.sub_goal_en || sg.sub_goal_he);
            const milestones = isHe ? (sg.milestones_he || sg.milestones_en || []) : (sg.milestones_en || sg.milestones_he || []);
            milestones.forEach((m: string, mi: number) => {
              allMilestones.push({ goalTitle, subGoalTitle, milestone: m, idx: allMilestones.length, total: 0 });
            });
          }
        }
        
        if (allMilestones.length === 0) continue;
        
        // Set total
        allMilestones.forEach(m => m.total = allMilestones.length);
        
        // Pick today's milestone by cycling through all milestones
        const todayIdx = dayOfPlan % allMilestones.length;
        const today = allMilestones[todayIdx];
        
        results.push({
          pillarId: domain.id,
          domain,
          goalTitle: today.goalTitle,
          subGoalTitle: today.subGoalTitle,
          milestone: today.milestone,
          milestoneIndex: todayIdx + 1,
          totalMilestones: today.total,
        });
      }
    };
    
    if (hub === 'core' || hub === 'both') {
      processHub(coreStrategy, corePlan, CORE_DOMAINS, 'core');
    }
    if (hub === 'arena' || hub === 'both') {
      processHub(arenaStrategy, arenaPlan, ARENA_DOMAINS, 'arena');
    }
    
    return results;
  }, [coreStrategy, arenaStrategy, corePlan, arenaPlan, isHe, hub]);

  const handleExecute = (dm: DailyMilestone) => {
    const hubType = CORE_DOMAINS.some(d => d.id === dm.pillarId) ? 'core' : 'arena';
    setExecutionAction({
      pillarId: dm.pillarId,
      hub: hubType,
      actionType: dm.pillarId,
      title: dm.milestone,
      titleEn: dm.milestone,
      durationMin: 15,
      urgencyScore: 80,
      reason: dm.subGoalTitle,
      sourceType: 'plan',
    });
    setExecutionOpen(true);
  };

  if (dailyMilestones.length === 0) return null;

  const title = hub === 'both'
    ? (isHe ? '🔥 המשימות של היום' : '🔥 Today\'s Missions')
    : hub === 'core'
      ? (isHe ? '⚡ משימות ליבה להיום' : '⚡ Core Missions Today')
      : (isHe ? '🎯 משימות זירה להיום' : '🎯 Arena Missions Today');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">
            {title}
          </h3>
          <span className="text-[10px] text-muted-foreground/60 ms-auto">
            {dailyMilestones.length} {isHe ? 'משימות' : 'tasks'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {dailyMilestones.map((dm, i) => {
          const Icon = dm.domain.icon;
          return (
            <motion.button
              key={dm.pillarId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleExecute(dm)}
              className={cn(
                'group w-full flex items-start gap-3 p-3 rounded-xl border border-border/40',
                'bg-card/40 hover:bg-accent/10 hover:border-primary/30 transition-all text-start'
              )}
            >
              <div className={cn('shrink-0 w-8 h-8 rounded-lg flex items-center justify-center', dotBgMap[dm.domain.color])}>
                <Icon className={cn('w-4 h-4', domainColorMap[dm.domain.color])} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn('text-[10px] font-semibold uppercase tracking-wider', domainColorMap[dm.domain.color])}>
                    {isHe ? dm.domain.labelHe : dm.domain.labelEn}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40">
                    {dm.milestoneIndex}/{dm.totalMilestones}
                  </span>
                </div>
                <p className="text-xs font-medium leading-snug line-clamp-2">{dm.milestone}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 line-clamp-1">{dm.subGoalTitle}</p>
              </div>
              <Play className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary shrink-0 mt-1 transition-colors" />
            </motion.button>
          );
        })}
      </div>

      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => {}}
      />
    </div>
  );
}