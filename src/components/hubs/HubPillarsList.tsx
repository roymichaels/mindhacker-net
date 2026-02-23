/**
 * HubPillarsList — Grid of pillar cards with 90-day goals.
 * Sources goals from strategy pillars data + life_plan_milestones.
 */
import { useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Target } from 'lucide-react';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400',
};

const activeBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/25', fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/25',
  red: 'bg-red-500/10 border-red-500/25', amber: 'bg-amber-500/10 border-amber-500/25',
  cyan: 'bg-cyan-500/10 border-cyan-500/25', slate: 'bg-slate-500/10 border-slate-500/25',
  indigo: 'bg-indigo-500/10 border-indigo-500/25', emerald: 'bg-emerald-500/10 border-emerald-500/25',
  purple: 'bg-purple-500/10 border-purple-500/25', sky: 'bg-sky-500/10 border-sky-500/25',
  rose: 'bg-rose-500/10 border-rose-500/25', violet: 'bg-violet-500/10 border-violet-500/25',
};

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-400', fuchsia: 'bg-fuchsia-400', red: 'bg-red-400',
  amber: 'bg-amber-400', cyan: 'bg-cyan-400', slate: 'bg-slate-400',
  indigo: 'bg-indigo-400', emerald: 'bg-emerald-400', purple: 'bg-purple-400',
  sky: 'bg-sky-400', rose: 'bg-rose-400', violet: 'bg-violet-400',
};

interface HubPillarsListProps {
  hub: 'core' | 'arena';
}

export function HubPillarsList({ hub }: HubPillarsListProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { coreStrategy, arenaStrategy, corePlan, arenaPlan, generateStrategy, isLoading: strategyLoading } = useStrategyPlans();

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
  const basePath = hub === 'core' ? '/life' : '/arena';
  const strategy = hub === 'core' ? coreStrategy : arenaStrategy;
  const plan = hub === 'core' ? corePlan : arenaPlan;

  // Auto-generate strategy for this hub if it doesn't exist
  const autoTriggered = useRef(false);
  useEffect(() => {
    if (!strategy && !strategyLoading && user?.id && !autoTriggered.current && !generateStrategy.isPending) {
      autoTriggered.current = true;
      generateStrategy.mutate({ hub, forceRegenerate: false });
    }
  }, [strategy, strategyLoading, user?.id, hub, generateStrategy]);

  const sectionTitle = hub === 'core'
    ? (isHe ? 'תחומי הליבה' : 'Core Pillars')
    : (isHe ? 'תחומי הזירה' : 'Arena Pillars');

  // Fetch milestones for this plan (now stored as pillar goals)
  const { data: milestones } = useQuery({
    queryKey: ['plan-milestones', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('focus_area, focus_area_en, title, title_en, goal, goal_en, tasks, tasks_en, week_number')
        .eq('plan_id', plan.id)
        .order('week_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Build goals per pillar from strategy pillars data OR milestones
  const pillarGoals = useMemo(() => {
    const grouped: Record<string, { goal: string; milestones: string[] }[]> = {};
    const domainIds = domains.map(d => d.id);

    // Source 1: strategy.pillars (new structure)
    const pillarsData = strategy?.pillars as Record<string, { goals: any[] }> | undefined;
    if (pillarsData) {
      for (const [pillarId, pillarObj] of Object.entries(pillarsData)) {
        if (!domainIds.includes(pillarId)) continue;
        if (!grouped[pillarId]) grouped[pillarId] = [];
        for (const g of (pillarObj?.goals || [])) {
          grouped[pillarId].push({
            goal: isHe ? (g.goal_he || g.goal_en) : (g.goal_en || g.goal_he),
            milestones: isHe ? (g.milestones_he || []) : (g.milestones_en || []),
          });
        }
      }
    }

    // Source 2: milestones from DB (works for both old weekly and new pillar structure)
    if (milestones?.length && Object.keys(grouped).length === 0) {
      for (const ms of milestones) {
        const focusArea = (ms.focus_area || '').trim().toLowerCase();
        if (!domainIds.includes(focusArea)) continue;
        if (!grouped[focusArea]) grouped[focusArea] = [];
        const goalText = isHe ? (ms.goal || ms.title) : (ms.goal_en || ms.title_en || ms.goal || ms.title);
        const msItems = isHe ? (ms.tasks as string[] || []) : (ms.tasks_en as string[] || ms.tasks as string[] || []);
        grouped[focusArea].push({
          goal: goalText,
          milestones: msItems,
        });
      }
    }

    // Legacy fallback: strategy.weeks (old structure)
    if (strategy?.weeks && Object.keys(grouped).length === 0) {
      for (const week of strategy.weeks) {
        const goals = isHe ? week.goals_he : week.goals_en;
        if (!goals?.length || !week.pillar_focus?.length) continue;
        for (const pillar of week.pillar_focus) {
          if (!domainIds.includes(pillar)) continue;
          if (!grouped[pillar]) grouped[pillar] = [];
          const theme = isHe ? week.theme_he : week.theme_en;
          if (theme && !grouped[pillar].some(g => g.goal === theme)) {
            grouped[pillar].push({ goal: theme, milestones: [] });
          }
        }
      }
    }

    // Limit to 10 goals per pillar
    for (const key of Object.keys(grouped)) {
      grouped[key] = grouped[key].slice(0, 10);
    }
    return grouped;
  }, [strategy, milestones, isHe, domains]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {sectionTitle}
      </h3>

      {generateStrategy.isPending && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isHe ? 'מייצר תוכנית 90 יום...' : 'Generating 90-day plan...'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {domains.map((domain, i) => {
          const status = statusMap[domain.id] ?? 'unconfigured';
          const isActive = status === 'active' || status === 'configured';
          const Icon = domain.icon;
          const goals = pillarGoals[domain.id] || [];

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'rounded-xl border transition-all overflow-hidden flex flex-col',
                isActive ? activeBgMap[domain.color] : 'bg-card/40 border-border/30'
              )}
            >
              <button
                onClick={() => navigate(`${basePath}/${domain.id}`)}
                className="w-full flex items-center gap-2.5 p-3 text-start hover:bg-accent/5 transition-colors"
              >
                <Icon className={cn('w-4 h-4 shrink-0', domainColorMap[domain.color])} />
                <div className="flex-1 min-w-0">
                  <span className={cn('text-xs font-medium', isActive ? domainColorMap[domain.color] : 'text-foreground/80')}>
                    {isHe ? domain.labelHe : domain.labelEn}
                  </span>
                  <p className="text-[10px] text-muted-foreground/60 truncate">
                    {isHe ? domain.descriptionHe : domain.description}
                  </p>
                </div>
                {goals.length > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {goals.length} {isHe ? 'מטרות' : 'goals'}
                  </span>
                )}
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              </button>

              {goals.length > 0 && (
                <div className="px-3 pb-3 pt-0 border-t border-border/20">
                  <ul className="mt-2 space-y-1.5">
                    {goals.map((g, gi) => (
                      <li key={gi} className="flex items-start gap-2 text-[11px] text-foreground/70 leading-relaxed">
                        <Target className={cn('w-3 h-3 shrink-0 mt-0.5', domainColorMap[domain.color])} />
                        <div className="min-w-0">
                          <span className="line-clamp-1 font-medium">{g.goal}</span>
                          {g.milestones.length > 0 && (
                            <span className="text-[10px] text-muted-foreground/50">
                              {g.milestones.length} {isHe ? 'אבני דרך' : 'milestones'}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
