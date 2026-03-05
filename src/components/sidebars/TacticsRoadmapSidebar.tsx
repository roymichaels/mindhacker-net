/**
 * TacticsRoadmapSidebar — Right sidebar for Tactics page.
 * Shows all 10 phases (A-J) as a vertical timeline roadmap.
 * Current phase is auto-expanded with milestones grouped by pillar.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircle2, Circle, Swords, PanelLeftClose, PanelLeftOpen,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById } from '@/navigation/lifeDomains';
import { motion, AnimatePresence } from 'framer-motion';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const TOTAL_PHASES = 10;

export function TacticsRoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);

  const { milestones, currentWeek: currentPhase, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(currentPhase || 1);

  // Group milestones by phase (week_number)
  const phaseGroups = useMemo(() => {
    const groups: Record<number, { milestones: any[]; completed: number; total: number }> = {};
    for (let i = 1; i <= TOTAL_PHASES; i++) {
      groups[i] = { milestones: [], completed: 0, total: 0 };
    }
    for (const m of milestones) {
      const phase = m.week_number || 1;
      if (!groups[phase]) groups[phase] = { milestones: [], completed: 0, total: 0 };
      groups[phase].milestones.push(m);
      groups[phase].total++;
      if (m.is_completed) groups[phase].completed++;
    }
    return groups;
  }, [milestones]);

  // Group milestones within a phase by pillar
  const groupByPillar = (phaseMilestones: any[]) => {
    const grouped: Record<string, any[]> = {};
    for (const m of phaseMilestones) {
      const key = m.focus_area || 'other';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    }
    return grouped;
  };

  const totalMs = milestones.length;
  const completedMs = milestones.filter(m => m.is_completed).length;
  const overallPct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-e rtl:border-s border-border/50 dark:border-destructive/15",
      collapsed
        ? "w-16 min-w-[64px]"
        : "w-full md:w-[280px] md:min-w-[220px] xl:w-[300px] fixed md:relative left-0 md:left-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:right-2 rtl:left-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />)
          : (isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />)
        }
      </button>

      {/* COLLAPSED */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1.5 h-full pt-10 pb-3">
          <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <Swords className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-[9px] font-bold text-primary">{overallPct}%</span>
          <div className="flex flex-col items-center gap-0.5 mt-1 overflow-y-auto scrollbar-hide">
            {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map(phase => {
              const group = phaseGroups[phase];
              const isCurrent = phase === currentPhase;
              const phasePct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
              const isDone = phasePct === 100 && group.total > 0;
              return (
                <div key={phase} className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition-colors",
                  isCurrent
                    ? "bg-destructive/20 border-destructive/30 text-destructive"
                    : isDone
                      ? "bg-primary/20 border-primary/30 text-primary"
                      : group.total > 0
                        ? "bg-muted/30 border-border/20 text-muted-foreground"
                        : "bg-muted/10 border-border/10 text-muted-foreground/30"
                )}>
                  {PHASE_LABELS[phase - 1]}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full pt-8 pb-0">
          {/* Header */}
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <Swords className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground">
                  {isHe ? 'מפת דרכים — 100 יום' : '100-Day Roadmap'}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {completedMs}/{totalMs} {isHe ? 'אבני דרך' : 'milestones'} · {overallPct}%
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasLifePlan ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-8 px-2">
                <p className="text-xs text-muted-foreground">
                  {isHe ? 'צור תוכנית מעמוד האסטרטגיה' : 'Create a plan from Strategy'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map(phase => {
                  const group = phaseGroups[phase];
                  const isCurrent = phase === currentPhase;
                  const isExp = expandedPhase === phase;
                  const phasePct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;
                  const isDone = phasePct === 100 && group.total > 0;
                  const pillarGroups = groupByPillar(group.milestones);

                  return (
                    <div key={phase}>
                      <button
                        onClick={() => setExpandedPhase(isExp ? null : phase)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-start",
                          isCurrent
                            ? "bg-destructive/10 border border-destructive/20"
                            : "hover:bg-muted/20 border border-transparent"
                        )}
                      >
                        {/* Phase dot / line */}
                        <div className="flex flex-col items-center w-6 shrink-0">
                          <div className={cn(
                            "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                            isDone
                              ? "bg-primary/20 text-primary"
                              : isCurrent
                                ? "bg-destructive/20 text-destructive"
                                : "bg-muted/30 text-muted-foreground/50"
                          )}>
                            {PHASE_LABELS[phase - 1]}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-xs font-semibold",
                              isCurrent ? "text-destructive" : isDone ? "text-primary" : "text-foreground/60"
                            )}>
                              {isHe ? `שלב ${PHASE_LABELS[phase - 1]}` : `Phase ${PHASE_LABELS[phase - 1]}`}
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-bold">
                                NOW
                              </span>
                            )}
                          </div>
                          {group.total > 0 && (
                            <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1">
                              <div className={cn(
                                "h-full rounded-full transition-all",
                                isDone ? "bg-primary/60" : "bg-destructive/50"
                              )} style={{ width: `${phasePct}%` }} />
                            </div>
                          )}
                        </div>

                        <span className="text-[9px] text-muted-foreground shrink-0">
                          {group.total > 0 ? `${group.completed}/${group.total}` : '—'}
                        </span>
                        {group.total > 0 && (
                          isExp ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>

                      {/* Expanded milestones grouped by pillar */}
                      <AnimatePresence>
                        {isExp && group.total > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="ps-8 pe-2 pb-2 space-y-1.5 pt-1">
                              {Object.entries(pillarGroups).map(([pillarKey, pMilestones]) => {
                                const domain = getDomainById(pillarKey);
                                const Icon = domain?.icon;
                                return (
                                  <div key={pillarKey}>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <div className="w-5 h-5 rounded bg-muted/30 flex items-center justify-center">
                                        {Icon ? <Icon className="w-3 h-3 text-muted-foreground" /> : <Swords className="w-3 h-3 text-muted-foreground" />}
                                      </div>
                                      <span className="text-[10px] font-semibold text-muted-foreground">
                                        {isHe ? (domain?.labelHe || pillarKey) : (domain?.labelEn || pillarKey)}
                                      </span>
                                    </div>
                                    {pMilestones.map((m: any) => (
                                      <div key={m.id} className={cn(
                                        "flex items-start gap-1.5 ps-6 py-0.5",
                                        m.is_completed ? "opacity-50" : ""
                                      )}>
                                        {m.is_completed ? (
                                          <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                        ) : (
                                          <Circle className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-0.5" />
                                        )}
                                        <span className={cn(
                                          "text-[10px] leading-snug",
                                          m.is_completed ? "line-through text-muted-foreground" : "text-foreground/70"
                                        )}>
                                          {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Connector line between phases */}
                      {phase < TOTAL_PHASES && (
                        <div className="flex justify-start ps-[22px]">
                          <div className={cn(
                            "w-px h-2",
                            phase < (currentPhase || 1) ? "bg-primary/30" : "bg-border/30"
                          )} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
