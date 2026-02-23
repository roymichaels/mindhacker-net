/**
 * RoadmapSidebar — Right sidebar showing 90-day plan milestones timeline.
 * Displays weekly milestones with completion status, current week highlight.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  RefreshCw, ChevronRight, ChevronLeft, CheckCircle2, Circle,
  Target, Calendar, Trophy, PanelLeftClose, PanelLeftOpen,
  Loader2, Sparkles,
} from 'lucide-react';
import { useLifePlanWithMilestones, useCompleteMilestone } from '@/hooks/useLifePlan';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function RoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1280);
  const [recalibrating, setRecalibrating] = useState(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { plan, milestones, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const completeMutation = useCompleteMilestone();

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length || 12;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const handleRecalibrate = async () => {
    if (!user?.id || recalibrating) return;
    setRecalibrating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase.functions.invoke('generate-pillar-synthesis', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['life-plan'] }),
        queryClient.invalidateQueries({ queryKey: ['milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['launchpad-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['current-week-milestone'] }),
        queryClient.invalidateQueries({ queryKey: ['unified-dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['life-plan-milestones'] }),
        queryClient.invalidateQueries({ queryKey: ['daily-roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['action-items'] }),
      ]);
      toast.success(isHe ? '✨ התוכנית חושבה מחדש!' : '✨ Plan recalculated!');
    } catch (e) {
      console.error('Recalibration failed:', e);
      toast.error(isHe ? 'שגיאה בכיול מחדש' : 'Recalibration failed');
    } finally {
      setRecalibrating(false);
    }
  };

  return (
    <>
      <aside className={cn(
        "hidden lg:flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
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
              {milestones.slice(0, 12).map((m, i) => (
                <div
                  key={m.id}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    m.is_completed ? "bg-primary" :
                    m.week_number === currentWeek ? "bg-primary/50 ring-2 ring-primary/30" :
                    "bg-muted-foreground/20"
                  )}
                  title={`W${m.week_number}: ${isHe ? m.title : (m.title_en || m.title)}`}
                />
              ))}
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
                  {isHe ? 'תוכנית 90 יום' : '90-Day Plan'}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? `שבוע ${currentWeek}/12` : `Week ${currentWeek}/12`}
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

            {/* Milestones list */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !hasLifePlan ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-2">
                <Calendar className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  {isHe ? 'אין תוכנית פעילה. צור תוכנית 90 יום מהדאשבורד.' : 'No active plan. Generate a 90-day strategy from the dashboard.'}
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-0.5">
                {milestones.map((m, idx) => {
                  const isCurrent = m.week_number === currentWeek;
                  const isPast = m.week_number < currentWeek;
                  const isDone = m.is_completed;

                  return (
                    <div key={m.id} className="relative">
                      {/* Timeline line */}
                      {idx < milestones.length - 1 && (
                        <div className={cn(
                          "absolute top-6 ltr:left-[11px] rtl:right-[11px] w-0.5 h-[calc(100%-4px)]",
                          isDone ? "bg-primary/40" : "bg-muted-foreground/15"
                        )} />
                      )}

                      <button
                        onClick={() => {
                          if (!isDone && isCurrent && plan?.id) {
                            completeMutation.mutate({ milestoneId: m.id, planId: plan.id });
                          }
                        }}
                        disabled={isDone || !isCurrent}
                        className={cn(
                          "relative w-full flex items-start gap-2 p-2 rounded-lg text-start transition-all",
                          isCurrent && !isDone && "bg-primary/10 border border-primary/20",
                          isDone && "opacity-70",
                          !isCurrent && !isDone && "hover:bg-muted/30"
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
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "text-[10px] font-bold",
                              isCurrent ? "text-primary" : "text-muted-foreground"
                            )}>
                              W{m.week_number}
                            </span>
                            {isCurrent && (
                              <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                                {isHe ? 'עכשיו' : 'NOW'}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-[11px] leading-tight mt-0.5",
                            isDone && "line-through",
                            isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {isHe ? m.title : (m.title_en || m.title)}
                          </p>
                          {(m.focus_area || m.focus_area_en) && (
                            <span className="text-[9px] text-muted-foreground/60 mt-0.5 block">
                              {isHe ? m.focus_area : (m.focus_area_en || m.focus_area)}
                            </span>
                          )}
                        </div>
                      </button>
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
    </>
  );
}
