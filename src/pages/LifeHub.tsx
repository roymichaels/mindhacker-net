/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Before plan: CTA to create plan.
 * After plan: Shows visual 100-day roadmap with phases, missions, milestones.
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, ChevronDown, ChevronRight, CheckCircle2, Circle, MapPin, Milestone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);

  const { data: allPlans } = useQuery({
    queryKey: ['all-active-plans', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('life_plans')
        .select('id, plan_data, start_date')
        .eq('user_id', user!.id)
        .eq('status', 'active');
      return data || [];
    },
    enabled: !!user?.id && hasPlan,
  });

  const pillarStrategies: Record<string, any> = {};
  let planStartDate: string | null = null;
  allPlans?.forEach((p: any) => {
    if (!planStartDate && p.start_date) planStartDate = p.start_date;
    const pillars = p.plan_data?.strategy?.pillars || {};
    Object.entries(pillars).forEach(([id, data]) => {
      pillarStrategies[id] = data;
    });
  });

  const pillarIds = Object.keys(pillarStrategies);

  // Compute current day of plan
  const currentDay = useMemo(() => {
    if (!planStartDate) return 1;
    const diff = Date.now() - new Date(planStartDate).getTime();
    return Math.max(1, Math.min(100, Math.ceil(diff / (1000 * 60 * 60 * 24))));
  }, [planStartDate]);

  const currentPhase = Math.ceil(currentDay / 10); // 1-10

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  // Total missions and milestones count
  const totalMissions = pillarIds.reduce((acc, id) => acc + (pillarStrategies[id]?.missions?.length || 0), 0);
  const totalMilestones = pillarIds.reduce((acc, id) => {
    const missions = pillarStrategies[id]?.missions || [];
    return acc + missions.reduce((ma: number, m: any) => ma + (m.milestones?.length || 0), 0);
  }, 0);

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 flex-1 px-1 pt-2 max-w-3xl mx-auto w-full pb-8">

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
                {isHe
                  ? 'בחר עמודים, אבחן אותם, וצור את תוכנית הטרנספורמציה שלך'
                  : 'Select pillars, assess them, and create your transformation plan'}
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
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                {isHe ? 'אסטרטגיה — למה בחרנו את זה' : 'Strategy — Why We Chose This'}
              </h3>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'כיול מחדש' : 'Recalibrate'}
              </motion.button>
            </div>

            {/* ── PLAN OVERVIEW STATS ── */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center">
                <span className="text-lg font-bold text-primary">{pillarIds.length}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isHe ? 'תחומים' : 'Pillars'}</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center">
                <span className="text-lg font-bold text-primary">{totalMissions}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isHe ? 'משימות' : 'Missions'}</p>
              </div>
              <div className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center">
                <span className="text-lg font-bold text-primary">{totalMilestones}</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isHe ? 'אבני דרך' : 'Milestones'}</p>
              </div>
            </div>

            {/* ── PHASE INDICATOR ── */}
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary">
                    {isHe ? `שלב ${String.fromCharCode(64 + currentPhase)} — יום ${currentDay}/100` : `Phase ${String.fromCharCode(64 + currentPhase)} — Day ${currentDay}/100`}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{currentDay}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${currentDay}%` }} />
              </div>
            </div>

            {/* ── PILLAR ROADMAP ── */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                {isHe ? 'מפת הדרכים' : 'Roadmap'}
              </span>

              {pillarIds.map((pillarId) => {
                const domain = getDomainById(pillarId);
                if (!domain) return null;
                const data = pillarStrategies[pillarId];
                const missions = data?.missions || [];
                const isExpanded = expandedPillar === pillarId;
                const Icon = domain.icon;

                return (
                  <div key={pillarId} className="rounded-xl border border-border/40 overflow-hidden bg-card/50">
                    {/* Pillar header */}
                    <button
                      onClick={() => setExpandedPillar(isExpanded ? null : pillarId)}
                      className="w-full flex items-center gap-3 p-3 text-start hover:bg-muted/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {isHe ? domain.labelHe : domain.labelEn}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted/40 text-muted-foreground">
                            {missions.length} {isHe ? 'משימות' : 'missions'}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground/50 transition-transform",
                        isExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Expanded: missions + milestones */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-2">
                            {missions.map((mission: any, mIdx: number) => {
                              const mKey = `${pillarId}-${mIdx}`;
                              const isMissionExpanded = expandedMission === mKey;
                              const milestones = mission.milestones || [];
                              const missionTitle = isHe
                                ? (mission.mission_he || mission.mission_en || '')
                                : (mission.mission_en || '');

                              return (
                                <div key={mIdx} className="rounded-lg border border-border/30 overflow-hidden">
                                  {/* Mission header - truncated */}
                                  <button
                                    onClick={() => setExpandedMission(isMissionExpanded ? null : mKey)}
                                    className="w-full flex items-start gap-2.5 p-2.5 text-start hover:bg-muted/10 transition-colors"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                      <Target className="w-3 h-3 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-foreground line-clamp-2">
                                        {missionTitle}
                                      </p>
                                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                        {milestones.length} {isHe ? 'אבני דרך' : 'milestones'}
                                      </span>
                                    </div>
                                    <ChevronRight className={cn(
                                      "w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-1 transition-transform",
                                      isMissionExpanded && "rotate-90",
                                      isRTL && !isMissionExpanded && "rotate-180"
                                    )} />
                                  </button>

                                  {/* Milestones timeline */}
                                  <AnimatePresence>
                                    {isMissionExpanded && milestones.length > 0 && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-2.5 pb-2.5 space-y-1">
                                          {milestones.map((ms: any, msIdx: number) => {
                                            const msTitle = isHe
                                              ? (ms.title_he || ms.title_en || '')
                                              : (ms.title_en || '');
                                            return (
                                              <div key={msIdx} className="flex items-start gap-2 py-1.5 relative">
                                                {/* Timeline connector */}
                                                {msIdx < milestones.length - 1 && (
                                                  <div className="absolute top-4 ltr:left-[7px] rtl:right-[7px] w-0.5 h-[calc(100%-4px)] bg-border/30" />
                                                )}
                                                <div className="w-4 h-4 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center shrink-0 z-10 mt-0.5">
                                                  <Circle className="w-1.5 h-1.5 text-primary/50" />
                                                </div>
                                                <p className="text-[11px] text-foreground/70 leading-snug line-clamp-2">
                                                  {msTitle}
                                                </p>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {pillarIds.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isHe ? 'טוען נתוני אסטרטגיה...' : 'Loading strategy data...'}
              </div>
            )}
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
