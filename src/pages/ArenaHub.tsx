/**
 * ArenaHub — Tactics page (טקטיקה).
 * Shows weekly tactical plan derived from Strategy milestones.
 * Hierarchy: Trait → Mission → Milestone (from strategy chain)
 */
import { useState, useMemo } from 'react';
import { Swords, Sparkles, Play, Loader2, Target, Trophy, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { usePhaseActions } from '@/hooks/usePhaseActions';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { supabase } from '@/integrations/supabase/client';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// Fetch missions for plan IDs (separate query to avoid PostgREST join issues)
function usePlanMissions(planIds: string[]) {
  return useQuery({
    queryKey: ['plan-missions-map', planIds],
    queryFn: async () => {
      if (!planIds.length) return {};

      const { data, error } = await supabase
        .from('plan_missions')
        .select('id, title, title_en, pillar, primary_skill_id, mission_number')
        .in('plan_id', planIds);

      if (error) {
        console.error('Failed to fetch plan missions:', error);
        return {};
      }

      const map: Record<string, typeof data[0]> = {};
      for (const m of data || []) {
        map[m.id] = m;
      }
      return map;
    },
    enabled: planIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  
  const { plan, milestones, isLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const { queue, refetch } = useNowEngine();
  const nextAction = queue[0] || null;
  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

  const { generating: phaseGenerating } = usePhaseActions();
  const { statusMap } = useLifeDomains();

  // Get all active plan IDs directly from the life plan hook (single source)
  const allPlanIds = useMemo(() => {
    return (plan as any)?.all_plan_ids as string[] || (plan?.id ? [plan.id] : []);
  }, [plan]);

  // Use already-loaded milestones filtered by current phase (proven to work)
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  // Fetch missions as a separate simple query (no PostgREST joins)
  const { data: missionsMap } = usePlanMissions(allPlanIds);

  // Group milestones by mission
  const missionGroups = useMemo(() => {
    if (!currentPhaseMilestones.length) return [];

    const groups: Record<string, {
      missionId: string;
      missionTitle: string;
      missionTitleEn: string;
      pillar: string;
      traitName: string;
      traitNameEn: string;
      milestones: any[];
      completedCount: number;
      totalCount: number;
    }> = {};

    for (const m of currentPhaseMilestones) {
      const mission = m.mission_id ? missionsMap?.[m.mission_id] : null;
      const missionId = mission?.id || m.mission_id || m.focus_area || 'ungrouped';

      if (!groups[missionId]) {
        groups[missionId] = {
          missionId,
          missionTitle: mission?.title || m.title || 'משימה',
          missionTitleEn: mission?.title_en || m.title_en || 'Mission',
          pillar: mission?.pillar || m.focus_area || 'focus',
          traitName: '',
          traitNameEn: '',
          milestones: [],
          completedCount: 0,
          totalCount: 0,
        };
      }

      groups[missionId].milestones.push(m);
      groups[missionId].totalCount++;
      if (m.is_completed) groups[missionId].completedCount++;
    }

    return Object.values(groups);
  }, [currentPhaseMilestones, missionsMap]);

  // Stats
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
  const phaseCompleted = (phaseMilestones || []).filter((m: any) => m.is_completed).length;
  const phaseTotal = (phaseMilestones || []).length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;
  const allCompleted = milestones.filter(m => m.is_completed).length;
  const allTotal = milestones.length || 1;
  const overallPct = Math.round((allCompleted / allTotal) * 100);

  const statItems = [
    { icon: Swords, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: missionGroups.length, label: isHe ? 'משימות' : 'Missions', color: 'text-teal-400' },
    { icon: CheckCircle2, value: `${phaseCompleted}/${phaseTotal}`, label: isHe ? 'אבני דרך' : 'Milestones', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
    queryClient.invalidateQueries({ queryKey: ['phase-missions'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Swords className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'טרם יצרת תוכנית 100 יום' : 'No 100-Day Plan Yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe ? 'צור אסטרטגיה כדי לראות את הטקטיקה שלך' : 'Create a strategy to see your tactical breakdown'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setWizardOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'צור תוכנית 100 יום' : 'Create 100-Day Plan'}
            </motion.button>
          </div>
        ) : hasPlan ? (
          <>
            {/* ── STATS GRID ── */}
            <div className="grid grid-cols-4 gap-2">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2.5 flex flex-col items-center gap-1">
                  <s.icon className={cn("w-4 h-4", s.color)} />
                  <span className="text-sm font-bold text-foreground">{s.value}</span>
                  <span className="text-[9px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── WEEKLY TACTICAL PLAN ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              {/* Phase header */}
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  {nextAction ? (
                    <button
                      onClick={() => handleExecute(nextAction)}
                      className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center shrink-0 hover:bg-destructive/25 transition-colors"
                    >
                      <Play className="w-4 h-4 text-destructive" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
                      <span className="text-sm font-bold text-destructive">{phaseLabel}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? `שלב ${phaseLabel} — תוכנית שבועית` : `Phase ${phaseLabel} — Weekly Plan`}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {phaseCompleted}/{phaseTotal} {isHe ? 'אבני דרך' : 'milestones'} · {phasePct}%
                    </p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${phasePct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Missions grouped by trait */}
              <div className="px-4 py-3 space-y-3">
                {missionGroups.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {phaseGenerating
                      ? (isHe ? 'מייצר פעולות...' : 'Generating actions...')
                      : (isHe ? 'אין אבני דרך בשלב הנוכחי' : 'No milestones in this phase')}
                  </p>
                ) : (
                  missionGroups.map((group) => {
                    const domain = getDomainById(group.pillar);
                    const Icon = domain?.icon;
                    const isExpanded = expandedMission === group.missionId;

                    return (
                      <div key={group.missionId} className="space-y-1">
                        {/* Mission header with trait badge */}
                        <button
                          onClick={() => setExpandedMission(isExpanded ? null : group.missionId)}
                          className="flex items-center gap-2 w-full text-start hover:bg-muted/10 rounded-lg px-1 py-1 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center">
                            {Icon ? <Icon className="w-3.5 h-3.5 text-foreground/60" /> : <Swords className="w-3.5 h-3.5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-foreground/80 block truncate">
                              {isHe ? group.missionTitle : group.missionTitleEn}
                            </span>
                            {group.traitName && (
                              <span className="text-[9px] text-muted-foreground/60 block">
                                {isHe ? group.traitName : group.traitNameEn}
                                <span className="mx-1">·</span>
                                {isHe ? (domain?.labelHe || group.pillar) : (domain?.labelEn || group.pillar)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground me-1">
                            {group.completedCount}/{group.totalCount}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/40" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                          )}
                        </button>

                        {/* Milestones (expandable) */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-0.5 ps-3 pb-1">
                                {group.milestones.map((m: any) => (
                                  <div key={m.id} className={cn(
                                    "flex items-start gap-2 py-1.5 px-2 rounded-lg",
                                    m.is_completed ? "opacity-50" : "hover:bg-muted/20 transition-colors"
                                  )}>
                                    {m.is_completed ? (
                                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "text-xs leading-snug",
                                        m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                                      )}>
                                        {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <StrategyPillarWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onPlanGenerated={handlePlanGenerated}
      />
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
