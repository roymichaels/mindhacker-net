/**
 * VerticalRoadmap - Web3-style vertical milestone timeline
 * Shows the user's 12-week journey with glowing nodes and progress line
 */
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { Check, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTH_LABELS = {
  he: ['יסודות', 'בנייה', 'מומנטום'],
  en: ['Foundations', 'Building', 'Momentum'],
};

export function VerticalRoadmap() {
  const { language } = useTranslation();
  const { milestones, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const isHe = language === 'he';

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
      <div className="text-center py-8 text-muted-foreground text-sm">
        <MapPin className="w-6 h-6 mx-auto mb-2 text-amber-500/50" />
        <p>{isHe ? 'אין עדיין תוכנית פעילה' : 'No active plan yet'}</p>
      </div>
    );
  }

  // Group milestones by month (4 weeks per month)
  const months = [
    { weeks: milestones.filter(m => m.week_number <= 4), label: MONTH_LABELS[isHe ? 'he' : 'en'][0] },
    { weeks: milestones.filter(m => m.week_number > 4 && m.week_number <= 8), label: MONTH_LABELS[isHe ? 'he' : 'en'][1] },
    { weeks: milestones.filter(m => m.week_number > 8), label: MONTH_LABELS[isHe ? 'he' : 'en'][2] },
  ];

  const completedCount = milestones.filter(m => m.is_completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="flex flex-col gap-1">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-bold text-foreground">
          {isHe ? 'מפת הדרך' : 'Roadmap'}
        </span>
        <span className="text-[10px] font-semibold text-amber-500">
          {progressPercent}%
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {months.map((month, monthIdx) => (
          <div key={monthIdx} className="relative">
            {/* Month label */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
              <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider whitespace-nowrap">
                {isHe ? `חודש ${monthIdx + 1}` : `Month ${monthIdx + 1}`}
              </span>
              <div className="h-px flex-1 bg-gradient-to-l from-amber-500/40 to-transparent" />
            </div>
            <span className="text-[9px] text-muted-foreground text-center block mb-3">
              {month.label}
            </span>

            {/* Weeks in this month */}
            <div className="relative flex flex-col gap-0">
              {/* Vertical line */}
              <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/60 to-amber-500/10"
                style={{ [isHe ? 'right' : 'left']: '11px' }}
              />
              {/* Progress fill */}
              {(() => {
                const monthWeeks = month.weeks;
                if (monthWeeks.length === 0) return null;
                const completedInMonth = monthWeeks.filter(w => w.is_completed || w.week_number < currentWeek).length;
                const isCurrent = monthWeeks.some(w => w.week_number === currentWeek);
                const fillPercent = isCurrent
                  ? Math.round(((completedInMonth + 0.5) / monthWeeks.length) * 100)
                  : Math.round((completedInMonth / monthWeeks.length) * 100);
                return (
                  <div
                    className="absolute top-0 w-0.5 bg-gradient-to-b from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                    style={{
                      [isHe ? 'right' : 'left']: '10.5px',
                      height: `${Math.min(100, fillPercent)}%`,
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
                    className={cn(
                      "relative flex items-start gap-3 py-2 px-1",
                      isHe && "flex-row-reverse"
                    )}
                  >
                    {/* Node */}
                    <div className="relative flex-shrink-0 z-10">
                      {isCurrent ? (
                        <motion.div
                          className="relative"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Pulsing ring */}
                          <motion.div
                            className="absolute -inset-1.5 rounded-full border-2 border-amber-500/60"
                            animate={{
                              scale: [1, 1.4, 1],
                              opacity: [0.6, 0, 0.6],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                          <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-amber-950" />
                          </div>
                        </motion.div>
                      ) : isCompleted ? (
                        <div className="w-[22px] h-[22px] rounded-full bg-emerald-500/90 border-2 border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-[22px] h-[22px] rounded-full border-2 border-muted-foreground/30 bg-background/50",
                          isFuture && "opacity-40"
                        )} />
                      )}
                    </div>

                    {/* Content card */}
                    <div className={cn(
                      "flex-1 min-w-0 rounded-lg px-2.5 py-1.5 transition-all",
                      isCurrent && "bg-amber-500/10 border border-amber-500/30",
                      isCompleted && !isCurrent && "bg-muted/20",
                      isFuture && "opacity-50"
                    )}>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[10px] font-bold",
                          isCurrent ? "text-amber-500" : isCompleted ? "text-emerald-500" : "text-muted-foreground"
                        )}>
                          {isHe ? `ש׳${milestone.week_number}` : `W${milestone.week_number}`}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                            {isHe ? 'אתה כאן' : 'YOU ARE HERE'}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-[11px] leading-tight mt-0.5 truncate",
                        isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {milestone.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spacer between months */}
            {monthIdx < 2 && <div className="h-2" />}
          </div>
        ))}
      </div>
    </div>
  );
}
