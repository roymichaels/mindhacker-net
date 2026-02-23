/**
 * HubPillarsList — Grid of pillar cards with 3 mission cards each.
 * Each mission opens a modal with 5 milestones → 5 mini-milestones.
 */
import { useMemo } from 'react';
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
import { MissionCard } from '@/components/missions/MissionCard';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const activeBgMap: Record<string, string> = {
  blue: 'bg-blue-500/10 border-blue-500/25', fuchsia: 'bg-fuchsia-500/10 border-fuchsia-500/25',
  red: 'bg-red-500/10 border-red-500/25', amber: 'bg-amber-500/10 border-amber-500/25',
  cyan: 'bg-cyan-500/10 border-cyan-500/25', slate: 'bg-slate-500/10 border-slate-500/25',
  indigo: 'bg-indigo-500/10 border-indigo-500/25', emerald: 'bg-emerald-500/10 border-emerald-500/25',
  purple: 'bg-purple-500/10 border-purple-500/25', sky: 'bg-sky-500/10 border-sky-500/25',
  rose: 'bg-rose-500/10 border-rose-500/25', violet: 'bg-violet-500/10 border-violet-500/25',
  teal: 'bg-teal-500/10 border-teal-500/25',
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
  const { corePlan, arenaPlan, generateStrategy } = useStrategyPlans();

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
  const basePath = hub === 'core' ? '/life' : '/arena';
  const plan = hub === 'core' ? corePlan : arenaPlan;

  const sectionTitle = hub === 'core'
    ? (isHe ? 'תחומי הליבה' : 'Core Pillars')
    : (isHe ? 'תחומי הזירה' : 'Arena Pillars');

  // Fetch missions for this plan
  const { data: missions } = useQuery({
    queryKey: ['plan-missions', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('plan_missions')
        .select('*')
        .eq('plan_id', plan.id)
        .order('mission_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch milestones linked to missions
  const { data: milestones } = useQuery({
    queryKey: ['mission-milestones', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('id, title, title_en, is_completed, mission_id, milestone_number, focus_area')
        .eq('plan_id', plan.id)
        .not('mission_id', 'is', null)
        .order('milestone_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Group missions by pillar
  const missionsByPillar = useMemo(() => {
    const grouped: Record<string, typeof missions> = {};
    if (!missions) return grouped;
    for (const m of missions) {
      if (!grouped[m.pillar]) grouped[m.pillar] = [];
      grouped[m.pillar]!.push(m);
    }
    return grouped;
  }, [missions]);

  // Group milestones by mission_id
  const milestonesByMission = useMemo(() => {
    const grouped: Record<string, typeof milestones> = {};
    if (!milestones) return grouped;
    for (const ms of milestones) {
      if (!ms.mission_id) continue;
      if (!grouped[ms.mission_id]) grouped[ms.mission_id] = [];
      grouped[ms.mission_id]!.push(ms);
    }
    return grouped;
  }, [milestones]);

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
            {isHe ? 'מייצר תוכנית 100 יום...' : 'Generating 100-day plan...'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {domains.map((domain, i) => {
          const status = statusMap[domain.id] ?? 'unconfigured';
          const isActive = status === 'active' || status === 'configured';
          const Icon = domain.icon;
          const pillarMissions = missionsByPillar[domain.id] || [];

          return (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'rounded-xl border transition-all overflow-hidden',
                isActive ? activeBgMap[domain.color] : 'bg-card/40 border-border/30'
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
                {pillarMissions.length > 0 && (
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {pillarMissions.filter(m => m.is_completed).length}/{pillarMissions.length} {isHe ? 'משימות' : 'missions'}
                  </span>
                )}
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
              </button>

              {/* Mission cards */}
              {pillarMissions.length > 0 && (
                <div className="px-3 pb-3 pt-0 border-t border-border/20">
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {pillarMissions.map((mission, mi) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        milestones={milestonesByMission[mission.id] || []}
                        color={domain.color}
                        index={mi}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
