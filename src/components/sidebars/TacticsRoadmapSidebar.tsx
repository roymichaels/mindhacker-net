/**
 * TacticsRoadmapSidebar — Shows ONLY the current phase's weekly plan,
 * with milestones grouped by pillar.
 */
import { useMemo } from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  CheckCircle2, Circle, Swords, PanelLeftClose, PanelLeftOpen,
  Loader2,
} from 'lucide-react';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { getDomainById } from '@/navigation/lifeDomains';
import { motion } from 'framer-motion';

const PHASE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function TacticsRoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);

  const { milestones, currentWeek: currentPhase, isLoading, hasLifePlan } = useLifePlanWithMilestones();

  // Filter to ONLY current phase milestones
  const currentPhaseMilestones = useMemo(
    () => milestones.filter(m => m.week_number === currentPhase),
    [milestones, currentPhase]
  );

  // Group by pillar
  const pillarGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    for (const m of currentPhaseMilestones) {
      const key = m.focus_area || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  }, [currentPhaseMilestones]);

  const totalMs = currentPhaseMilestones.length;
  const completedMs = currentPhaseMilestones.filter(m => m.is_completed).length;
  const phasePct = totalMs > 0 ? Math.round((completedMs / totalMs) * 100) : 0;
  const phaseLabel = PHASE_LABELS[(currentPhase || 1) - 1] || '?';

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
        <div className="flex flex-col items-center gap-2 h-full pt-10 pb-3">
          <div className="p-1.5 rounded-lg bg-destructive/10 border border-destructive/20">
            <Swords className="w-4 h-4 text-destructive" />
          </div>
          <div className="w-7 h-7 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-destructive">{phaseLabel}</span>
          </div>
          <span className="text-[9px] font-bold text-primary">{phasePct}%</span>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full pt-8 pb-0">
          {/* Header — current phase info */}
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center justify-center">
                <span className="text-sm font-bold text-destructive">{phaseLabel}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground">
                  {isHe ? `שלב ${phaseLabel} — תוכנית 10 ימים` : `Phase ${phaseLabel} — 10-Day Plan`}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {completedMs}/{totalMs} {isHe ? 'אבני דרך' : 'milestones'} · {phasePct}%
                </p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden mb-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70"
                initial={{ width: 0 }}
                animate={{ width: `${phasePct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-destructive/20 to-transparent" />
          </div>

          {/* Milestones grouped by pillar */}
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
            ) : totalMs === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-8 px-2">
                <p className="text-xs text-muted-foreground">
                  {isHe ? 'אין אבני דרך בשלב הנוכחי' : 'No milestones in this phase'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {Object.entries(pillarGroups).map(([pillarKey, pMilestones]) => {
                  const domain = getDomainById(pillarKey);
                  const Icon = domain?.icon;
                  const pillarDone = pMilestones.filter((m: any) => m.is_completed).length;

                  return (
                    <div key={pillarKey} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-muted/40 border border-border/20 flex items-center justify-center">
                          {Icon ? <Icon className="w-3.5 h-3.5 text-foreground/60" /> : <Swords className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                        <span className="text-[11px] font-bold text-foreground/80 flex-1">
                          {isHe ? (domain?.labelHe || pillarKey) : (domain?.labelEn || pillarKey)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {pillarDone}/{pMilestones.length}
                        </span>
                      </div>

                      <div className="space-y-0.5 ps-3">
                        {pMilestones.map((m: any) => (
                          <div key={m.id} className={cn(
                            "flex items-start gap-2 py-1 px-2 rounded-md",
                            m.is_completed ? "opacity-50" : ""
                          )}>
                            {m.is_completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-[11px] leading-snug",
                                m.is_completed ? "line-through text-muted-foreground" : "text-foreground/80"
                              )}>
                                {isHe ? (m.title || m.title_en) : (m.title_en || m.title)}
                              </p>
                              {m.goal && (
                                <span className="text-[9px] text-muted-foreground/50 leading-tight block mt-0.5">
                                  {isHe ? m.goal : (m.goal_en || m.goal)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
