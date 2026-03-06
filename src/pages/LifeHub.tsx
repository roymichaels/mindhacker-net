/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Hierarchy: Pillar → Traits → Missions → Milestones.
 * Selected pillars get 3 traits, non-selected get 1 trait.
 * CRITICAL: Top-level cards are always TRAITS, never mission text.
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, CheckCircle2, Circle, Trophy, MapPin, ChevronDown, ChevronUp, Star, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useAuth } from '@/contexts/AuthContext';
import { usePillarAccess } from '@/hooks/usePillarAccess';
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
  missionCount: number;
  milestoneCount: number;
  completedMilestones: number;
  missions: MissionView[];
}

interface MissionView {
  id: string;
  title: string;
  title_en: string | null;
  is_completed: boolean;
  milestoneCount: number;
  completedMilestones: number;
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
  isSelected: boolean;
  traits: TraitView[];
  traitCount: number;
  missionCount: number;
  milestoneCount: number;
  completedMilestones: number;
}

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const allPlanIds: string[] = (plan as any)?.all_plan_ids || (plan?.id ? [plan.id] : []);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isPillarSelected } = usePillarAccess();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const { statusMap } = useLifeDomains();
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;

  // ========== DATA ==========
  const { data: traits } = useQuery({
    queryKey: ['strategy-traits', user?.id, allPlanIds],
    queryFn: async () => {
      if (!user?.id || allPlanIds.length === 0) return [];
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, name_he, icon, pillar, category, trait_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('life_plan_id', allPlanIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && allPlanIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

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

  const { data: missions } = useQuery({
    queryKey: ['strategy-missions', allPlanIds],
    queryFn: async () => {
      if (allPlanIds.length === 0) return [];
      const { data, error } = await supabase
        .from('plan_missions')
        .select('id, pillar, title, title_en, is_completed, mission_number, primary_skill_id')
        .in('plan_id', allPlanIds)
        .order('mission_number');
      if (error) throw error;
      return data || [];
    },
    enabled: allPlanIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const { data: milestones } = useQuery({
    queryKey: ['strategy-milestones', allPlanIds],
    queryFn: async () => {
      if (allPlanIds.length === 0) return [];
      const { data, error } = await supabase
        .from('life_plan_milestones')
        .select('id, title, title_en, is_completed, mission_id, milestone_number')
        .in('plan_id', allPlanIds)
        .not('mission_id', 'is', null)
        .order('milestone_number');
      if (error) throw error;
      return data || [];
    },
    enabled: allPlanIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const currentDay = useMemo(() => {
    if (!plan?.start_date) return 1;
    const diff = Date.now() - new Date(plan.start_date).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [plan?.start_date]);

  // ========== NORMALIZED VIEW MODEL ==========
  const pillarGroups = useMemo((): PillarGroup[] => {
    if (!missions || missions.length === 0) return [];

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
    const buildMissionView = (m: typeof missions[0]): MissionView => {
      const msList = msByMission.get(m.id) || [];
      return {
        id: m.id,
        title: m.title,
        title_en: m.title_en,
        is_completed: m.is_completed ?? false,
        milestoneCount: msList.length,
        completedMilestones: msList.filter(ms => ms.is_completed).length,
        milestones: msList,
      };
    };

    // Index traits by pillar
    const traitsByPillar = new Map<string, TraitView[]>();

    if (traits && traits.length > 0) {
      for (const t of traits) {
        const pillar = t.pillar || categoryToPillar(t.category) || 'mind';
        if (!traitsByPillar.has(pillar)) traitsByPillar.set(pillar, []);
        const prog = progMap.get(t.id);

        // Find missions linked to this trait
        let linkedMissions = missions
          .filter(mm => mm.primary_skill_id === t.id)
          .map(buildMissionView);

        // Legacy fallback: distribute pillar missions evenly among pillar traits
        if (linkedMissions.length === 0) {
          const pillarMissions = missions.filter(mm => mm.pillar === pillar);
          const pillarTraits = traits.filter(tt => (tt.pillar || categoryToPillar(tt.category)) === pillar);
          const traitIndex = pillarTraits.findIndex(tt => tt.id === t.id);
          if (traitIndex >= 0 && pillarTraits.length > 0) {
            const chunkSize = Math.ceil(pillarMissions.length / pillarTraits.length);
            const start = traitIndex * chunkSize;
            linkedMissions = pillarMissions.slice(start, start + chunkSize).map(buildMissionView);
          }
        }

        const milestoneCount = linkedMissions.reduce((s, m) => s + m.milestoneCount, 0);
        const completedMilestones = linkedMissions.reduce((s, m) => s + m.completedMilestones, 0);

        traitsByPillar.get(pillar)!.push({
          skill_id: t.id,
          name: t.name,
          name_he: t.name_he,
          displayName: getTraitDisplayName(t.name, t.name_he, isHe),
          icon: t.icon || '⭐',
          pillar,
          level: prog?.level || 1,
          xp_total: prog?.xp_total || 0,
          missionCount: linkedMissions.length,
          milestoneCount,
          completedMilestones,
          missions: linkedMissions,
        });
      }
    } else {
      // Absolute fallback: synthesize from missions
      for (const m of missions) {
        if (!traitsByPillar.has(m.pillar)) traitsByPillar.set(m.pillar, []);
        const mv = buildMissionView(m);
        traitsByPillar.get(m.pillar)!.push({
          skill_id: m.id,
          name: m.title_en || m.title,
          name_he: m.title,
          displayName: getTraitDisplayName(m.title_en || m.title, m.title, isHe),
          icon: '🎯',
          pillar: m.pillar,
          level: 1,
          xp_total: 0,
          missionCount: 1,
          milestoneCount: mv.milestoneCount,
          completedMilestones: mv.completedMilestones,
          missions: [mv],
        });
      }
    }

    // Build groups, sorted: selected first
    const groups: PillarGroup[] = [];
    for (const [pillarId, pillarTraits] of traitsByPillar) {
      const domain = getDomainById(pillarId);
      const selected = isPillarSelected(pillarId);
      const milestoneCount = pillarTraits.reduce((s, t) => s + t.milestoneCount, 0);
      const completedMilestones = pillarTraits.reduce((s, t) => s + t.completedMilestones, 0);
      const missionCount = pillarTraits.reduce((s, t) => s + t.missionCount, 0);
      groups.push({
        pillarId,
        domain,
        isSelected: selected,
        traits: pillarTraits,
        traitCount: pillarTraits.length,
        missionCount,
        milestoneCount,
        completedMilestones,
      });
    }
    // Selected pillars first, then alphabetical
    groups.sort((a, b) => {
      if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
      return (a.domain?.labelEn || '').localeCompare(b.domain?.labelEn || '');
    });
    return groups;
  }, [traits, skillProgress, missions, milestones, isHe, isPillarSelected]);

  // Overall stats
  const totalMilestones = pillarGroups.reduce((s, g) => s + g.milestoneCount, 0);
  const completedMilestones = pillarGroups.reduce((s, g) => s + g.completedMilestones, 0);
  const overallPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const totalTraits = pillarGroups.reduce((s, g) => s + g.traitCount, 0);

  const statItems = [
    { icon: Flame, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Star, value: totalTraits, label: isHe ? 'תכונות' : 'Traits', color: 'text-teal-400' },
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
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-40 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
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
                      {overallPct}% · {completedMilestones}/{totalMilestones} {isHe ? 'אבני דרך' : 'milestones'}
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
                const { pillarId, domain, traits: pillarTraits, isSelected, traitCount, milestoneCount: pMs, completedMilestones: pComp } = group;
                const isPillarExpanded = expandedPillar === pillarId;
                const Icon = domain?.icon;
                const pillarColor = PILLAR_COLORS[pillarId] || '200 70% 50%';
                const pPct = pMs > 0 ? Math.round((pComp / pMs) * 100) : 0;

                // Pillar summary text
                const traitLabel = isHe
                  ? (traitCount === 1 ? 'תכונה אחת' : `${traitCount} תכונות`)
                  : (traitCount === 1 ? '1 trait' : `${traitCount} traits`);
                const msLabel = `${pMs} ${isHe ? 'אבני דרך' : 'milestones'}`;

                return (
                  <div
                    key={pillarId}
                    className={cn(
                      "rounded-2xl border overflow-hidden transition-all duration-300",
                      isSelected
                        ? "border-border/60 bg-card"
                        : "border-border/25 bg-card/60",
                    )}
                    style={isSelected ? {
                      boxShadow: `0 0 24px hsla(${pillarColor}, 0.08), inset 0 1px 0 hsla(${pillarColor}, 0.06)`,
                    } : undefined}
                  >
                    {/* Pillar header */}
                    <button
                      onClick={() => setExpandedPillar(isPillarExpanded ? null : pillarId)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-muted/20 transition-colors"
                    >
                      {Icon && (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `hsla(${pillarColor}, 0.12)`,
                          }}
                        >
                          <Icon className="w-4 h-4" style={{ color: `hsl(${pillarColor})` }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {isHe ? (domain?.labelHe || pillarId) : (domain?.labelEn || pillarId)}
                          </span>
                          {isSelected && (
                            <Shield className="w-3 h-3 text-primary shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {traitLabel} · {msLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {pComp}/{pMs}
                        </span>
                        {isPillarExpanded
                          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        }
                      </div>
                    </button>

                    {/* Progress bar (always visible) */}
                    <div className="px-4 pb-2 -mt-1">
                      <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pPct}%`,
                            backgroundColor: `hsl(${pillarColor})`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Expanded: TRAIT BADGE CARDS */}
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
                            {/* Trait badge grid */}
                            <div className={cn(
                              "grid gap-2",
                              pillarTraits.length >= 3 ? "grid-cols-3" : pillarTraits.length === 2 ? "grid-cols-2" : "grid-cols-1"
                            )}>
                              {pillarTraits.map((trait, ti) => {
                                const isTraitExpanded = expandedTrait === trait.skill_id;

                                return (
                                  <motion.button
                                    key={trait.skill_id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: ti * 0.05 }}
                                    onClick={() => setExpandedTrait(isTraitExpanded ? null : trait.skill_id)}
                                    className={cn(
                                      "rounded-xl border p-3 flex flex-col items-center gap-1.5 text-center transition-all duration-200",
                                      "hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                                      isTraitExpanded
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-border/30 bg-background/50 hover:bg-muted/20",
                                    )}
                                    style={isTraitExpanded ? {
                                      boxShadow: `0 0 16px hsla(${pillarColor}, 0.2)`,
                                    } : undefined}
                                  >
                                    <span className="text-2xl">{trait.icon}</span>
                                    <span className="text-xs font-bold text-foreground leading-tight line-clamp-2 min-h-[2em]">
                                      {trait.displayName}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground">
                                      {trait.missionCount} {isHe ? 'משימות' : 'missions'} · {trait.milestoneCount} {isHe ? 'א.ד' : 'ms'}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground/70">
                                      {trait.completedMilestones}/{trait.milestoneCount} {isHe ? 'הושלמו' : 'done'}
                                    </span>
                                  </motion.button>
                                );
                              })}
                            </div>

                            {/* Expanded trait detail: missions */}
                            <AnimatePresence>
                              {expandedTrait && pillarTraits.find(t => t.skill_id === expandedTrait) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  {(() => {
                                    const trait = pillarTraits.find(t => t.skill_id === expandedTrait)!;
                                    return (
                                      <div className="rounded-xl border border-border/20 bg-background/30 p-3 space-y-2">
                                        <div className="flex items-center gap-2 pb-1 border-b border-border/15">
                                          <span className="text-lg">{trait.icon}</span>
                                          <span className="text-sm font-bold text-foreground">{trait.displayName}</span>
                                          <span className="text-[9px] text-muted-foreground ms-auto">
                                            {trait.completedMilestones}/{trait.milestoneCount}
                                          </span>
                                        </div>

                                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                                          {isHe ? 'משימות אימון' : 'Training Missions'}
                                        </p>

                                        {trait.missions.length === 0 ? (
                                          <p className="text-[10px] text-muted-foreground/50 py-2 text-center">
                                            {isHe ? 'אין משימות מקושרות' : 'No linked missions'}
                                          </p>
                                        ) : trait.missions.map((mission) => {
                                          const mTitle = isHe
                                            ? (mission.title || mission.title_en || '')
                                            : (mission.title_en || mission.title || '');
                                          const isMissionExpanded = expandedMission === mission.id;

                                          return (
                                            <div key={mission.id} className="rounded-lg border border-border/20 overflow-hidden bg-card/20">
                                              <button
                                                onClick={() => setExpandedMission(isMissionExpanded ? null : mission.id)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-muted/10 transition-colors"
                                              >
                                                <div className="flex-1 min-w-0">
                                                  <span className="text-xs font-medium text-foreground/80 line-clamp-2">{mTitle}</span>
                                                  <span className="text-[9px] text-muted-foreground block mt-0.5">
                                                    {mission.completedMilestones}/{mission.milestoneCount} {isHe ? 'אבני דרך' : 'milestones'}
                                                  </span>
                                                </div>
                                                {isMissionExpanded
                                                  ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" />
                                                  : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                                                }
                                              </button>

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
                                      </div>
                                    );
                                  })()}
                                </motion.div>
                              )}
                            </AnimatePresence>
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
