/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Before plan: CTA to create plan.
 * After plan: Shows NEXT strategic focus hero + visual pillar flowchart.
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, ChevronRight, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const { data: allPlans } = useQuery({
    queryKey: ['all-active-plans', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('life_plans')
        .select('id, plan_data')
        .eq('user_id', user!.id)
        .eq('status', 'active');
      return data || [];
    },
    enabled: !!user?.id && hasPlan,
  });

  const pillarStrategies: Record<string, any> = {};
  allPlans?.forEach((p: any) => {
    const pillars = p.plan_data?.strategy?.pillars || {};
    Object.entries(pillars).forEach(([id, data]) => {
      pillarStrategies[id] = data;
    });
  });

  const pillarIds = Object.keys(pillarStrategies);

  // Find the "next" pillar — one with incomplete missions
  const nextPillar = useMemo(() => {
    for (const id of pillarIds) {
      const data = pillarStrategies[id];
      const missions = data?.missions || [];
      if (missions.length > 0) return { id, data };
    }
    return pillarIds.length > 0 ? { id: pillarIds[0], data: pillarStrategies[pillarIds[0]] } : null;
  }, [pillarIds, pillarStrategies]);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  const activePillarId = selectedPillar || nextPillar?.id || null;
  const activePillarData = activePillarId ? pillarStrategies[activePillarId] : null;
  const activeDomain = activePillarId ? getDomainById(activePillarId) : null;

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 flex-1 px-1 pt-2 max-w-3xl mx-auto w-full">

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

            {/* ── NEXT STRATEGIC FOCUS (Hero Card) ── */}
            {activeDomain && activePillarData && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {isHe ? 'מיקוד אסטרטגי' : 'Strategic Focus'}
                  </span>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <activeDomain.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-foreground">
                      {isHe ? activeDomain.labelHe : activeDomain.labelEn}
                    </h2>
                    {activePillarData.goals?.[0] && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {isHe ? activePillarData.goals[0].goal_he : activePillarData.goals[0].goal_en}
                      </p>
                    )}
                    {activePillarData.missions?.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {activePillarData.missions.slice(0, 3).map((m: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <ArrowRight className="w-3 h-3 text-primary/60 shrink-0" />
                            <span className="text-foreground/80">
                              {isHe ? (m.mission_he || m.mission_en) : m.mission_en}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── PILLAR FLOWCHART ── */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                {isHe ? 'כל התחומים' : 'All Pillars'}
              </span>
              <div className="relative">
                {pillarIds.map((pillarId, idx) => {
                  const domain = getDomainById(pillarId);
                  if (!domain) return null;
                  const data = pillarStrategies[pillarId];
                  const goals = data?.goals || [];
                  const missions = data?.missions || [];
                  const isActive = pillarId === activePillarId;
                  const Icon = domain.icon;

                  return (
                    <div key={pillarId} className="relative">
                      {/* Connecting line */}
                      {idx < pillarIds.length - 1 && (
                        <div className="absolute top-10 ltr:left-[15px] rtl:right-[15px] w-0.5 h-[calc(100%-16px)] bg-border/40" />
                      )}

                      <button
                        onClick={() => setSelectedPillar(pillarId === selectedPillar ? null : pillarId)}
                        className={cn(
                          "relative w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all",
                          isActive
                            ? "bg-primary/10 border border-primary/25 shadow-sm"
                            : "hover:bg-muted/30 border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          isActive ? "bg-primary/20" : "bg-muted/40"
                        )}>
                          <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-foreground/70")}>
                              {isHe ? domain.labelHe : domain.labelEn}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {missions.length} {isHe ? 'משימות' : 'missions'}
                            </span>
                          </div>
                          {goals[0] && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {isHe ? goals[0].goal_he : goals[0].goal_en}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 shrink-0 transition-transform",
                          isActive ? "text-primary rotate-90" : "text-muted-foreground/40",
                          isRTL && !isActive && "rotate-180",
                          isRTL && isActive && "rotate-90"
                        )} />
                      </button>
                    </div>
                  );
                })}
              </div>
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
