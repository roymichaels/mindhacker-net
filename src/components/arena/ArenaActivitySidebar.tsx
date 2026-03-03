/**
 * ArenaActivitySidebar - Right sidebar with arena stats + phase-based roadmap.
 * Amber/orange color scheme.
 * Mirrors Dashboard's RoadmapSidebar style.
 */
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, Swords, CheckCircle2, Circle,
  Target, Trophy, FolderKanban, Briefcase, Calendar, Loader2, ChevronDown, ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useProjects } from '@/hooks/useProjects';
import { useMilestones } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MilestoneDetailModal } from '@/components/dashboard/MilestoneDetailModal';
import { DomainAssessModal } from '@/components/domain-assess/DomainAssessModal';
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

export function ArenaActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { arenaPlan, arenaStrategy, isLoading: stratLoading, generateStrategy, isGenerating: recalibrating } = useStrategyPlans();
  const { projects } = useProjects();
  const { data: allMilestones, isLoading: msLoading } = useMilestones(arenaPlan?.id || null);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isLoading = stratLoading || msLoading;

  const arenaDomainIds = CORE_DOMAINS.map(d => d.id);
  const arenaEntries = Object.entries(statusMap).filter(([id]) => arenaDomainIds.includes(id));
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = arenaEntries.filter(([, s]) => s === 'active' || s === 'configured').length;

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const getCurrentPhase = () => {
    if (!arenaPlan?.start_date) return 1;
    const start = new Date(arenaPlan.start_date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(TOTAL_PHASES, Math.max(1, Math.ceil((diffDays + 1) / 10)));
  };
  const currentPhase = getCurrentPhase();

  const phaseGroups = useMemo<PhaseGroup[]>(() => {
    const map = new Map<number, PhaseGroup>();
    for (const m of (allMilestones || [])) {
      const p = m.week_number;
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
    for (let p = 1; p <= TOTAL_PHASES; p++) {
      if (!map.has(p)) {
        const label = PHASE_LABELS[p - 1] || String(p);
        map.set(p, { phase: p, label, focusAreas: [], total: 0, completed: 0, milestones: [] });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.phase - b.phase);
  }, [allMilestones, isHe]);

  const completedCount = (allMilestones || []).filter(m => m.is_completed).length;
  const totalCount = (allMilestones || []).length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const pillarGoals = arenaStrategy?.pillars || {};
  const totalGoals = Object.values(pillarGoals).reduce((sum: number, p: any) => sum + (p.goals?.length || 0), 0);

  const statItems = [
    { icon: Swords, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים פעילים' : 'Active Pillars', color: 'text-amber-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: FolderKanban, value: activeProjects, label: isHe ? 'פרויקטים פעילים' : 'Active Projects', color: 'text-orange-400' },
    { icon: Briefcase, value: completedProjects, label: isHe ? 'הושלמו' : 'Completed', color: 'text-emerald-400' },
  ];

  const [assessDomainId, setAssessDomainId] = useState<string | null>(null);

  const handleRecalibrate = async () => {
    if (!user?.id || recalibrating) return;
    try {
      await generateStrategy.mutateAsync({ hub: 'arena', forceRegenerate: true });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['life-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['strategy-plans'] }),
      ]);
    } catch (e: any) {
      if (e?.missingPillars?.length) {
        const firstMissing = e.missingPillars[0]?.pillarId || e.missingPillars[0]?.pillar;
        if (firstMissing) setAssessDomainId(firstMissing);
        toast.info(isHe ? 'נדרשים נתונים חסרים לפני כיול מחדש' : 'Missing assessment data required before recalibration');
      } else {
        console.error('Recalibration failed:', e);
        toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
      }
    }
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 h-full overflow-y-auto scrollbar-hide transition-all duration-300 relative",
          "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
          "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
          "ltr:border-e rtl:border-s border-border/50 dark:border-amber-500/15",
          collapsed ? "w-[54px] min-w-[54px]" : "w-[280px] min-w-[220px] xl:w-[300px]"
        )}
      >
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

        {collapsed && (
          <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center gap-1 w-full">
              {statItems.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
                  <m.icon className={cn("w-4 h-4", m.color)} />
                  <span className="text-[10px] font-bold leading-none">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1 mt-2">
              {phaseGroups.map((g) => (
                <div
                  key={g.phase}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    g.phase < currentPhase ? "bg-amber-400" :
                    g.phase === currentPhase ? "bg-amber-400/50 ring-2 ring-amber-400/30" :
                    "bg-muted-foreground/20"
                  )}
                />
              ))}
              <span className="text-[9px] font-bold text-amber-400">{progressPct}%</span>
            </div>
            <button
              onClick={handleRecalibrate}
              disabled={recalibrating}
              className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors mt-2"
              title={isHe ? 'כיול מחדש' : 'Recalibrate'}
            >
              {recalibrating
                ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              }
            </button>
          </div>
        )}

        {!collapsed && (
          <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              {isHe ? 'סטטיסטיקה' : 'Stats'}
            </span>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {statItems.map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/40 dark:bg-muted/20 border border-border/30 p-1.5 flex flex-col items-center gap-0.5">
                  <m.icon className={cn("w-3.5 h-3.5", m.color)} />
                  <span className="text-sm font-bold leading-none">{m.value}</span>
                  <span className="text-[9px] text-muted-foreground text-center">{m.label}</span>
                </div>
              ))}
            </div>

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-3" />

            {/* Header — matching Dashboard style */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {isHe ? 'תוכנית 100 יום' : '100-Day Plan'}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? `שלב ${PHASE_LABELS[currentPhase - 1]}/${TOTAL_PHASES}` : `Phase ${PHASE_LABELS[currentPhase - 1]}/${TOTAL_PHASES}`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>{isHe ? 'התקדמות' : 'Progress'}</span>
                <span className="font-bold text-amber-400">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5 text-center">
                {completedCount}/{totalCount} {isHe ? 'אבני דרך' : 'milestones'}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-2" />

            {/* Phase timeline — matching Dashboard style */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : !arenaPlan || (allMilestones || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center py-4 px-2">
                  <Calendar className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {isHe ? 'אין תוכנית זירה פעילה. צור תוכנית מהדאשבורד.' : 'No Arena plan active. Generate from dashboard.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {phaseGroups.map((group, idx) => {
                    const isDone = group.total > 0 && group.completed === group.total;
                    const isPast = group.phase < currentPhase;
                    const isCurrent = group.phase === currentPhase;
                    const isExpanded = expandedPhase === group.phase;
                    const phasePct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;

                    return (
                      <div key={group.phase} className="relative">
                        {/* Timeline line */}
                        {idx < phaseGroups.length - 1 && (
                          <div className={cn(
                            "absolute top-7 ltr:left-[11px] rtl:right-[11px] w-0.5",
                            isExpanded ? "h-[calc(100%-8px)]" : "h-[calc(100%-4px)]",
                            isDone || isPast ? "bg-amber-400/40" : "bg-muted-foreground/15"
                          )} />
                        )}

                        {/* Phase header */}
                        <button
                          onClick={() => setExpandedPhase(isExpanded ? null : group.phase)}
                          className={cn(
                            "relative w-full flex items-start gap-2 p-2 rounded-lg text-start transition-all",
                            isCurrent && "bg-amber-500/10 border border-amber-500/20",
                            !isCurrent && !isDone && "hover:bg-muted/30",
                            isDone && "opacity-80",
                          )}
                        >
                          {/* Node */}
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-[18px] h-[18px] text-amber-400" />
                            ) : isCurrent ? (
                              <div className="w-[18px] h-[18px] rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
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
                                isCurrent ? "text-amber-400" : "text-muted-foreground"
                              )}>
                                {isHe ? `שלב ${group.label}` : `Phase ${group.label}`}
                              </span>
                              {isCurrent && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-bold">
                                  {isHe ? 'עכשיו' : 'NOW'}
                                </span>
                              )}
                              <span className="text-[9px] text-muted-foreground ms-auto">
                                {group.completed}/{group.total}
                              </span>
                            </div>
                            {/* Focus areas as tags */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {group.focusAreas.slice(0, 3).map((area) => (
                                <span key={area} className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-md",
                                  isCurrent ? "bg-amber-400/15 text-amber-400" : "bg-muted/60 text-muted-foreground"
                                )}>
                                  {area}
                                </span>
                              ))}
                              {group.focusAreas.length > 3 && (
                                <span className="text-[9px] text-muted-foreground/60">
                                  +{group.focusAreas.length - 3}
                                </span>
                              )}
                            </div>
                            {/* Mini progress */}
                            {group.total > 0 && (
                              <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1.5">
                                <div
                                  className={cn("h-full rounded-full transition-all", isDone ? "bg-amber-400" : "bg-amber-400/50")}
                                  style={{ width: `${phasePct}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {group.total > 0 && (
                            <div className="mt-1 shrink-0">
                              {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                            </div>
                          )}
                        </button>

                        {/* Expanded: individual milestones */}
                        <AnimatePresence>
                          {isExpanded && group.milestones.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ps-7 pe-1 py-1 space-y-0.5">
                                {group.milestones.map((m: any) => (
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
                                      ? <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
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
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mt-2 mb-2" />

            {/* Recalibrate */}
            <button
              onClick={handleRecalibrate}
              disabled={recalibrating}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-amber-400 text-xs font-semibold disabled:opacity-50"
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

      {assessDomainId && (
        <DomainAssessModal
          open={!!assessDomainId}
          onOpenChange={(o) => !o && setAssessDomainId(null)}
          domainId={assessDomainId}
        />
      )}
    </>
  );
}
