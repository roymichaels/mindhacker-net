/**
 * TacticsRoadmapSidebar — Left sidebar for Tactics page.
 * Shows this week's missions and milestones grouped by pillar.
 */
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircle2, Circle, Swords, PanelRightClose, PanelRightOpen,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getDomainById } from '@/navigation/lifeDomains';
import { motion, AnimatePresence } from 'framer-motion';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function TacticsRoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const { milestones, currentWeek: currentPhase, isLoading, hasLifePlan } = useLifePlanWithMilestones();

  // Get this phase's milestones
  const phaseMilestones = useMemo(() => {
    return milestones.filter(m => m.week_number === currentPhase);
  }, [milestones, currentPhase]);

  // Group by focus_area (pillar)
  const pillarGroups = useMemo(() => {
    const groups: Record<string, { milestones: any[]; completed: number; total: number }> = {};
    for (const m of phaseMilestones) {
      const key = m.focus_area || 'other';
      if (!groups[key]) groups[key] = { milestones: [], completed: 0, total: 0 };
      groups[key].milestones.push(m);
      groups[key].total++;
      if (m.is_completed) groups[key].completed++;
    }
    return groups;
  }, [phaseMilestones]);

  const pillarIds = Object.keys(pillarGroups);
  const totalMs = phaseMilestones.length;
  const completedMs = phaseMilestones.filter(m => m.is_completed).length;
  const phasePct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;
  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-destructive/15",
      collapsed
        ? "w-16 min-w-[64px]"
        : "w-full md:w-[280px] md:min-w-[220px] xl:w-[300px] fixed md:relative right-0 md:right-auto top-14 bottom-0 z-[55] md:z-auto md:top-auto bg-background md:bg-transparent"
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute top-2 z-10 p-1 rounded-md hover:bg-accent/20 transition-colors text-muted-foreground hover:text-foreground",
          collapsed
            ? "ltr:left-1/2 ltr:-translate-x-1/2 rtl:right-1/2 rtl:translate-x-1/2"
            : "ltr:left-2 rtl:right-2"
        )}
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed
          ? (isRTL ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />)
          : (isRTL ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />)
        }
      </button>

      {/* COLLAPSED */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 h-full pt-10 pb-3">
          <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <Swords className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-[9px] font-bold text-destructive">{phaseLabel}</span>
          <span className="text-[9px] font-bold text-primary">{phasePct}%</span>
          <div className="flex flex-col items-center gap-0.5 mt-1">
            {phaseMilestones.map(m => (
              <div key={m.id} className={cn(
                "w-2 h-2 rounded-full",
                m.is_completed ? "bg-primary" : "bg-muted-foreground/20"
              )} />
            ))}
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full pt-8 pb-0">
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <Swords className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {isHe ? `שלב ${phaseLabel} — משימות השלב` : `Phase ${phaseLabel} — Weekly Tasks`}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {completedMs}/{totalMs} {isHe ? 'אבני דרך' : 'milestones'}
                </p>
              </div>
            </div>

            <div className="mb-2">
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${phasePct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasLifePlan || totalMs === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-4 px-2">
                <p className="text-xs text-muted-foreground">
                  {isHe ? 'אין משימות לשלב הנוכחי' : 'No tasks for current phase'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {pillarIds.map((pillarKey) => {
                  const group = pillarGroups[pillarKey];
                  const domain = getDomainById(pillarKey);
                  const Icon = domain?.icon;
                  const isExpanded = expandedPillar === pillarKey;
                  const pillarPct = group.total > 0 ? Math.round((group.completed / group.total) * 100) : 0;

                  return (
                    <div key={pillarKey} className="rounded-lg border border-border/30 overflow-hidden">
                      <button
                        onClick={() => setExpandedPillar(isExpanded ? null : pillarKey)}
                        className="w-full flex items-center gap-2.5 p-2.5 text-start hover:bg-muted/20 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                          {Icon ? <Icon className="w-3.5 h-3.5 text-destructive" /> : <Swords className="w-3.5 h-3.5 text-destructive" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-foreground">
                            {isHe ? (domain?.labelHe || pillarKey) : (domain?.labelEn || pillarKey)}
                          </span>
                          <div className="h-1 rounded-full bg-muted/40 overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-destructive/50 transition-all" style={{ width: `${pillarPct}%` }} />
                          </div>
                        </div>
                        <span className="text-[9px] text-muted-foreground shrink-0">{group.completed}/{group.total}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden"
                          >
                            <div className="px-2.5 pb-2.5 space-y-0.5">
                              {group.milestones.map((m) => (
                                <div key={m.id} className={cn(
                                  "flex items-start gap-2 p-1.5 rounded-md",
                                  m.is_completed ? "opacity-60" : ""
                                )}>
                                  {m.is_completed ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                                  )}
                                  <span className={cn(
                                    "text-[11px] leading-snug",
                                    m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                                  )}>
                                    {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                                  </span>
                                </div>
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
        </div>
      )}
    </aside>
  );
}
