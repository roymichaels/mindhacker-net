/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Hierarchy: Pillar → Traits (skills table) → Missions → Milestones.
 * CRITICAL: Top-level cards are always TRAITS, never mission text.
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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getTraitDisplayName } from '@/utils/traitNameSanitizer';
import { PILLAR_COLORS } from '@/hooks/useTraitGallery';

// ========== TYPES ==========
interface TraitView {
  skill_id: string;
  name: string;
  name_he: string | null;
  displayName: string;
  icon: string;
  pillar: string;
  level: number;
  xp_total: number;
  missions: MissionView[];
}

interface MissionView {
  id: string;
  title: string;
  title_en: string | null;
  is_completed: boolean;
  milestones: MilestoneView[];
}

interface MilestoneView {
  id: string;
  title: string;
  title_en: string | null;
  is_completed: boolean;
}

interface PillarGroup {
  pillarId: string;
  domain: ReturnType<typeof getDomainById>;
  traits: TraitView[];
  totalGoals: number;
  completedGoals: number;
}

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  // Stats
  const { statusMap } = useLifeDomains();
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;

  // ========== DATA: Traits (from skills table) ==========
  const { data: traits } = useQuery({
    queryKey: ['strategy-traits', user?.id, plan?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, name_he, icon, pillar, category, trait_type')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // ========== DATA: Skill progress ==========
  const { data: skillProgress } = useQuery({
    queryKey: ['strategy-skill-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_skill_progress')
        .select('skill_id, xp_total, level')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // ========== DATA: Missions ==========
  const { data: missions } = useQuery({
    queryKey: ['strategy-missions', plan?.id],
    queryFn: async () => {
      if (!plan?.id) return [];
      const { data, error } = await supabase
        .from('plan_missions')
        .select('id, pillar, title, title_en, is_completed, mission_number, primary_skill_id')
        .eq('plan_id', plan.id)
        .order('mission_number');
      if (error) throw error;
      return data || [];
    },
    enabled: !!plan?.id,
    staleTime: 5 * 60 * 1000,
  });

  // ========== DATA: Milestones ==========
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

  // ========== BUILD NORMALIZED VIEW MODEL ==========
  const pillarGroups = useMemo((): PillarGroup[] => {
    if (!missions || missions.length === 0) return [];

    // Index progress
    const progMap = new Map((skillProgress || []).map(p => [p.skill_id, p]));

    // Index milestones by mission_id
    const msByMission = new Map<string, MilestoneView[]>();
    for (const ms of (milestones || [])) {
      if (!ms.mission_id) continue;
      if (!msByMission.has(ms.mission_id)) msByMission.set(ms.mission_id, []);
      msByMission.get(ms.mission_id)!.push({
        id: ms.id,
        title: ms.title,
        title_en: ms.title_en,
        is_completed: ms.is_completed ?? false,
      });
    }

    // Build MissionView list
    const missionViews: MissionView[] = missions.map(m => ({
      id: m.id,
      title: m.title,
      title_en: m.title_en,
      is_completed: m.is_completed ?? false,
      milestones: msByMission.get(m.id) || [],
    }));

    // Index traits by pillar
    const traitsByPillar = new Map<string, TraitView[]>();

    if (traits && traits.length > 0) {
      // Group traits by pillar
      for (const t of traits) {
        const pillar = t.pillar || categoryToPillar(t.category) || 'mind';
        if (!traitsByPillar.has(pillar)) traitsByPillar.set(pillar, []);
        const prog = progMap.get(t.id);

        // Find missions linked to this trait
        const linkedMissions = missionViews.filter(m => {
          const mData = missions.find(mm => mm.id === m.id);
          return mData?.primary_skill_id === t.id;
        });

        // Also check legacy link (mission with same pillar if no primary_skill_id)
        // Only if no missions found via primary_skill_id
        let finalMissions = linkedMissions;
        if (finalMissions.length === 0) {
          // Legacy: find missions in same pillar that have mission_id matching skill
          const legacyMissions = missionViews.filter(m => {
            const mData = missions.find(mm => mm.id === m.id);
            // Check if any skill has this mission_id via the old link
            return mData?.pillar === pillar;
          });
          // Only use if there's a 1:1 ratio (3 traits, 3 missions per pillar)
          const pillarTraits = traits.filter(tt => (tt.pillar || categoryToPillar(tt.category)) === pillar);
          const traitIndex = pillarTraits.findIndex(tt => tt.id === t.id);
          if (traitIndex >= 0 && traitIndex < legacyMissions.length) {
            finalMissions = [legacyMissions[traitIndex]];
          }
        }

        traitsByPillar.get(pillar)!.push({
          skill_id: t.id,
          name: t.name,
          name_he: t.name_he,
          displayName: getTraitDisplayName(t.name, t.name_he, isHe),
          icon: t.icon || '⭐',
          pillar,
          level: prog?.level || 1,
          xp_total: prog?.xp_total || 0,
          missions: finalMissions,
        });
      }
    } else {
      // No traits exist at all: synthesize from missions (absolute fallback)
      for (const m of missions) {
        if (!traitsByPillar.has(m.pillar)) traitsByPillar.set(m.pillar, []);
        const mView = missionViews.find(mv => mv.id === m.id);
        traitsByPillar.get(m.pillar)!.push({
          skill_id: m.id,
          name: m.title_en || m.title,
          name_he: m.title,
          // CRITICAL: Even in fallback, sanitize the name
          displayName: getTraitDisplayName(m.title_en || m.title, m.title, isHe),
          icon: '🎯',
          pillar: m.pillar,
          level: 1,
          xp_total: 0,
          missions: mView ? [mView] : [],
        });
      }
    }

    // Build groups
    const groups: PillarGroup[] = [];
    for (const [pillarId, pillarTraits] of traitsByPillar) {
      const domain = getDomainById(pillarId);
      const totalGoals = pillarTraits.reduce((s, t) => s + t.missions.reduce((ms, m) => ms + m.milestones.length, 0), 0);
      const completedGoals = pillarTraits.reduce((s, t) => s + t.missions.reduce((ms, m) => ms + m.milestones.filter(ml => ml.is_completed).length, 0), 0);
      groups.push({ pillarId, domain, traits: pillarTraits, totalGoals, completedGoals });
    }
    return groups;
  }, [traits, skillProgress, missions, milestones, isHe]);

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
    queryClient.invalidateQueries({ queryKey: ['strategy-traits'] });
    queryClient.invalidateQueries({ queryKey: ['strategy-milestones'] });
    queryClient.invalidateQueries({ queryKey: ['strategy-skill-progress'] });
    queryClient.invalidateQueries({ queryKey: ['trait-gallery'] });
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

            {/* ── PILLAR → TRAIT → MISSION → MILESTONE HIERARCHY ── */}
            <div className="space-y-3">
              {pillarGroups.map((group) => {
                const { pillarId, domain, traits: pillarTraits, totalGoals: pGoals, completedGoals: pCompleted } = group;
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
                      {Icon && <Icon className="w-5 h-5 shrink-0 text-primary" />}
                    </button>

                    {/* Expanded: TRAIT CARDS (top-level — NOT missions) */}
                    <AnimatePresence>
                      {isPillarExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-2">
                            {pillarTraits.map((trait) => {
                              const isTraitExpanded = expandedTrait === trait.skill_id;
                              const pillarColor = PILLAR_COLORS[pillarId] || '200 70% 50%';
                              const traitMsTotal = trait.missions.reduce((s, m) => s + m.milestones.length, 0);
                              const traitMsCompleted = trait.missions.reduce((s, m) => s + m.milestones.filter(ml => ml.is_completed).length, 0);

                              return (
                                <div
                                  key={trait.skill_id}
                                  className="rounded-xl border border-border/30 bg-background/50 overflow-hidden"
                                >
                                  {/* TRAIT header card — shows trait badge name, NEVER mission text */}
                                  <button
                                    onClick={() => setExpandedTrait(isTraitExpanded ? null : trait.skill_id)}
                                    className="w-full px-4 py-3 flex items-center gap-2.5 text-start hover:bg-muted/10 transition-colors"
                                  >
                                    <span className="text-lg shrink-0">{trait.icon}</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-bold text-foreground truncate">
                                          {/* CRITICAL: Always sanitized trait display name */}
                                          {trait.displayName}
                                        </h4>
                                        <span
                                          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ms-auto"
                                          style={{
                                            backgroundColor: `hsla(${pillarColor}, 0.12)`,
                                            color: `hsl(${pillarColor})`,
                                          }}
                                        >
                                          Lv.{trait.level}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {traitMsCompleted}/{traitMsTotal} {isHe ? 'יעדים' : 'goals'}
                                      </p>
                                    </div>
                                    {isTraitExpanded
                                      ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                      : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    }
                                  </button>

                                  {/* Expanded trait → show MISSIONS */}
                                  <AnimatePresence>
                                    {isTraitExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-3 pb-3 space-y-2 border-t border-border/15">
                                          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold pt-2">
                                            {isHe ? 'משימות אימון' : 'Training Missions'}
                                          </p>
                                          {trait.missions.map((mission) => {
                                            const mTitle = isHe
                                              ? (mission.title || mission.title_en || '')
                                              : (mission.title_en || mission.title || '');
                                            const isMissionExpanded = expandedMission === mission.id;
                                            const msComp = mission.milestones.filter(m => m.is_completed).length;

                                            return (
                                              <div key={mission.id} className="rounded-lg border border-border/20 overflow-hidden bg-card/20">
                                                <button
                                                  onClick={() => setExpandedMission(isMissionExpanded ? null : mission.id)}
                                                  className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-muted/10 transition-colors"
                                                >
                                                  <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-medium text-foreground/80 line-clamp-2">{mTitle}</span>
                                                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                                                      {msComp}/{mission.milestones.length} {isHe ? 'אבני דרך' : 'milestones'}
                                                    </span>
                                                  </div>
                                                  {isMissionExpanded
                                                    ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                                                  }
                                                </button>

                                                {/* Expanded mission → milestones */}
                                                <AnimatePresence>
                                                  {isMissionExpanded && (
                                                    <motion.div
                                                      initial={{ height: 0, opacity: 0 }}
                                                      animate={{ height: 'auto', opacity: 1 }}
                                                      exit={{ height: 0, opacity: 0 }}
                                                      transition={{ duration: 0.15 }}
                                                      className="overflow-hidden"
                                                    >
                                                      <div className="px-3 pb-2 space-y-1">
                                                        {mission.milestones.map((ms) => {
                                                          const msTitle = isHe
                                                            ? (ms.title || ms.title_en || '')
                                                            : (ms.title_en || ms.title || '');
                                                          return (
                                                            <div key={ms.id} className={cn(
                                                              "flex items-start gap-2 py-1",
                                                              ms.is_completed ? "opacity-50" : ""
                                                            )}>
                                                              {ms.is_completed ? (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                                              ) : (
                                                                <Circle className="w-3.5 h-3.5 text-muted-foreground/25 shrink-0 mt-0.5" />
                                                              )}
                                                              <span className={cn(
                                                                "text-[11px] leading-snug",
                                                                ms.is_completed ? "line-through text-muted-foreground" : "text-foreground/70"
                                                              )}>
                                                                {msTitle}
                                                              </span>
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

                                          {trait.missions.length === 0 && (
                                            <p className="text-[10px] text-muted-foreground/50 py-2 text-center">
                                              {isHe ? 'אין משימות מקושרות' : 'No linked missions'}
                                            </p>
                                          )}
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

function categoryToPillar(category: string): string {
  const map: Record<string, string> = {
    spirit: 'consciousness',
    social: 'presence',
    body: 'power',
    mind: 'focus',
    wealth: 'wealth',
  };
  return map[category] || category;
}
