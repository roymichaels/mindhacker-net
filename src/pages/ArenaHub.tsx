/**
 * ArenaHub — Tactics page (טקטיקה).
 * Before plan: Same CTA as Strategy.
 * After plan: Shows NEXT tactical action hero + visual mission flowchart.
 */
import { useState, useMemo } from 'react';
import { Swords, Sparkles, Crosshair, ChevronRight, Clock, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const { queue, refetch } = useNowEngine();

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

  // Next action from the NowEngine queue
  const nextAction = queue[0] || null;

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  const activePillarId = selectedPillar || (nextAction ? nextAction.pillarId : pillarIds[0]) || null;
  const activePillarData = activePillarId ? pillarStrategies[activePillarId] : null;
  const activeDomain = activePillarId ? getDomainById(activePillarId) : null;

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 flex-1 px-1 pt-2 max-w-3xl mx-auto w-full">

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
                {isHe
                  ? 'צור אסטרטגיה כדי לראות את הטקטיקה שלך'
                  : 'Create a strategy to see your tactical breakdown'}
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
                <Swords className="h-4 w-4 text-destructive" />
                {isHe ? 'טקטיקה — איך נבצע את זה' : 'Tactics — How We Execute'}
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

            {/* ── NEXT TACTICAL ACTION (Hero Card) ── */}
            {nextAction && (() => {
              const domain = getDomainById(nextAction.pillarId);
              const Icon = domain?.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border-2 border-destructive/30 bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent p-5 cursor-pointer group"
                  onClick={() => handleExecute(nextAction)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer pointer-events-none" />
                  <div className="flex items-center gap-1.5 mb-3">
                    <Crosshair className="h-4 w-4 text-destructive" />
                    <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                      {isHe ? 'הפעולה הבאה' : 'Next Action'}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-destructive/70 mb-0.5">
                        {isHe ? (domain?.labelHe || nextAction.pillarId) : (domain?.labelEn || nextAction.pillarId)}
                      </p>
                      <h2 className="text-base font-bold text-foreground">
                        {isHe ? nextAction.title : nextAction.titleEn}
                      </h2>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {nextAction.durationMin} {isHe ? 'דקות' : 'min'}
                        </span>
                        {nextAction.reason && (
                          <span className="text-[10px] text-muted-foreground/60">{nextAction.reason}</span>
                        )}
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-destructive/40 group-hover:text-destructive transition-colors shrink-0 mt-2" />
                  </div>
                </motion.div>
              );
            })()}

            {/* ── PILLAR TACTICAL FLOWCHART ── */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
                {isHe ? 'פירוט טקטי לפי תחום' : 'Tactical Breakdown'}
              </span>
              <div className="relative">
                {pillarIds.map((pillarId, idx) => {
                  const domain = getDomainById(pillarId);
                  if (!domain) return null;
                  const data = pillarStrategies[pillarId];
                  const missions = data?.missions || [];
                  const totalActions = missions.reduce((sum: number, m: any) =>
                    sum + (m.milestones || []).reduce((mSum: number, ms: any) =>
                      mSum + (ms.minis?.length || 0), 0), 0);
                  const isActive = pillarId === activePillarId;
                  const Icon = domain.icon;

                  return (
                    <div key={pillarId} className="relative">
                      {idx < pillarIds.length - 1 && (
                        <div className="absolute top-10 ltr:left-[15px] rtl:right-[15px] w-0.5 h-[calc(100%-16px)] bg-border/40" />
                      )}

                      <button
                        onClick={() => setSelectedPillar(pillarId === selectedPillar ? null : pillarId)}
                        className={cn(
                          "relative w-full flex items-center gap-3 p-3 rounded-xl text-start transition-all",
                          isActive
                            ? "bg-destructive/10 border border-destructive/25 shadow-sm"
                            : "hover:bg-muted/30 border border-transparent"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          isActive ? "bg-destructive/20" : "bg-muted/40"
                        )}>
                          <Icon className={cn("w-4 h-4", isActive ? "text-destructive" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-foreground/70")}>
                              {isHe ? domain.labelHe : domain.labelEn}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {missions.length} {isHe ? 'משימות' : 'missions'} · {totalActions} {isHe ? 'פעולות' : 'actions'}
                            </span>
                          </div>
                          {missions[0] && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {isHe ? (missions[0].mission_he || missions[0].mission_en) : missions[0].mission_en}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 shrink-0 transition-transform",
                          isActive ? "text-destructive rotate-90" : "text-muted-foreground/40",
                          isRTL && !isActive && "rotate-180",
                          isRTL && isActive && "rotate-90"
                        )} />
                      </button>

                      {/* Expanded mission details */}
                      {isActive && missions.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="overflow-hidden ltr:pl-14 rtl:pr-14 pb-2"
                        >
                          {missions.map((m: any, mi: number) => (
                            <div key={mi} className="flex items-start gap-2 py-1.5">
                              <ArrowRight className="w-3 h-3 text-destructive/50 mt-0.5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-foreground/80">
                                  {isHe ? (m.mission_he || m.mission_en) : m.mission_en}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {(m.milestones || []).length} {isHe ? 'אבני דרך' : 'milestones'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {pillarIds.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isHe ? 'טוען נתוני טקטיקה...' : 'Loading tactics data...'}
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
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
