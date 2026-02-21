/**
 * CurrentWeekPlanCard — Compact card showing the current week's milestone from the 90-day plan.
 * Placed prominently on the dashboard for quick plan awareness.
 */
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Target, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

export function CurrentWeekPlanCard() {
  const { plan, milestones, currentWeek, currentMilestone, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const isHe = language === 'he';
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  if (isLoading || !hasLifePlan || milestones.length === 0) return null;

  const completedCount = milestones.filter(m => m.is_completed).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const totalWeeks = (plan?.duration_months || 3) * 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 space-y-3 cursor-pointer group"
      onClick={() => navigate('/life')}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            {isHe ? 'תוכנית 90 יום' : '90-Day Plan'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {isHe ? `שבוע ${currentWeek}/${totalWeeks}` : `Week ${currentWeek}/${totalWeeks}`}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{completedCount} {isHe ? 'הושלמו' : 'completed'}</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Current milestone */}
      {currentMilestone && (
        <div className="flex items-start gap-2 pt-1">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
              {isHe ? 'אבן דרך נוכחית' : 'Current Milestone'}
            </p>
            <p className="text-sm font-medium text-foreground break-words leading-snug mt-0.5">
              {(currentMilestone as any).title}
            </p>
          </div>
          <ChevronIcon className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors shrink-0 mt-1" />
        </div>
      )}
    </motion.div>
  );
}
