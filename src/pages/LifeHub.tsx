/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Before plan: CTA to create plan.
 * After plan: Shows the full strategic overview — WHY we chose this strategy, per pillar.
 */
import { useState } from 'react';
import { Flame, Sparkles, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones, useLifePlan } from '@/hooks/useLifePlan';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function StrategyPillarCard({ pillarId, data, isHe }: { pillarId: string; data: any; isHe: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const domain = getDomainById(pillarId);
  if (!domain) return null;
  const Icon = domain.icon;

  const goals = data?.goals || [];
  const missions = data?.missions || [];

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-start hover:bg-muted/20 transition-colors"
      >
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10")}>
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground">
            {isHe ? domain.labelHe : domain.labelEn}
          </h4>
          {goals.length > 0 && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {isHe ? goals[0]?.goal_he : goals[0]?.goal_en}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/20 pt-3">
              {/* Strategic Goals */}
              {goals.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {isHe ? 'מטרות אסטרטגיות' : 'Strategic Goals'}
                  </h5>
                  <div className="space-y-2">
                    {goals.map((goal: any, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <Target className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {isHe ? goal.goal_he : goal.goal_en}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missions Overview */}
              {missions.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {isHe ? 'משימות ראשיות' : 'Main Missions'}
                  </h5>
                  <div className="space-y-1.5">
                    {missions.map((mission: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                        <span className="text-[10px] font-bold text-primary mt-0.5">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {isHe ? (mission.mission_he || mission.mission_en) : mission.mission_en}
                          </p>
                          {mission.milestones?.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {mission.milestones.length} {isHe ? 'אבני דרך' : 'milestones'}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();

  const [wizardOpen, setWizardOpen] = useState(false);

  // Fetch all active plans to get strategy data per pillar
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

  // Extract all pillar strategies from all active plans
  const pillarStrategies: Record<string, any> = {};
  allPlans?.forEach((p: any) => {
    const pillars = p.plan_data?.strategy?.pillars || {};
    Object.entries(pillars).forEach(([id, data]) => {
      pillarStrategies[id] = data;
    });
  });

  const pillarIds = Object.keys(pillarStrategies);

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  return (
    <div className="flex flex-col w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-5 flex-1 px-1 pt-2">

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

            {/* Pillar Strategy Cards */}
            <div className="flex flex-col gap-2">
              {pillarIds.map((pillarId) => (
                <StrategyPillarCard
                  key={pillarId}
                  pillarId={pillarId}
                  data={pillarStrategies[pillarId]}
                  isHe={isHe}
                />
              ))}
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
