/**
 * HubPillarsList — Renders pillar domain cards with strategy actions underneath.
 * Shows assessment status, current week goals, and daily actions per pillar.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, ChevronLeft, ChevronRight, Target } from 'lucide-react';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400',
  fuchsia: 'text-fuchsia-400',
  red: 'text-red-400',
  amber: 'text-amber-400',
  cyan: 'text-cyan-400',
  slate: 'text-slate-400',
  indigo: 'text-indigo-400',
  emerald: 'text-emerald-400',
  purple: 'text-purple-400',
  sky: 'text-sky-400',
  rose: 'text-rose-400',
  violet: 'text-violet-400',
};

const activeBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/25',
  fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/25',
  red: 'bg-red-500/10 border-red-500/25',
  amber: 'bg-amber-500/10 border-amber-500/25',
  cyan: 'bg-cyan-500/10 border-cyan-500/25',
  slate: 'bg-slate-500/10 border-slate-500/25',
  indigo: 'bg-indigo-500/10 border-indigo-500/25',
  emerald: 'bg-emerald-500/10 border-emerald-500/25',
  purple: 'bg-purple-500/10 border-purple-500/25',
  sky: 'bg-sky-500/10 border-sky-500/25',
  rose: 'bg-rose-500/10 border-rose-500/25',
  violet: 'bg-violet-500/10 border-violet-500/25',
};

interface HubPillarsListProps {
  hub: 'core' | 'arena';
}

export function HubPillarsList({ hub }: HubPillarsListProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { coreStrategy, arenaStrategy, coreWeek, arenaWeek } = useStrategyPlans();

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
  const basePath = hub === 'core' ? '/life' : '/arena';
  const strategy = hub === 'core' ? coreStrategy : arenaStrategy;
  const currentWeek = hub === 'core' ? coreWeek : arenaWeek;

  const sectionTitle = hub === 'core'
    ? (isHe ? 'תחומי הליבה' : 'Core Pillars')
    : (isHe ? 'תחומי הזירה' : 'Arena Pillars');

  // Extract current week's actions grouped by pillar
  const pillarActions = useMemo(() => {
    if (!strategy?.weeks || !currentWeek) return {};
    const week = strategy.weeks.find(w => w.week === currentWeek);
    if (!week) return {};

    const grouped: Record<string, { action: string; duration: number }[]> = {};
    for (const da of week.daily_actions || []) {
      const pillar = da.pillar;
      if (!grouped[pillar]) grouped[pillar] = [];
      grouped[pillar].push({
        action: isHe ? da.action_he : da.action_en,
        duration: da.duration_min,
      });
    }
    return grouped;
  }, [strategy, currentWeek, isHe]);

  // Extract current week goals grouped by pillar_focus
  const pillarGoals = useMemo(() => {
    if (!strategy?.weeks || !currentWeek) return {};
    const week = strategy.weeks.find(w => w.week === currentWeek);
    if (!week) return {};

    const goals = isHe ? week.goals_he : week.goals_en;
    const grouped: Record<string, string[]> = {};
    for (const pillar of week.pillar_focus || []) {
      grouped[pillar] = goals || [];
    }
    return grouped;
  }, [strategy, currentWeek, isHe]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {sectionTitle}
        </h3>
        {currentWeek && (
          <span className="text-[10px] text-muted-foreground/60">
            {isHe ? `שבוע ${currentWeek}/12` : `Week ${currentWeek}/12`}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {domains.map((domain, i) => {
          const status = statusMap[domain.id] ?? 'unconfigured';
          const isActive = status === 'active' || status === 'configured';
          const Icon = domain.icon;
          const actions = pillarActions[domain.id] || [];
          const goals = pillarGoals[domain.id] || [];
          const hasContent = actions.length > 0 || goals.length > 0;

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'rounded-xl border transition-all overflow-hidden',
                isActive
                  ? activeBgMap[domain.color]
                  : 'bg-card/40 border-border/30'
              )}
            >
              {/* Pillar header */}
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
                {isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              </button>

              {/* Strategy content underneath */}
              {hasContent && (
                <div className="px-3 pb-3 pt-0 border-t border-border/20">
                  {/* Goals */}
                  {goals.length > 0 && (
                    <div className="mt-2 mb-1.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target className="w-3 h-3 text-primary/60" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                          {isHe ? 'יעדי השבוע' : 'Weekly Goals'}
                        </span>
                      </div>
                      <ul className="space-y-0.5">
                        {goals.slice(0, 3).map((g, gi) => (
                          <li key={gi} className="text-[11px] text-foreground/70 leading-relaxed flex gap-1.5">
                            <span className="text-primary/40 shrink-0">•</span>
                            <span className="line-clamp-2">{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Daily actions */}
                  {actions.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">
                        {isHe ? 'פעולות יומיות' : 'Daily Actions'}
                      </span>
                      <ul className="space-y-1">
                        {actions.slice(0, 4).map((a, ai) => (
                          <li key={ai} className="text-[11px] text-foreground/60 leading-relaxed flex items-start gap-1.5">
                            <span className="text-accent/40 shrink-0 mt-0.5">▸</span>
                            <span className="line-clamp-2 flex-1">{a.action}</span>
                            <span className="text-[9px] text-muted-foreground/40 shrink-0 tabular-nums">
                              {a.duration}{isHe ? 'ד׳' : 'm'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
