/**
 * DailyRoadmapSidebar — Left sidebar for Now (Dashboard) page.
 * Shows today's action queue as a checklist timeline.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Zap, PanelRightClose, PanelRightOpen,
  Loader2, CheckCircle2, Circle, ChevronDown,
} from 'lucide-react';
import { useNowEngine } from '@/hooks/useNowEngine';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { getDomainById } from '@/navigation/lifeDomains';
import { AnimatePresence, motion } from 'framer-motion';

export function DailyRoadmapSidebar() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [showCompleted, setShowCompleted] = useState(false);

  const { queue, isLoading } = useNowEngine();
  const { habits, completedCount: habitsCompleted, totalCount: habitsTotal } = useTodaysHabits();

  // Build unified daily items
  type DayItem = { id: string; title: string; type: 'action' | 'habit'; done: boolean; pillarId?: string; durationMin?: number; isTimeBased?: boolean };
  const items: DayItem[] = [];

  // Habits
  habits.forEach(h => {
    items.push({ id: h.id, title: h.title, type: 'habit', done: h.isCompleted });
  });

  // Queue actions
  queue.forEach((q, i) => {
    items.push({
      id: `q-${i}`,
      title: isHe ? q.title : q.titleEn,
      type: 'action',
      done: false,
      pillarId: q.pillarId,
      durationMin: q.durationMin,
      isTimeBased: q.isTimeBased,
    });
  });

  const pending = items.filter(i => !i.done);
  const completed = items.filter(i => i.done);
  const totalItems = items.length;
  const completedTotal = completed.length;
  const progressPct = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

  return (
    <aside className={cn(
      "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
      "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
      "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
      "ltr:border-s rtl:border-e border-border/50 dark:border-primary/15",
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
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[9px] font-bold text-primary">{completedTotal}/{totalItems}</span>
          <div className="flex flex-col items-center gap-0.5 mt-1">
            {pending.slice(0, 8).map((item) => (
              <div key={item.id} className="w-2 h-2 rounded-full bg-muted-foreground/20" />
            ))}
            {completed.slice(0, 4).map((item) => (
              <div key={item.id} className="w-2 h-2 rounded-full bg-primary" />
            ))}
          </div>
        </div>
      )}

      {/* EXPANDED */}
      {!collapsed && (
        <div className="flex flex-col h-full pt-8 pb-0">
          <div className="px-3 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">
                  {isHe ? 'המסלול היומי' : "Today's Journey"}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {completedTotal}/{totalItems} {isHe ? 'פריטים' : 'items'}
                </p>
              </div>
            </div>

            <div className="mb-2">
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-1 min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : totalItems === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                {isHe ? 'אין פריטים להיום' : 'No items for today'}
              </p>
            ) : (
              <div className="space-y-0.5">
                {/* Pending items */}
                {pending.map((item) => {
                  const domain = item.pillarId ? getDomainById(item.pillarId) : null;
                  const Icon = domain?.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/30 transition-colors">
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] leading-snug text-foreground/80 line-clamp-2">{item.title}</p>
                        {item.isTimeBased && item.durationMin && (
                          <span className="text-[9px] text-muted-foreground">{item.durationMin}{isHe ? 'ד' : 'm'}</span>
                        )}
                      </div>
                      {Icon && <Icon className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    </div>
                  );
                })}

                {/* Completed toggle */}
                {completed.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowCompleted(prev => !prev)}
                      className="flex items-center gap-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors w-full p-1.5"
                    >
                      <ChevronDown className={cn("w-3 h-3 transition-transform", showCompleted && "rotate-180")} />
                      <span className="font-medium">
                        {isHe ? `הושלמו (${completed.length})` : `Completed (${completed.length})`}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {showCompleted && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          {completed.map((item) => (
                            <div key={item.id} className="flex items-start gap-2 p-1.5 opacity-50">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="text-[11px] line-through text-muted-foreground">{item.title}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
