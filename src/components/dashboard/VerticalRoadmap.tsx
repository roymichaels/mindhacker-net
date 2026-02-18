/**
 * VerticalRoadmap - Web3-style milestone timeline
 * Desktop: vertical | Mobile/Tablet: horizontal scrollable
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { Check, MapPin, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const MONTH_LABELS = {
  he: ['יסודות', 'בנייה', 'מומנטום'],
  en: ['Foundations', 'Building', 'Momentum'],
};

// Hook to check lg breakpoint (1024px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

interface MilestoneData {
  id: string;
  plan_id?: string;
  week_number: number;
  title: string;
  description?: string | null;
  focus_area?: string | null;
  goal?: string | null;
  challenge?: string | null;
  tasks?: string[];
  is_completed: boolean;
  completed_at?: string | null;
  xp_reward?: number;
  tokens_reward?: number;
}

export type { MilestoneData };

interface VerticalRoadmapProps {
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

export function VerticalRoadmap({ onMilestoneClick }: VerticalRoadmapProps = {}) {
  const { t, language } = useTranslation();
  const { milestones, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const navigate = useNavigate();
  const isHe = language === 'he';
  const isDesktop = useIsDesktop();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 rounded-xl bg-muted/30" />
        ))}
      </div>
    );
  }

  if (!hasLifePlan || milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8 gap-3">
        <MapPin className="w-6 h-6 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{t('dashboard.progress.noPlan')}</p>
        <button
          onClick={() => navigate('/launchpad')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-rose-400 px-5 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110 active:brightness-90 transition-all shadow-sm"
        >
          <Rocket className="w-4 h-4" />
          {t('dashboard.progress.startPlan')}
        </button>
      </div>
    );
  }

  const months = [
    { weeks: milestones.filter(m => m.week_number <= 4), label: MONTH_LABELS[isHe ? 'he' : 'en'][0] },
    { weeks: milestones.filter(m => m.week_number > 4 && m.week_number <= 8), label: MONTH_LABELS[isHe ? 'he' : 'en'][1] },
    { weeks: milestones.filter(m => m.week_number > 8), label: MONTH_LABELS[isHe ? 'he' : 'en'][2] },
  ];

  const completedCount = milestones.filter(m => m.is_completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return isDesktop
    ? <DesktopTimeline months={months} milestones={milestones} currentWeek={currentWeek} progressPercent={progressPercent} isHe={isHe} onMilestoneClick={onMilestoneClick} />
    : <HorizontalTimeline months={months} milestones={milestones} currentWeek={currentWeek} progressPercent={progressPercent} isHe={isHe} onMilestoneClick={onMilestoneClick} />;
}

interface TimelineProps {
  months: { weeks: MilestoneData[]; label: string }[];
  milestones: MilestoneData[];
  currentWeek: number;
  progressPercent: number;
  isHe: boolean;
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

/* ─── HORIZONTAL TIMELINE (Mobile/Tablet) ─── */
function HorizontalTimeline({ months, milestones, currentWeek, progressPercent, isHe, onMilestoneClick }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentWeek]);

  const completedCount = milestones.filter(m => m.is_completed || m.week_number < currentWeek).length;
  const fillPercent = Math.round(((completedCount + 0.5) / milestones.length) * 100);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-foreground">
          {isHe ? 'מפת הדרך' : 'Roadmap'}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full border-2 border-primary/40 flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="relative overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="relative flex items-start gap-0" style={{ minWidth: `${milestones.length * 96}px` }}>
          {/* Horizontal line background */}
          <div className="absolute top-[16px] left-0 right-0 h-[3px] bg-muted/30 rounded-full" />
          {/* Horizontal line progress fill */}
          <div
            className="absolute top-[16px] left-0 h-[3px] rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-500/30 transition-all duration-700"
            style={{ width: `${Math.min(100, fillPercent)}%` }}
          />

          {months.map((month, monthIdx) => (
            <div key={monthIdx} className="flex items-start">
              {/* Month divider pill */}
              {monthIdx > 0 && (
                <div className="flex flex-col items-center justify-start pt-0 mx-1 snap-center" style={{ minWidth: '44px' }}>
                  <div className="w-px h-6 bg-border/50" />
                  <div className="px-2 py-0.5 rounded-full bg-muted/50 backdrop-blur-md border border-border/30">
                    <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                      {isHe ? `ח׳${monthIdx + 1}` : `M${monthIdx + 1}`}
                    </span>
                  </div>
                </div>
              )}

              {month.weeks.map((milestone) => {
                const isCurrent = milestone.week_number === currentWeek;
                const isCompleted = milestone.is_completed;
                const isFuture = milestone.week_number > currentWeek && !isCompleted;

                return (
                  <div
                    key={milestone.id}
                    ref={isCurrent ? currentNodeRef : undefined}
                    onClick={() => onMilestoneClick?.(milestone)}
                    className={cn(
                      "flex flex-col items-center snap-center transition-all duration-300 cursor-pointer",
                      isFuture && "opacity-30 blur-[0.5px]"
                    )}
                    style={{ minWidth: '96px' }}
                  >
                    {/* Node */}
                    <div className="relative z-10 mb-1.5">
                      {isCurrent ? (
                        <motion.div
                          className="relative"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="absolute -inset-2.5 rounded-full border-2 border-amber-500/50"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.div
                            className="absolute -inset-1.5 rounded-full border border-amber-400/30"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                          />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 border-2 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-amber-950" />
                          </div>
                        </motion.div>
                      ) : isCompleted ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-7 h-7 rounded-full bg-emerald-500/90 border-2 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)] flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground/25 bg-background/50" />
                      )}
                    </div>

                    {/* Label */}
                    <span className={cn(
                      "text-[10px] font-bold",
                      isCurrent ? "text-amber-500" : isCompleted ? "text-emerald-500" : "text-muted-foreground/60"
                    )}>
                      {isHe ? `ש׳${milestone.week_number}` : `W${milestone.week_number}`}
                    </span>

                    {/* Title */}
                    <p className={cn(
                      "text-[11px] leading-snug text-center max-w-[88px] mt-0.5",
                      isCurrent ? "text-foreground font-semibold" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/70"
                    )}
                      style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {milestone.title}
                    </p>

                    {/* Current indicator */}
                    {isCurrent && (
                      <span className="mt-1 text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {isHe ? 'כאן' : 'HERE'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── DESKTOP VERTICAL TIMELINE ─── */
function DesktopTimeline({ months, milestones, currentWeek, progressPercent, isHe, onMilestoneClick }: TimelineProps) {
  return (
    <div className="flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-bold text-foreground">
          {isHe ? 'מפת הדרך' : 'Roadmap'}
        </span>
        <div className="w-7 h-7 rounded-full border-2 border-primary/40 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{progressPercent}%</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {months.map((month, monthIdx) => (
          <div key={monthIdx} className="relative">
            {/* Month label pill */}
            <div className="flex items-center justify-center mb-1.5">
              <div className="px-2.5 py-0.5 rounded-full bg-muted/50 backdrop-blur-md border border-border/30 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {isHe ? `חודש ${monthIdx + 1}` : `M${monthIdx + 1}`}
                </span>
                <span className="text-[9px] text-muted-foreground/60">·</span>
                <span className="text-[9px] text-muted-foreground">{month.label}</span>
              </div>
            </div>

            {/* Weeks */}
            <div className="relative flex flex-col gap-0">
              {/* Vertical line background */}
              <div
                className="absolute top-0 bottom-0 w-[3px] rounded-full bg-muted/20"
                style={{ [isHe ? 'right' : 'left']: '12px' }}
              />
              {/* Progress fill */}
              {(() => {
                const monthWeeks = month.weeks;
                if (monthWeeks.length === 0) return null;
                const completedInMonth = monthWeeks.filter(w => w.is_completed || w.week_number < currentWeek).length;
                const hasCurrent = monthWeeks.some(w => w.week_number === currentWeek);
                const fillPct = hasCurrent
                  ? Math.round(((completedInMonth + 0.5) / monthWeeks.length) * 100)
                  : Math.round((completedInMonth / monthWeeks.length) * 100);
                return (
                  <div
                    className="absolute top-0 w-[3px] rounded-full bg-gradient-to-b from-emerald-500 via-amber-500 to-amber-400/30 transition-all duration-700"
                    style={{
                      [isHe ? 'right' : 'left']: '12px',
                      height: `${Math.min(100, fillPct)}%`,
                    }}
                  />
                );
              })()}

              {month.weeks.map((milestone) => {
                const isCurrent = milestone.week_number === currentWeek;
                const isCompleted = milestone.is_completed;
                const isFuture = milestone.week_number > currentWeek && !isCompleted;

                return (
                  <div
                    key={milestone.id}
                    onClick={() => onMilestoneClick?.(milestone)}
                    className={cn(
                      "relative flex items-center gap-3 py-3 px-1 transition-all duration-300 cursor-pointer hover:bg-accent/5 rounded-lg",
                      isHe && "flex-row-reverse",
                      isFuture && "opacity-30 blur-[0.5px]",
                      isCompleted && !isCurrent && "opacity-70"
                    )}
                  >
                    {/* Node */}
                    <div className="relative flex-shrink-0 z-10">
                      {isCurrent ? (
                        <motion.div className="relative" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}>
                          <motion.div
                            className="absolute -inset-2 rounded-full border-2 border-amber-500/50"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 border-2 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.5)] flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-amber-950" />
                          </div>
                        </motion.div>
                      ) : isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/90 border-2 border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/25 bg-background/50" />
                      )}
                    </div>

                    {/* Content card */}
                    <div className={cn(
                      "flex-1 min-w-0 rounded-lg px-3 py-2",
                      isCurrent && "bg-primary/10 border border-primary/30 shadow-[0_0_12px_hsl(var(--primary)/0.15)]",
                      isCompleted && !isCurrent && "bg-muted/10 rounded-md px-2.5 py-1.5",
                    )}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-xs font-bold shrink-0",
                          isCurrent ? "text-primary" : isCompleted ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          {isHe ? `ש׳${milestone.week_number}` : `W${milestone.week_number}`}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                            {isHe ? 'כאן' : 'NOW'}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-[13px] leading-snug mt-0.5",
                        isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                      )}>
                        {milestone.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {monthIdx < 2 && <div className="h-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}
