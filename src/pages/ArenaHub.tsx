/**
 * ArenaHub — Tactics page (טקטיקה).
 * Before plan: Same CTA as Strategy.
 * After plan: Shows tactical breakdown — the HOW for each pillar.
 */
import { useState } from 'react';
import { Swords, Sparkles, ChevronDown, ChevronUp, Crosshair, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

function TacticsPillarCard({ pillarId, data, isHe }: { pillarId: string; data: any; isHe: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const domain = getDomainById(pillarId);
  if (!domain) return null;
  const Icon = domain.icon;

  const missions = data?.missions || [];

  // Count total daily actions
  const totalActions = missions.reduce((sum: number, m: any) => {
    return sum + (m.milestones || []).reduce((mSum: number, ms: any) => {
      return mSum + (ms.minis?.length || 0);
    }, 0);
  }, 0);

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-start hover:bg-muted/20 transition-colors"
      >
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10")}>
          <Icon className="w-4.5 h-4.5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-foreground">
            {isHe ? domain.labelHe : domain.labelEn}
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {missions.length} {isHe ? 'משימות' : 'missions'} · {totalActions} {isHe ? 'פעולות יומיות' : 'daily actions'}
          </p>
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
              {missions.map((mission: any, mi: number) => (
                <div key={mi} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                    <h5 className="text-xs font-bold text-foreground">
                      {isHe ? (mission.mission_he || mission.mission_en) : mission.mission_en}
                    </h5>
                  </div>

                  {/* Milestones with their daily actions */}
                  {(mission.milestones || []).map((ms: any, si: number) => (
                    <div key={si} className="ms-5 space-y-1">
                      <p className="text-[11px] font-semibold text-foreground/70">
                        <span className="text-destructive/70">{mi + 1}.{si + 1}</span>{' '}
                        {isHe ? (ms.title_he || ms.title_en) : ms.title_en}
                      </p>
                      {ms.minis?.length > 0 && (
                        <div className="ms-3 space-y-0.5">
                          {ms.minis.map((mini: any, di: number) => (
                            <div key={di} className="flex items-center gap-1.5 py-0.5">
                              <Clock className="w-2.5 h-2.5 text-muted-foreground/50 shrink-0" />
                              <span className="text-[10px] text-muted-foreground">
                                {isHe ? mini.title_he : mini.title_en}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const { plan, isLoading } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();

  const [wizardOpen, setWizardOpen] = useState(false);

  // Fetch all active plans to get tactic data
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

            <div className="flex flex-col gap-2">
              {pillarIds.map((pillarId) => (
                <TacticsPillarCard
                  key={pillarId}
                  pillarId={pillarId}
                  data={pillarStrategies[pillarId]}
                  isHe={isHe}
                />
              ))}
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
    </div>
  );
}
