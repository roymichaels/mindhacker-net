/**
 * PlayStatsStrip — Unified stats strip showing day, progress, pillars, tasks, phase, avg time.
 * Reusable across PlayHub and Profile modal.
 */
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { MapPin, Trophy, Zap, Target, Star, Clock } from 'lucide-react';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { useLifeDomains } from '@/hooks/useLifeDomains';
import { useWeeklyTacticalPlan } from '@/hooks/useWeeklyTacticalPlan';
import { useTodayExecution } from '@/hooks/useTodayExecution';
import { getCurrentDayInIsrael } from '@/utils/currentDay';
import { CORE_DOMAINS } from '@/navigation/lifeDomains';

export function PlayStatsStrip() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const { plan, milestones } = useLifePlanWithMilestones();
  const { statusMap } = useLifeDomains();
  const { queue } = useTodayExecution();
  const phasePlan = useWeeklyTacticalPlan();
  const { totalActions: tacticTotal, completedActions: tacticCompleted, totalMinutes, days } = phasePlan as any;

  const currentDay = useMemo(() => getCurrentDayInIsrael(plan?.start_date), [plan?.start_date]);
  const totalDomains = CORE_DOMAINS.length;
  const activeDomains = Object.entries(statusMap).filter(([, s]) => s === 'active' || s === 'configured').length;
  const totalMilestones = milestones?.length || 0;
  const completedMilestones = milestones?.filter((m: any) => m.is_completed).length || 0;
  const overallPct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  const activeDays = days?.filter((d: any) => d.totalActions > 0).length || 0;
  const avgMinPerDay = totalMinutes > 0 ? Math.round(totalMinutes / Math.max(1, activeDays)) : 0;

  const statItems = [
    { icon: MapPin, value: `${isHe ? 'יום' : 'Day'} ${currentDay}`, label: isHe ? 'מתוך 100' : 'of 100', color: 'text-orange-400' },
    { icon: Trophy, value: `${overallPct}%`, label: isHe ? 'התקדמות' : 'Progress', color: 'text-emerald-400' },
    { icon: Zap, value: `${activeDomains}/${totalDomains}`, label: isHe ? 'תחומים' : 'Pillars', color: 'text-amber-400' },
    { icon: Target, value: queue?.length || 0, label: isHe ? 'פעולות היום' : "Today's Tasks", color: 'text-teal-400' },
    { icon: Star, value: `${tacticCompleted || 0}/${tacticTotal || 0}`, label: isHe ? 'שלב' : 'Phase', color: 'text-violet-400' },
    { icon: Clock, value: `${avgMinPerDay}′`, label: isHe ? 'דק׳/יום' : 'Min/Day', color: 'text-sky-400' },
  ];

  if (!plan) return null;

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {statItems.map((s) => (
        <div key={s.label} className="rounded-xl bg-card border border-border/30 p-2 flex flex-col items-center gap-0.5">
          <s.icon className={cn("w-3.5 h-3.5", s.color)} />
          <span className="text-xs font-bold text-foreground leading-none">{s.value}</span>
          <span className="text-[8px] text-muted-foreground text-center leading-tight">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
