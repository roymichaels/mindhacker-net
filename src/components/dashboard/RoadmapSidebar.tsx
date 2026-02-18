/**
 * RoadmapSidebar - Desktop-only left sidebar showing the 90-day roadmap.
 * Mirrors HudSidebar on the opposite side.
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { VerticalRoadmap, type MilestoneData } from '@/components/dashboard/VerticalRoadmap';
import { MilestoneDetailModal } from '@/components/dashboard/MilestoneDetailModal';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { PanelLeftClose, PanelLeftOpen, Check, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoadmapSidebar() {
  const { isRTL, language } = useTranslation();
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1024);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const { milestones, currentWeek, hasLifePlan, plan } = useLifePlanWithMilestones();
  const isHe = language === 'he';

  const handleMilestoneClick = (milestone: MilestoneData) => {
    setSelectedMilestone(milestone);
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 h-full overflow-hidden transition-all duration-300 relative",
          "backdrop-blur-xl bg-gradient-to-b from-card/80 via-background/60 to-card/80",
          "dark:from-gray-900/90 dark:via-gray-950/70 dark:to-gray-900/90",
          "ltr:border-e rtl:border-s border-border/50 dark:border-primary/15",
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

        {/* Collapsed mini-timeline */}
        {collapsed && (
          <div className="flex flex-col items-center justify-between h-full pt-8 pb-3 px-0.5 overflow-hidden">
            {hasLifePlan && milestones.length > 0 ? (
              <CollapsedMiniTimeline
                milestones={milestones}
                currentWeek={currentWeek}
                isHe={isHe}
                onMilestoneClick={handleMilestoneClick}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-2 rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20">
                <MapPin className="w-4 h-4 text-muted-foreground/40" />
                <span className="text-[8px] text-muted-foreground">{isHe ? 'אין תוכנית' : 'No plan'}</span>
              </div>
            )}
          </div>
        )}

        {/* Expanded content */}
        {!collapsed && (
          <div className="flex flex-col h-full overflow-hidden p-3 pt-8">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-2" />
            <VerticalRoadmap onMilestoneClick={handleMilestoneClick} forceVertical />
          </div>
        )}
      </aside>

      {/* Milestone detail modal */}
      <MilestoneDetailModal
        milestone={selectedMilestone}
        planId={plan?.id}
        open={!!selectedMilestone}
        onOpenChange={(open) => !open && setSelectedMilestone(null)}
      />
    </>
  );
}

/* ─── Collapsed Mini Timeline ─── */
interface CollapsedMiniTimelineProps {
  milestones: MilestoneData[];
  currentWeek: number;
  isHe: boolean;
  onMilestoneClick: (milestone: MilestoneData) => void;
}

function CollapsedMiniTimeline({ milestones, currentWeek, isHe, onMilestoneClick }: CollapsedMiniTimelineProps) {
  const completedCount = milestones.filter(m => m.is_completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  // Group by month
  const monthBreaks = [4, 8]; // after week 4 and 8

  return (
    <div className="flex flex-col items-center gap-1 w-full relative">
      {/* Progress circle — HUD card style */}
      <div className="flex flex-col items-center gap-0.5 w-full rounded-lg bg-muted/30 dark:bg-muted/15 border border-border/20 p-1">
        <div className="w-9 h-9 rounded-full border-2 border-primary/40 flex items-center justify-center bg-background/50">
          <span className="text-[9px] font-bold text-primary">{progressPercent}%</span>
        </div>
        <span className="text-[8px] text-muted-foreground leading-none">{isHe ? 'התקדמות' : 'Progress'}</span>
      </div>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Vertical line container */}
      <div className="relative flex flex-col items-center gap-0 w-full">
        {/* Background line */}
        <div className="absolute top-0 bottom-0 w-[3px] bg-muted/20 rounded-full left-1/2 -translate-x-1/2" />
        {/* Progress fill */}
        <div
          className="absolute top-0 w-[3px] rounded-full bg-gradient-to-b from-primary via-primary/60 to-accent/30 left-1/2 -translate-x-1/2 transition-all duration-700"
          style={{ height: `${Math.min(100, Math.round(((completedCount + 0.5) / milestones.length) * 100))}%` }}
        />

        {milestones.map((milestone, idx) => {
          const isCurrent = milestone.week_number === currentWeek;
          const isCompleted = milestone.is_completed;
          const isFuture = milestone.week_number > currentWeek && !isCompleted;
          const isMonthBreak = monthBreaks.includes(milestone.week_number);

          return (
            <div key={milestone.id} className="flex flex-col items-center w-full">
              {/* Month divider */}
              {isMonthBreak && idx > 0 && (
                <div className="flex items-center justify-center w-full my-1">
                  <div className="px-1.5 py-0.5 rounded-full bg-muted/30 dark:bg-muted/15 border border-border/20">
                    <span className="text-[7px] font-bold text-muted-foreground">
                      {isHe ? `ח׳${milestone.week_number <= 4 ? 1 : milestone.week_number <= 8 ? 2 : 3}` : `M${milestone.week_number <= 4 ? 1 : milestone.week_number <= 8 ? 2 : 3}`}
                    </span>
                  </div>
                </div>
              )}

              {/* Milestone node */}
              <button
                onClick={() => onMilestoneClick(milestone)}
                className={cn(
                  "relative z-10 flex flex-col items-center py-1 transition-all group",
                  isFuture && "opacity-30"
                )}
                title={milestone.title}
              >
                {isCurrent ? (
                  <motion.div className="relative">
                    <motion.div
                      className="absolute -inset-1.5 rounded-full border border-primary/40"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent border border-primary/50 shadow-[0_0_10px_hsl(var(--primary)/0.4)] flex items-center justify-center">
                      <MapPin className="w-2.5 h-2.5 text-primary-foreground" />
                    </div>
                  </motion.div>
                ) : isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-chart-1/80 border border-chart-1/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground/20 bg-background/50 group-hover:border-muted-foreground/40 transition-colors" />
                )}

                {/* Week label */}
                <span className={cn(
                  "text-[8px] font-bold mt-0.5 leading-none",
                  isCurrent ? "text-primary" : isCompleted ? "text-chart-1/70" : "text-muted-foreground/40"
                )}>
                  {isHe ? `ש${milestone.week_number}` : `W${milestone.week_number}`}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="w-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
}
