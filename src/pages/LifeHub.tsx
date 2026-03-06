/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Hierarchy: Pillar → Skills (from skills table) → Milestones (goals).
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, CheckCircle2, Circle, Trophy, MapPin, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useMissionSkills } from '@/hooks/useMissionSkills';
import { supabase } from '@/integrations/supabase/client';

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  // Stats
  const { statusMap } = useLifeDomains();
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;

  // Mission skills (skills table linked to plan_missions)
  const { data: missionSkills, isLoading: skillsLoading } = useMissionSkills();

  // Fetch missions to get pillar info
  const { data: missions } = useQuery({
    queryKey: ['strategy-missions', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('plan_missions')
        .select('id, pillar, title, title_en, description, description_en, is_completed, mission_number')
        .eq('plan_id', plan.id)
        .order('mission_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch milestones linked to missions (fallback when no skills exist)
  const { data: milestones } = useQuery({
    queryKey: ['strategy-milestones', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('id, title, title_en, is_completed, mission_id, milestone_number')
        .eq('plan_id', plan.id)
        .not('mission_id', 'is', null)
        .order('milestone_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Current day
  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  // Build mission→pillar map
  const missionPillarMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of (missions || [])) {
      map.set(m.id, m.pillar);
    }
    return map;
  }, [missions]);

  // Milestones grouped by mission_id (for fallback)
  const milestonesByMissionId = useMemo(() => {
    const map: Record<string, NonNullable<typeof milestones>> = {};
    for (const ms of (milestones || [])) {
      if (!ms.mission_id) continue;
      if (!map[ms.mission_id]) map[ms.mission_id] = [];
      map[ms.mission_id]!.push(ms);
    }
    return map;
  }, [milestones]);

  const hasSkillRecords = missionSkills && missionSkills.length > 0;

  // Unified skill items: use skills table if available, else synthesize from missions
  type SkillItem = {
    id: string;
    name: string;
    icon: string;
    level: number;
    milestones: { id: string; title: string; title_en: string | null; is_completed: boolean }[];
  };

  const pillarGroups = useMemo(() => {
    if (!missions || missions.length === 0) return [];

    const groups: { pillarId: string; domain: ReturnType<typeof getDomainById>; skills: SkillItem[]; totalGoals: number; completedGoals: number }[] = [];
    const byPillar: Record<string, SkillItem[]> = {};

    if (hasSkillRecords) {
      // Use real skills
      for (const skill of missionSkills!) {
        const pillar = missionPillarMap.get(skill.mission_id);
        if (!pillar) continue;
        if (!byPillar[pillar]) byPillar[pillar] = [];
        byPillar[pillar]!.push({
          id: skill.skill_id,
          name: isHe ? (skill.skill_name_he || skill.skill_name) : skill.skill_name,
          icon: skill.skill_icon,
          level: skill.level,
          milestones: skill.milestones,
        });
      }
    } else {
      // Fallback: treat missions as skills
      for (const m of missions) {
        if (!byPillar[m.pillar]) byPillar[m.pillar] = [];
        const ms = milestonesByMissionId[m.id] || [];
        byPillar[m.pillar]!.push({
          id: m.id,
          name: isHe ? (m.title || m.title_en || '') : (m.title_en || m.title || ''),
          icon: '🎯',
          level: 1,
          milestones: ms.map(x => ({ id: x.id, title: x.title, title_en: x.title_en, is_completed: x.is_completed ?? false })),
        });
      }
    }

    for (const [pillarId, skills] of Object.entries(byPillar)) {
      const domain = getDomainById(pillarId);
      const totalGoals = skills.reduce((s, sk) => s + sk.milestones.length, 0);
      const completedGoals = skills.reduce((s, sk) => s + sk.milestones.filter(m => m.is_completed).length, 0);
      groups.push({ pillarId, domain, skills, totalGoals, completedGoals });
    }
    return groups;
  }, [missionSkills, missions, missionPillarMap, milestonesByMissionId, hasSkillRecords, isHe]);

  // Overall stats
  const totalGoals = pillarGroups.reduce((s, g) => s + g.totalGoals, 0);
  const completedGoals = pillarGroups.reduce((s, g) => s + g.completedGoals, 0);
  const overallPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const statItems = [
    { icon: Flame, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
    queryClient.invalidateQueries({ queryKey: ['strategy-missions'] });
    queryClient.invalidateQueries({ queryKey: ['mission-skills'] });
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

            {/* ── PLAN HEADER ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              <div className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {overallPct}% · {completedGoals}/{totalGoals} {isHe ? 'יעדים' : 'goals'}
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
            </div>

            {/* ── PILLAR → SKILL → MILESTONE CARDS ── */}
            <div className="space-y-3">
              {pillarGroups.map((group) => {
                const { pillarId, domain, skills: pillarSkills, totalGoals: pGoals, completedGoals: pCompleted } = group;
                const isPillarExpanded = expandedPillar === pillarId;
                const Icon = domain?.icon;

                return (
                  <div key={pillarId} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                    {/* Pillar header */}
                    <button
                      onClick={() => setExpandedPillar(isPillarExpanded ? null : pillarId)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-muted/20 transition-colors"
                    >
                      {isPillarExpanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      }
                      <span className="text-[9px] text-muted-foreground">
                        {pCompleted}/{pGoals} {isHe ? 'יעדים' : 'goals'}
                      </span>
                      <div className="flex-1" />
                      <span className="text-sm font-bold text-foreground">
                        {isHe ? (domain?.labelHe || pillarId) : (domain?.labelEn || pillarId)}
                      </span>
                      {Icon && <Icon className={cn("w-5 h-5 shrink-0 text-primary")} />}
                    </button>

                    {/* Expanded: Skills */}
                    <AnimatePresence>
                      {isPillarExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-3">
                            {pillarSkills.map((skill) => {
                              const msCompleted = skill.milestones.filter(m => m.is_completed).length;
                              const msTotal = skill.milestones.length;
                              const skillName = skill.name;

                              return (
                                <div
                                  key={skill.id}
                                  className="rounded-xl border border-border/30 bg-background/50 overflow-hidden"
                                >
                                  {/* Skill header card */}
                                  <div className="px-4 py-3 border-b border-border/15 flex items-center gap-2.5">
                                    <span className="text-lg shrink-0">{skill.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-bold text-foreground truncate">
                                          {skillName}
                                        </h4>
                                        <span className="text-[9px] font-mono text-muted-foreground shrink-0 ms-auto">
                                          Lv.{skill.level}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {msCompleted}/{msTotal} {isHe ? 'יעדים' : 'goals'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Milestones (Goals) */}
                                  {skill.milestones.length > 0 && (
                                    <div className="px-4 py-2.5 space-y-1">
                                      {skill.milestones.map((ms) => {
                                        const msTitle = isHe
                                          ? (ms.title || ms.title_en || '')
                                          : (ms.title_en || ms.title || '');
                                        return (
                                          <div key={ms.id} className={cn(
                                            "flex items-start gap-2 py-1.5",
                                            ms.is_completed ? "opacity-50" : ""
                                          )}>
                                            {ms.is_completed ? (
                                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                            ) : (
                                              <Circle className="w-4 h-4 text-muted-foreground/25 shrink-0 mt-0.5" />
                                            )}
                                            <span className={cn(
                                              "text-xs leading-snug",
                                              ms.is_completed ? "line-through text-muted-foreground" : "text-foreground/75"
                                            )}>
                                              {msTitle}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
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
