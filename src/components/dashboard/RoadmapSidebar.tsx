/**
 * RoadmapSidebar — Right sidebar showing 100-day plan with 10 phases (A-J).
 * Groups milestones by phase, showing high-level phase focus areas.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  RefreshCw, ChevronDown, ChevronUp, CheckCircle2, Circle,
  Target, Calendar, Trophy, PanelLeftClose, PanelLeftOpen,
  Loader2,
} from 'lucide-react';
import { useLifePlanWithMilestones, useCompleteMilestone } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneDetailModal } from './MilestoneDetailModal';


const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const TOTAL_PHASES = 10;

interface PhaseGroup {
  phase: number;
  label: string;
  focusAreas: string[];
  total: number;
  completed: number;
  milestones: any[];
}

export function RoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1280);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { plan, milestones, currentWeek: currentPhase, isLoading, hasLifePlan } = useLifePlanWithMilestones();

  // Group milestones by phase (using week_number as phase_number)
  const phaseGroups = useMemo<PhaseGroup[]>(() => {
    const map = new Map<number, PhaseGroup>();
    for (const m of milestones) {
      const p = m.week_number; // week_number = phase_number
      if (!map.has(p)) {
        const label = PHASE_LABELS[p - 1] || String(p);
        map.set(p, { phase: p, label, focusAreas: [], total: 0, completed: 0, milestones: [] });
      }
      const g = map.get(p)!;
      g.total++;
      if (m.is_completed) g.completed++;
      g.milestones.push(m);
      const area = isHe ? m.focus_area : (m.focus_area_en || m.focus_area);
      if (area && !g.focusAreas.includes(area)) g.focusAreas.push(area);
    }
    // Fill missing phases 1-10
    for (let p = 1; p <= TOTAL_PHASES; p++) {
      if (!map.has(p)) {
        const label = PHASE_LABELS[p - 1] || String(p);
        map.set(p, { phase: p, label, focusAreas: [], total: 0, completed: 0, milestones: [] });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.phase - b.phase);
  }, [milestones, isHe]);

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const { generateStrategy, isGenerating: recalibrating } = useStrategyPlans();

  const handleRecalibrate = async () => {
    if (!user?.id || recalibrating) return;
    try {
      await generateStrategy.mutateAsync({ hub: 'both', forceRegenerate: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['life-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['current-week-milestone'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['life-plan-milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['action-items'] }),
        queryClient.invalidateQueries({ queryKey: ['strategy-plans'] }),
      ]);
    } catch (e) {
      console.error('Recalibration failed:', e);
      toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
    }
  };

  return (
    <>
      <aside className={cn(
        "hidden lg:flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
        "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
        "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
        "border-s border-border/50 dark:border-primary/15",
        collapsed ? "w-14 min-w-[56px]" : "w-[260px] xl:w-[280px]"
      )}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
            collapsed ? "left-1/2 -translate-x-1/2" : "ltr:right-2 rtl:left-2"
          )}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed
            ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
            : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
          }
        </button>

        {/* ===== COLLAPSED ===== */}
        {collapsed && (
          <div className="flex flex-col items-center gap-2 h-full pt-8 pb-3">
            <Target className="w-4 h-4 text-primary" />
            <div className="flex-1 flex flex-col items-center justify-center gap-1">
              {phaseGroups.map((g) => {
                const isDone = g.total > 0 && g.completed === g.total;
                const isCurrent = g.phase === currentPhase;
                return (
                  <div
                    key={g.phase}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-colors",
                      isDone ? "bg-primary" :
                      isCurrent ? "bg-primary/50 ring-2 ring-primary/30" :
                      "bg-muted-foreground/20"
                    )}
                    title={`Phase ${g.label}: ${g.focusAreas.join(', ')}`}
                  />
                );
              })}
            </div>
            <span className="text-[9px] font-bold text-primary">{progressPct}%</span>
            <button
              onClick={handleRecalibrate}
              disabled={recalibrating}
              className="p-2 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
              title={isHe ? 'כיול מחדש' : 'Recalibrate'}
            >
              {recalibrating
                ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5 text-primary" />
              }
            </button>
          </div>
        )}

        {/* ===== EXPANDED ===== */}
        {!collapsed && (
          <div className="flex flex-col h-full pt-8 pb-3 px-3 overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? `שלב ${PHASE_LABELS[(currentPhase || 1) - 1] || '?'}/${TOTAL_PHASES}` : `Phase ${PHASE_LABELS[(currentPhase || 1) - 1] || '?'}/${TOTAL_PHASES}`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>{isHe ? 'התקדמות' : 'Progress'}</span>
                <span className="font-bold text-primary">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 text-center">
                {completedCount}/{totalCount} {isHe ? 'אבני דרך' : 'milestones'}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-2" />

            {/* Phase milestones */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasLifePlan ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-2">
                <Calendar className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  {isHe ? 'אין תוכנית פעילה. צור תוכנית 100 יום מהדאשבורד.' : 'No active plan. Generate a 100-day strategy from the dashboard.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-0.5">
                {phaseGroups.map((g, idx) => {
                  const isDone = g.total > 0 && g.completed === g.total;
                  const isCurrent = g.phase === currentPhase;
                  const isPast = g.phase < currentPhase;
                  const isExpanded = expandedPhase === g.phase;
                  const phasePct = g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0;

                  return (
                    <div key={g.phase} className="relative">
                      {/* Timeline line */}
                      {idx < phaseGroups.length - 1 && (
                        <div className={cn(
                          "absolute top-7 ltr:left-[11px] rtl:right-[11px] w-0.5",
                          isExpanded ? "h-[calc(100%-8px)]" : "h-[calc(100%-4px)]",
                          isDone || isPast ? "bg-primary/40" : "bg-muted-foreground/15"
                        )} />
                      )}

                      {/* Phase header */}
                      <button
                        onClick={() => setExpandedPhase(isExpanded ? null : g.phase)}
                        className={cn(
                          "relative w-full flex items-start gap-2 p-2 rounded-lg text-start transition-all",
                          isCurrent && "bg-primary/10 border border-primary/20",
                          !isCurrent && !isDone && "hover:bg-muted/30",
                          isDone && "opacity-80",
                        )}
                      >
                        {/* Node */}
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

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-[10px] font-bold",
                              isCurrent ? "text-primary" : "text-muted-foreground"
                            )}>
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
                          {/* Focus areas as tags */}
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
                              <span className="text-[9px] text-muted-foreground/60">
                                +{g.focusAreas.length - 3}
                              </span>
                            )}
                          </div>
                          {/* Mini progress */}
                          {g.total > 0 && (
                            <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1.5">
                              <div
                                className={cn("h-full rounded-full transition-all", isDone ? "bg-primary" : "bg-primary/50")}
                                style={{ width: `${phasePct}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {g.total > 0 && (
                          <div className="mt-1 shrink-0">
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        )}
                      </button>

                      {/* Expanded: individual milestones */}
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
                              {g.milestones.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => setSelectedMilestone({
                                    id: m.id,
                                    title: isHe ? m.title : (m.title_en || m.title),
                                    goal: m.goal || null,
                                    focus_area: isHe ? m.focus_area : (m.focus_area_en || m.focus_area),
                                    week_number: m.week_number,
                                    month_number: m.month_number || Math.ceil(m.week_number / 3),
                                    is_completed: m.is_completed,
                                  })}
                                  className={cn(
                                    "w-full flex items-center gap-1.5 p-1.5 rounded-md text-start transition-colors hover:bg-muted/30",
                                    m.is_completed && "opacity-60"
                                  )}
                                >
                                  {m.is_completed
                                    ? <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                                    : <Circle className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                  }
                                  <span className={cn(
                                    "text-[10px] leading-tight line-clamp-2",
                                    m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                                  )}>
                                    {isHe ? m.title : (m.title_en || m.title)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-2 mb-2" />

            {/* Recalibrate */}
            <button
              onClick={handleRecalibrate}
              disabled={recalibrating}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all text-primary text-xs font-semibold disabled:opacity-50"
            >
              {recalibrating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5" />
              }
              <span>{recalibrating
                ? (isHe ? 'מחשב מחדש...' : 'Recalculating...')
                : (isHe ? 'כיול מחדש' : 'Recalibrate')
              }</span>
            </button>
          </div>
        )}
      </aside>

      <MilestoneDetailModal
        open={!!selectedMilestone}
        onOpenChange={(o) => !o && setSelectedMilestone(null)}
        milestone={selectedMilestone}
      />
    </>
  );
}
