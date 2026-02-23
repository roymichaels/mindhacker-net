/**
 * CoreActivitySidebar - Left sidebar with core feature stats + roadmap.
 * Rose/pink color scheme matching Core identity.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  PanelLeftClose, PanelLeftOpen, Flame, CheckCircle2, Circle,
  Target, Trophy, Zap, Brain, Clock, Calendar, Loader2,
} from 'lucide-react';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';
import { useStrategyPlans } from '@/hooks/useStrategyPlans';
import { useHabits, useSessionsToday } from '@/hooks/useActionItems';
import { motion } from 'framer-motion';
import { MilestoneDetailModal } from '@/components/dashboard/MilestoneDetailModal';

export function LifeActivitySidebar() {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const { statusMap } = useLifeDomains();
  const { corePlan, coreStrategy, coreWeek, isLoading } = useStrategyPlans();
  const { data: habits } = useHabits();
  const { data: sessionsToday } = useSessionsToday();
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);

  const coreDomainIds = CORE_DOMAINS.map(d => d.id);
  const coreEntries = Object.entries(statusMap).filter(([id]) => coreDomainIds.includes(id));
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = coreEntries.filter(([, s]) => s === 'active').length;

  // Real stats from features
  const coreHabits = (habits || []).filter(h => {
    const pillar = (h as any).pillar;
    return !pillar || coreDomainIds.includes(pillar);
  });
  const completedHabits = coreHabits.filter(h => h.status === 'done').length;
  const totalHabits = coreHabits.length;

  // Milestones from strategy
  const milestones = coreStrategy?.weeks || [];
  const currentWeek = coreWeek || 1;
  const totalWeeks = milestones.length || 12;
  const completedWeeks = milestones.filter((_, i) => i + 1 < currentWeek).length;
  const progressPct = Math.round((completedWeeks / totalWeeks) * 100);

  // Pillar goals from strategy
  const pillarGoals = coreStrategy?.pillars || {};
  const totalGoals = Object.values(pillarGoals).reduce((sum, p) => sum + (p.goals?.length || 0), 0);

  const statItems = [
    { icon: Flame, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים פעילים' : 'Active Pillars', color: 'text-rose-400' },
    { icon: Target, value: totalGoals, label: isHe ? 'מטרות' : 'Goals', color: 'text-teal-400' },
    { icon: Brain, value: `${completedHabits}/${totalHabits}`, label: isHe ? 'הרגלים היום' : 'Habits Today', color: 'text-indigo-400' },
    { icon: Zap, value: sessionsToday || 0, label: isHe ? 'סשנים היום' : 'Sessions', color: 'text-amber-400' },
  ];

  return (
    <>
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
          "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
          "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
          "ltr:border-e rtl:border-s border-border/50 dark:border-rose-500/15",
          collapsed ? "w-[54px] min-w-[54px]" : "fixed inset-0 z-50 w-full lg:relative lg:inset-auto lg:z-auto lg:w-[280px] xl:w-[300px]"
        )}
      >
        {/* Collapse toggle */}
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

        {/* ===== COLLAPSED MINI VIEW ===== */}
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
            {/* Mini roadmap dots */}
            <div className="flex flex-col items-center gap-1 mt-2">
              {milestones.slice(0, 12).map((w, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-colors",
                    i + 1 < currentWeek ? "bg-rose-400" :
                    i + 1 === currentWeek ? "bg-rose-400/50 ring-2 ring-rose-400/30" :
                    "bg-muted-foreground/20"
                  )}
                />
              ))}
              <span className="text-[9px] font-bold text-rose-400">{progressPct}%</span>
            </div>
          </div>
        )}

        {/* ===== EXPANDED FULL VIEW ===== */}
        {!collapsed && (
          <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
            {/* Stats */}
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

            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent mb-3" />

            {/* Roadmap */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <Trophy className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {isHe ? 'מפת דרכים — ליבה' : 'Roadmap — Core'}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {isHe ? `שבוע ${currentWeek}/12` : `Week ${currentWeek}/12`}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>{isHe ? 'התקדמות' : 'Progress'}</span>
                <span className="font-bold text-rose-400">{progressPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-rose-500/20 to-transparent mb-2" />

            {/* Weekly timeline */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : !corePlan ? (
                <div className="flex flex-col items-center justify-center gap-2 text-center py-4 px-2">
                  <Calendar className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    {isHe ? 'אין תוכנית ליבה פעילה. צור תוכנית מהדאשבורד.' : 'No Core plan active. Generate from dashboard.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {milestones.map((week, idx) => {
                    const weekNum = week.week || idx + 1;
                    const isPast = weekNum < currentWeek;
                    const isCurrent = weekNum === currentWeek;

                    return (
                      <div key={idx} className="relative">
                        {idx < milestones.length - 1 && (
                          <div className={cn(
                            "absolute top-6 ltr:left-[11px] rtl:right-[11px] w-0.5 h-[calc(100%-4px)]",
                            isPast ? "bg-rose-400/40" : "bg-muted-foreground/15"
                          )} />
                        )}
                        <div
                          className={cn(
                            "relative flex items-start gap-2 p-2 rounded-lg transition-all",
                            isCurrent && "bg-rose-500/10 border border-rose-500/20",
                            isPast && "opacity-70",
                            !isCurrent && !isPast && "hover:bg-muted/30"
                          )}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isPast ? (
                              <CheckCircle2 className="w-[18px] h-[18px] text-rose-400" />
                            ) : isCurrent ? (
                              <div className="w-[18px] h-[18px] rounded-full border-2 border-rose-400 bg-rose-400/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              </div>
                            ) : (
                              <Circle className="w-[18px] h-[18px] text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className={cn(
                                "text-[10px] font-bold",
                                isCurrent ? "text-rose-400" : "text-muted-foreground"
                              )}>
                                W{weekNum}
                              </span>
                              {isCurrent && (
                                <span className="text-[8px] px-1 py-0.5 rounded-full bg-rose-400/20 text-rose-400 font-bold">
                                  {isHe ? 'עכשיו' : 'NOW'}
                                </span>
                              )}
                            </div>
                            <p className={cn(
                              "text-[11px] leading-tight mt-0.5",
                              isPast && "line-through",
                              isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                              {isHe ? week.theme_he : week.theme_en}
                            </p>
                            {week.pillar_focus?.length > 0 && (
                              <span className="text-[9px] text-muted-foreground/60 mt-0.5 block">
                                {week.pillar_focus.join(' · ')}
                              </span>
                            )}
                          </div>
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

      <MilestoneDetailModal
        open={!!selectedMilestone}
        onOpenChange={(o) => !o && setSelectedMilestone(null)}
        milestone={selectedMilestone}
      />
    </>
  );
}
