/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Same layout style as Tactics/Now.
 * Roadmap section shows the FULL 100-day plan (all 10 phases A-J).
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, CheckCircle2, Circle, Trophy, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { supabase } from '@/integrations/supabase/client';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const TOTAL_PHASES = 10;

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, milestones: allMilestones, isLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  // Stats
  const { statusMap } = useLifeDomains();
  const { coreStrategy } = useStrategyPlans();
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
  const pillarGoals = coreStrategy?.pillars || {};
  const totalGoals = Object.values(pillarGoals).reduce((sum: number, p: any) => sum + (p.goals?.length || 0), 0);

  // Current day
  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  // Fetch missions for the plan
  const { data: missions } = useQuery({
    queryKey: ['strategy-missions', plan?.id],
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
  const { data: missionMilestones } = useQuery({
    queryKey: ['strategy-milestones', plan?.id],
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
  const pillarGroups = useMemo(() => {
    if (!missions) return [];
    const byPillar: Record<string, typeof missions> = {};
    for (const m of missions) {
      if (!byPillar[m.pillar]) byPillar[m.pillar] = [];
      byPillar[m.pillar]!.push(m);
    }
    // Group milestones by mission_id
    const msByMission: Record<string, NonNullable<typeof missionMilestones>> = {};
    for (const ms of (missionMilestones || [])) {
      if (!ms.mission_id) continue;
      if (!msByMission[ms.mission_id]) msByMission[ms.mission_id] = [];
      msByMission[ms.mission_id]!.push(ms);
    }
    return Object.entries(byPillar).map(([pillarId, pillarMissions]) => {
      const domain = getDomainById(pillarId);
      const totalMs = pillarMissions.reduce((s, m) => s + (msByMission[m.id]?.length || 0), 0);
      const completedMs = pillarMissions.reduce((s, m) => s + (msByMission[m.id]?.filter(ms => ms.is_completed).length || 0), 0);
      return {
        pillarId,
        domain,
        missions: pillarMissions,
        milestonesByMission: msByMission,
        totalMilestones: totalMs,
        completedMilestones: completedMs,
        completedMissions: pillarMissions.filter(m => m.is_completed).length,
      };
    });
  }, [missions, missionMilestones]);

  // Overall progress from missions
  const totalMissionsCount = missions?.length || 0;
  const completedMissionsCount = missions?.filter(m => m.is_completed).length || 0;
  const overallPct = totalMissionsCount > 0 ? Math.round((completedMissionsCount / totalMissionsCount) * 100) : 0;

  const statItems = [
    { icon: Flame, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
    queryClient.invalidateQueries({ queryKey: ['strategy-missions'] });
    queryClient.invalidateQueries({ queryKey: ['strategy-milestones'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'טרם יצרת תוכנית 100 יום' : 'No 100-Day Plan Yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe ? 'בחר עמודים, אבחן אותם, וצור את תוכנית הטרנספורמציה שלך' : 'Select pillars, assess them, and create your transformation plan'}
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

            {/* ── STRATEGIC VIEW: PILLARS → MISSIONS → MILESTONES ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {completedMissionsCount}/{totalMissionsCount} {isHe ? 'משימות' : 'missions'} · {overallPct}%
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setWizardOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors shrink-0"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isHe ? 'כיול מחדש' : 'Recalibrate'}
                  </motion.button>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Pillar → Mission → Milestone hierarchy */}
              <div className="px-3 py-3 space-y-1">
                {pillarGroups.map((group) => {
                  const { pillarId, domain, missions: pillarMissions, milestonesByMission, totalMilestones, completedMilestones, completedMissions: completedM } = group;
                  const isPillarExpanded = expandedPillar === pillarId;
                  const Icon = domain?.icon;
                  const pillarPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
                  const allDone = pillarMissions.length > 0 && completedM === pillarMissions.length;

                  return (
                    <div key={pillarId}>
                      {/* Pillar row */}
                      <button
                        onClick={() => setExpandedPillar(isPillarExpanded ? null : pillarId)}
                        className={cn(
                          "w-full flex items-center gap-2.5 p-2.5 rounded-xl text-start transition-all",
                          isPillarExpanded ? "bg-primary/8 border border-primary/20" : "hover:bg-muted/30",
                          allDone && "opacity-70"
                        )}
                      >
                        {Icon && <Icon className={cn("w-5 h-5 shrink-0", allDone ? "text-primary" : "text-muted-foreground")} />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground">
                              {isHe ? (domain?.labelHe || pillarId) : (domain?.labelEn || pillarId)}
                            </span>
                            <span className="text-[9px] text-muted-foreground ms-auto">
                              {completedM}/{pillarMissions.length} {isHe ? 'משימות' : 'missions'}
                            </span>
                          </div>
                          <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1">
                            <div className={cn("h-full rounded-full transition-all", allDone ? "bg-primary" : "bg-primary/50")} style={{ width: `${pillarPct}%` }} />
                          </div>
                        </div>
                        {isPillarExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      </button>

                      {/* Expanded: Missions */}
                      <AnimatePresence>
                        {isPillarExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ps-6 pe-1 py-1.5 space-y-1">
                              {pillarMissions.map((mission) => {
                                const msMilestones = milestonesByMission[mission.id] || [];
                                const msCompleted = msMilestones.filter(ms => ms.is_completed).length;
                                const isMissionExpanded = expandedMission === mission.id;
                                const missionDone = mission.is_completed;

                                return (
                                  <div key={mission.id}>
                                    <button
                                      onClick={() => setExpandedMission(isMissionExpanded ? null : mission.id)}
                                      className={cn(
                                        "w-full flex items-start gap-2 py-2 px-2.5 rounded-lg text-start transition-all",
                                        isMissionExpanded ? "bg-muted/40" : "hover:bg-muted/20",
                                        missionDone && "opacity-60"
                                      )}
                                    >
                                      {missionDone ? (
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                      ) : (
                                        <Target className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className={cn(
                                          "text-[11px] font-semibold leading-snug",
                                          missionDone ? "line-through text-muted-foreground" : "text-foreground"
                                        )}>
                                          {isHe ? (mission.title || mission.title_en) : (mission.title_en || mission.title)}
                                        </p>
                                        {mission.description && (
                                          <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-2">
                                            {isHe ? (mission.description || mission.description_en) : (mission.description_en || mission.description)}
                                          </p>
                                        )}
                                        <span className="text-[9px] text-muted-foreground/50 mt-0.5 block">
                                          {msCompleted}/{msMilestones.length} {isHe ? 'יעדים' : 'goals'}
                                        </span>
                                      </div>
                                      {msMilestones.length > 0 && (
                                        isMissionExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0 mt-1" />
                                      )}
                                    </button>

                                    {/* Expanded: Milestones (Goals) */}
                                    <AnimatePresence>
                                      {isMissionExpanded && msMilestones.length > 0 && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: 'auto', opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.15 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="ps-6 pe-1 py-1 space-y-0.5">
                                            {msMilestones.map((ms: any) => (
                                              <div key={ms.id} className={cn(
                                                "flex items-center gap-2 py-1 px-2 rounded-md",
                                                ms.is_completed ? "opacity-50" : ""
                                              )}>
                                                {ms.is_completed ? (
                                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                                ) : (
                                                  <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
                                                )}
                                                <span className={cn(
                                                  "text-[10px]",
                                                  ms.is_completed ? "line-through text-muted-foreground" : "text-foreground/70"
                                                )}>
                                                  {isHe ? (ms.title || ms.title_en) : (ms.title_en || ms.title)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
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
    </div>
  );
}
