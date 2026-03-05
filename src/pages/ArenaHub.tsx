/**
 * ArenaHub — Tactics page (טקטיקה).
 * Body shows ONLY the next action hero card.
 * Weekly roadmap is in the left sidebar.
 */
import { useState } from 'react';
import { Swords, Sparkles, Crosshair, Clock, Play, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById } from '@/navigation/lifeDomains';
import { useQueryClient } from '@tanstack/react-query';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { useNavigate } from 'react-router-dom';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export default function ArenaHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const { plan, isLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const { queue, refetch } = useNowEngine();
  const nextAction = queue[0] || null;
  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  return (
    <div className="flex flex-col w-full items-center justify-center min-h-[60vh]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-lg w-full px-4">

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
            {/* ── NEXT ACTION HERO CARD ── */}
            {nextAction ? (() => {
              const domain = getDomainById(nextAction.pillarId);
              const Icon = domain?.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 cursor-pointer group active:scale-[0.99] transition-transform"
                  onClick={() => handleExecute(nextAction)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <Crosshair className="h-4 w-4 text-destructive" />
                      <span className="text-xs font-bold text-destructive uppercase tracking-wider">
                        {isHe ? 'הפעולה הבאה' : 'Next Action'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {nextAction.durationMin} {isHe ? 'דקות' : 'min'}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-foreground/70" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {isHe ? (domain?.labelHe || nextAction.pillarId) : (domain?.labelEn || nextAction.pillarId)}
                      </p>
                      <h2 className="text-base font-bold text-foreground leading-snug">
                        {isHe ? nextAction.title : nextAction.titleEn}
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                      <Play className="w-5 h-5 text-destructive" />
                    </div>
                  </div>

                  {nextAction.reason && (
                    <p className="text-xs text-muted-foreground mt-3 border-t border-border/30 pt-3">{nextAction.reason}</p>
                  )}
                </motion.div>
              );
            })() : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {isHe ? 'אין פעולה הבאה כרגע' : 'No next action right now'}
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
