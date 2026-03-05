/**
 * MobileHeroGrid — "Now" page (עכשיו).
 * Same layout style as Tactics & Strategy: stats grid + next action hero + current phase roadmap.
 * No sidebars.
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useNowEngine, type NowQueueItem } from '@/hooks/useNowEngine';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { ExecutionModal } from '@/components/dashboard/ExecutionModal';
import { AddItemWizard } from '@/components/plate/AddItemWizard';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { Zap, Play, Plus, Loader2, Flame, Target, Trophy, CheckCircle2, Circle, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

interface MobileHeroGridProps {
  planData: any;
}

export function MobileHeroGrid({ planData }: MobileHeroGridProps) {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';

  const { queue, isLoading, refetch, hasCoreStrategy, hasArenaStrategy } = useNowEngine();
  const hasPlan = hasCoreStrategy || hasArenaStrategy;
  const nextAction = queue[0] || null;

  const { plan, milestones, currentWeek: currentPhase } = useLifePlanWithMilestones();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [executionAction, setExecutionAction] = useState<NowQueueItem | null>(null);
  const [executionOpen, setExecutionOpen] = useState(false);

  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

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

  // Current phase milestones grouped by pillar
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );
  const pillarGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const m of currentPhaseMilestones) {
      const key = m.focus_area || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }, [currentPhaseMilestones]);

  const phaseCompleted = currentPhaseMilestones.filter(m => m.is_completed).length;
  const phaseTotal = currentPhaseMilestones.length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseCompleted / phaseTotal) * 100) : 0;

  // Overall progress
  const allCompleted = milestones.filter(m => m.is_completed).length;
  const allTotal = milestones.length || 1;
  const overallPct = Math.round((allCompleted / allTotal) * 100);

  const statItems = [
    { icon: Zap, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handleExecute = (item: NowQueueItem) => {
    setExecutionAction(item);
    setExecutionOpen(true);
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-4 max-w-xl w-full px-4 pt-4">

        {!hasPlan && !isLoading ? (
          /* ── NO PLAN STATE ── */
          <div className="flex flex-col items-center justify-center py-12 text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Flame className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isHe ? 'אין תוכנית פעילה' : 'No Active Plan'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
                {isHe
                  ? 'צור תוכנית אסטרטגית כדי לקבל את תור הפעולה היומי שלך'
                  : 'Create a strategy plan to get your daily action queue'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/strategy')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isHe ? 'עבור לאסטרטגיה' : 'Go to Strategy'}
            </motion.button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
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

            {/* ── NEXT ACTION HERO CARD ── */}
            {nextAction ? (() => {
              const domain = getDomainById(nextAction.pillarId);
              const Icon = domain?.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-2xl border border-border/40 bg-card px-4 py-2.5 cursor-pointer group active:scale-[0.99] transition-transform"
                  onClick={() => handleExecute(nextAction)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-4.5 h-4.5 text-foreground/70" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isHe ? (domain?.labelHe || nextAction.pillarId) : (domain?.labelEn || nextAction.pillarId)}
                        <span className="mx-1.5 text-border">·</span>
                        {nextAction.durationMin} {isHe ? 'דק׳' : 'min'}
                      </p>
                      <h2 className="text-sm font-bold text-foreground leading-snug">
                        {isHe ? nextAction.title : nextAction.titleEn}
                      </h2>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
                      <Play className="w-4 h-4 text-destructive" />
                    </div>
                  </div>
                </motion.div>
              );
            })() : (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {isHe ? 'אין פעולה הבאה כרגע' : 'No next action right now'}
              </div>
            )}

            {/* ── Add button ── */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {isHe ? 'הוסף פעולה' : 'Add Action'}
              </motion.button>
            </div>

            {/* ── CURRENT PHASE ROADMAP ── */}
            {plan && (
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                {/* Phase header */}
                <div className="px-4 py-3 border-b border-border/30">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{phaseLabel}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground">
                        {isHe ? `שלב ${phaseLabel} — משימות היום` : `Phase ${phaseLabel} — Today's Missions`}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {phaseCompleted}/{phaseTotal} {isHe ? 'אבני דרך' : 'milestones'} · {phasePct}%
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mt-2.5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: 0 }}
                      animate={{ width: `${phasePct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Milestones by pillar */}
                <div className="px-4 py-3 space-y-3">
                  {phaseTotal === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {isHe ? 'אין אבני דרך בשלב הנוכחי' : 'No milestones in this phase'}
                    </p>
                  ) : (
                    Object.entries(pillarGroups).map(([pillarKey, pMilestones]) => {
                      const domain = getDomainById(pillarKey);
                      const Icon = domain?.icon;
                      const pillarDone = pMilestones.filter((m: any) => m.is_completed).length;

                      return (
                        <div key={pillarKey} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center">
                              {Icon ? <Icon className="w-3.5 h-3.5 text-foreground/60" /> : <Zap className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <span className="text-xs font-bold text-foreground/80 flex-1">
                              {isHe ? (domain?.labelHe || pillarKey) : (domain?.labelEn || pillarKey)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {pillarDone}/{pMilestones.length}
                            </span>
                          </div>

                          <div className="space-y-0.5 ps-3">
                            {pMilestones.map((m: any) => (
                              <div key={m.id} className={cn(
                                "flex items-start gap-2 py-1.5 px-2 rounded-lg",
                                m.is_completed ? "opacity-50" : "hover:bg-muted/20 transition-colors"
                              )}>
                                {m.is_completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-xs leading-snug",
                                    m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                                  )}>
                                    {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                                  </p>
                                  {m.goal && (
                                    <span className="text-[10px] text-muted-foreground/50 leading-tight block mt-0.5">
                                      {isHe ? m.goal : (m.goal_en || m.goal)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Remaining queue count */}
            {queue.length > 1 && (
              <p className="text-xs text-muted-foreground text-center">
                {isHe ? `עוד ${queue.length - 1} פעולות בתור` : `${queue.length - 1} more actions in queue`}
              </p>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddItemWizard open={wizardOpen} onOpenChange={setWizardOpen} hub="core" />
      <ExecutionModal
        open={executionOpen}
        onOpenChange={setExecutionOpen}
        action={executionAction}
        onComplete={() => refetch()}
      />
    </div>
  );
}
