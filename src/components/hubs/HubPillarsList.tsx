/**
 * HubPillarsList — Grid of compact pillar cards.
 * Clicking a card opens a PillarModal with the missions roadmap.
 */
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { supabase } from '@/integrations/supabase/client';
import { CORE_DOMAINS, ARENA_DOMAINS, type LifeDomain } from '@/navigation/lifeDomains';
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { PillarModal } from '@/components/missions/PillarModal';

const domainColorMap: Record<string, string> = {
  blue: 'text-blue-400', fuchsia: 'text-fuchsia-400', red: 'text-red-400',
  amber: 'text-amber-400', cyan: 'text-cyan-400', slate: 'text-slate-400',
  indigo: 'text-indigo-400', emerald: 'text-emerald-400', purple: 'text-purple-400',
  sky: 'text-sky-400', rose: 'text-rose-400', violet: 'text-violet-400', teal: 'text-teal-400',
};

const cardBgMap: Record<string, string> = {
  blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/25 hover:border-blue-500/40',
  fuchsia: 'from-fuchsia-500/10 to-fuchsia-600/5 border-fuchsia-500/25 hover:border-fuchsia-500/40',
  red: 'from-red-500/10 to-red-600/5 border-red-500/25 hover:border-red-500/40',
  amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/25 hover:border-amber-500/40',
  cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/25 hover:border-cyan-500/40',
  slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/25 hover:border-slate-500/40',
  indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/25 hover:border-indigo-500/40',
  emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/25 hover:border-emerald-500/40',
  purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/25 hover:border-purple-500/40',
  sky: 'from-sky-500/10 to-sky-600/5 border-sky-500/25 hover:border-sky-500/40',
  rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/25 hover:border-rose-500/40',
  violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/25 hover:border-violet-500/40',
  teal: 'from-teal-500/10 to-teal-600/5 border-teal-500/25 hover:border-teal-500/40',
};

interface HubPillarsListProps {
  hub: 'core' | 'arena';
}

export function HubPillarsList({ hub }: HubPillarsListProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { corePlan, arenaPlan, generateStrategy } = useStrategyPlans();
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);

  const domains: LifeDomain[] = hub === 'core' ? CORE_DOMAINS : ARENA_DOMAINS;
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

      <div className="grid grid-cols-3 gap-3">
        {domains.map((domain, i) => {
          const status = statusMap[domain.id] ?? 'unconfigured';
          const isActive = status === 'active' || status === 'configured';
          const Icon = domain.icon;
          const pillarMissions = missionsByPillar[domain.id] || [];
          const completedMissions = pillarMissions.filter(m => m.is_completed).length;
          const totalMilestones = pillarMissions.reduce(
            (sum, m) => sum + (milestonesByMission[m.id]?.length || 0), 0
          );
          const completedMilestones = pillarMissions.reduce(
            (sum, m) => sum + (milestonesByMission[m.id]?.filter(ms => ms.is_completed).length || 0), 0
          );
          const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

          return (
            <motion.button
              key={domain.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              onClick={() => setSelectedDomain(domain)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border bg-gradient-to-br p-3 text-center transition-all hover:scale-[1.03] hover:shadow-lg cursor-pointer',
                isActive
                  ? cardBgMap[domain.color]
                  : 'bg-card/40 border-border/30 hover:border-border/50'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-6 h-6', domainColorMap[domain.color])} />
                {isActive && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 absolute -top-1 -end-1" />
                )}
              </div>
              <span className={cn(
                'text-[11px] font-semibold leading-tight',
                isActive ? domainColorMap[domain.color] : 'text-foreground/80'
              )}>
                {isHe ? domain.labelHe : domain.labelEn}
              </span>
              {pillarMissions.length > 0 && (
                <>
                  <Progress value={progress} className="h-1 w-full [&>div]:bg-primary" />
                  <span className="text-[9px] text-muted-foreground/50">
                    {completedMissions}/{pillarMissions.length}
                  </span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Pillar Modal */}
      {selectedDomain && (
        <PillarModal
          open={!!selectedDomain}
          onOpenChange={(o) => !o && setSelectedDomain(null)}
          hub={hub}
          pillar={selectedDomain}
          missions={missionsByPillar[selectedDomain.id] || []}
          milestonesByMission={milestonesByMission}
          isActive={(statusMap[selectedDomain.id] ?? 'unconfigured') === 'active' || statusMap[selectedDomain.id] === 'configured'}
        />
      )}
    </div>
  );
}
