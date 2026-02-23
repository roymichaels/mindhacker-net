/**
 * HubPillarsList — Grid of pillar cards, each with 90-day goal lists.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

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

const dotColorMap: Record<string, string> = {
  blue: 'bg-blue-400',
  fuchsia: 'bg-fuchsia-400',
  red: 'bg-red-400',
  amber: 'bg-amber-400',
  cyan: 'bg-cyan-400',
  slate: 'bg-slate-400',
  indigo: 'bg-indigo-400',
  emerald: 'bg-emerald-400',
  purple: 'bg-purple-400',
  sky: 'bg-sky-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
};

interface HubPillarsListProps {
  hub: 'core' | 'arena';
}

export function HubPillarsList({ hub }: HubPillarsListProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { coreStrategy, arenaStrategy } = useStrategyPlans();

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
  const basePath = hub === 'core' ? '/life' : '/arena';
  const strategy = hub === 'core' ? coreStrategy : arenaStrategy;

  const sectionTitle = hub === 'core'
    ? (isHe ? 'תחומי הליבה' : 'Core Pillars')
    : (isHe ? 'תחומי הזירה' : 'Arena Pillars');

  // Aggregate all 90-day goals per pillar from all weeks
  const pillarGoals = useMemo(() => {
    if (!strategy?.weeks) return {};
    const grouped: Record<string, string[]> = {};

    for (const week of strategy.weeks) {
      // Map goals to focused pillars
      const goals = isHe ? week.goals_he : week.goals_en;
      if (!goals?.length || !week.pillar_focus?.length) continue;

      for (const pillar of week.pillar_focus) {
        if (!grouped[pillar]) grouped[pillar] = [];
        // Add the week theme as a goal bucket label
        const theme = isHe ? week.theme_he : week.theme_en;
        if (theme && !grouped[pillar].includes(theme)) {
          grouped[pillar].push(theme);
        }
      }

      // Also extract unique daily action descriptions per pillar
      for (const da of week.daily_actions || []) {
        const pillar = da.pillar;
        if (!pillar) continue;
        if (!grouped[pillar]) grouped[pillar] = [];
        const actionLabel = isHe ? da.action_he : da.action_en;
        // Extract a short summary (first ~50 chars)
        const short = actionLabel.split('.')[0].split('(')[0].trim();
        if (short && !grouped[pillar].some(g => g === short)) {
          grouped[pillar].push(short);
        }
      }
    }

    // Deduplicate and limit
    for (const key of Object.keys(grouped)) {
      const unique = [...new Set(grouped[key])];
      grouped[key] = unique.slice(0, 8);
    }
    return grouped;
  }, [strategy, isHe]);

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {sectionTitle}
      </h3>
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

              {/* 90-day goal list */}
              {goals.length > 0 && (
                <div className="px-3 pb-3 pt-0 border-t border-border/20">
                  <ul className="mt-2 space-y-1">
                    {goals.map((goal, gi) => (
                      <li key={gi} className="flex items-start gap-2 text-[11px] text-foreground/70 leading-relaxed">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5', dotColorMap[domain.color])} />
                        <span className="line-clamp-2">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty state */}
              {goals.length === 0 && (
                <div className="px-3 pb-3 pt-0 border-t border-border/20">
                  <p className="text-[10px] text-muted-foreground/40 mt-2 italic">
                    {isHe ? 'אין יעדים עדיין — השלם אבחון כדי לייצר תוכנית' : 'No goals yet — complete assessment to generate plan'}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
