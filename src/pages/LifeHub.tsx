/**
 * LifeHub — Strategy page (אסטרטגיה).
 * Same layout style as Tactics/Now.
 * Roadmap section shows the FULL 100-day plan (all 10 phases A-J).
 */
import { useState, useMemo } from 'react';
import { Flame, Sparkles, Target, CheckCircle2, Circle, Trophy, MapPin, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { StrategyPillarWizard } from '@/components/strategy/StrategyPillarWizard';
import { getDomainById, CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useQueryClient } from '@tanstack/react-query';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const TOTAL_PHASES = 10;

export default function LifeHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { plan, milestones, isLoading, currentWeek: currentPhase } = useLifePlanWithMilestones();
  const hasPlan = !!plan;
  const queryClient = useQueryClient();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

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

  // Overall progress
  const allCompleted = milestones.filter(m => m.is_completed).length;
  const allTotal = milestones.length || 1;
  const overallPct = Math.round((allCompleted / allTotal) * 100);

  // Phase groups for full 100-day roadmap
  const phaseGroups = useMemo(() => {
    const map = new Map<number, { phase: number; label: string; milestones: any[]; completed: number; total: number; focusAreas: string[] }>();
    for (const m of milestones) {
      const p = m.week_number;
      if (!map.has(p)) {
        map.set(p, { phase: p, label: PHASE_LABELS[p - 1] || String(p), milestones: [], completed: 0, total: 0, focusAreas: [] });
      }
      const g = map.get(p)!;
      g.total++;
      if (m.is_completed) g.completed++;
      g.milestones.push(m);
      const area = isHe ? m.focus_area : (m.focus_area_en || m.focus_area);
      if (area && !g.focusAreas.includes(area)) g.focusAreas.push(area);
    }
    for (let p = 1; p <= TOTAL_PHASES; p++) {
      if (!map.has(p)) {
        map.set(p, { phase: p, label: PHASE_LABELS[p - 1] || String(p), milestones: [], completed: 0, total: 0, focusAreas: [] });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.phase - b.phase);
  }, [milestones, isHe]);

  const statItems = [
    { icon: Flame, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
  ];

  const handlePlanGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['life-plan'] });
    queryClient.invalidateQueries({ queryKey: ['now-engine'] });
    queryClient.invalidateQueries({ queryKey: ['all-active-plans'] });
  };

  return (
    <div className="flex flex-col w-full items-center min-h-[60vh] pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
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

            {/* ── Recalibrate ── */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWizardOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isHe ? 'כיול מחדש' : 'Recalibrate'}
              </motion.button>
            </div>

            {/* ── FULL 100-DAY ROADMAP ── */}
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">
                      {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {allCompleted}/{allTotal} {isHe ? 'אבני דרך' : 'milestones'} · {overallPct}%
                    </p>
                  </div>
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

              {/* Phase timeline */}
              <div className="px-4 py-3 space-y-0.5">
                {phaseGroups.map((g, idx) => {
                  const isDone = g.total > 0 && g.completed === g.total;
                  const isCurrent = g.phase === currentPhase;
                  const isPast = (currentPhase || 0) > g.phase;
                  const isExpanded = expandedPhase === g.phase;
                  const phasePct = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;

                  return (
                    <div key={g.phase} className="relative">
                      {/* Connecting line */}
                      {idx < phaseGroups.length - 1 && (
                        <div className={cn(
                          "absolute top-7 start-[11px] w-0.5",
                          isExpanded ? "h-[calc(100%-8px)]" : "h-[calc(100%-4px)]",
                          isDone || isPast ? "bg-primary/40" : "bg-muted-foreground/15"
                        )} />
                      )}

                      <button
                        onClick={() => setExpandedPhase(isExpanded ? null : g.phase)}
                        className={cn(
                          "relative w-full flex items-start gap-2 p-2 rounded-lg text-start transition-all",
                          isCurrent && "bg-primary/10 border border-primary/20",
                          !isCurrent && !isDone && "hover:bg-muted/30",
                          isDone && "opacity-80",
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-[18px] h-[18px] text-primary" />
                          ) : isCurrent ? (
                            <div className="w-[18px] h-[18px] rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            </div>
                          ) : (
                            <Circle className="w-[18px] h-[18px] text-muted-foreground/30" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("text-[10px] font-bold", isCurrent ? "text-primary" : "text-muted-foreground")}>
                              {isHe ? `שלב ${g.label}` : `Phase ${g.label}`}
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                                {isHe ? 'עכשיו' : 'NOW'}
                              </span>
                            )}
                            <span className="text-[9px] text-muted-foreground ms-auto">
                              {g.completed}/{g.total}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {g.focusAreas.slice(0, 3).map((area) => (
                              <span key={area} className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded-md",
                                isCurrent ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"
                              )}>
                                {area}
                              </span>
                            ))}
                            {g.focusAreas.length > 3 && (
                              <span className="text-[9px] text-muted-foreground/60">+{g.focusAreas.length - 3}</span>
                            )}
                          </div>
                          {g.total > 0 && (
                            <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1.5">
                              <div className={cn("h-full rounded-full transition-all", isDone ? "bg-primary" : "bg-primary/50")} style={{ width: `${phasePct}%` }} />
                            </div>
                          )}
                        </div>

                        {g.total > 0 && (
                          <div className="mt-1 shrink-0">
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        )}
                      </button>

                      {/* Expanded milestones */}
                      <AnimatePresence>
                        {isExpanded && g.milestones.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ps-7 pe-1 py-1 space-y-0.5">
                              {g.milestones.map((m: any) => {
                                const domain = getDomainById(m.focus_area);
                                const Icon = domain?.icon;
                                return (
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
