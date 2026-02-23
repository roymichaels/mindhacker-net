/**
 * UserDashboard — main dashboard page.
 * Renders MobileHeroGrid with plan data.
 */
import { MobileHeroGrid } from '@/components/dashboard/MobileHeroGrid';
import { useLifePlanWithMilestones } from '@/hooks/useLifePlan';
import { PageSkeleton } from '@/components/ui/skeleton';

export default function UserDashboard() {
  const { plan, milestones, isLoading } = useLifePlanWithMilestones();

  if (isLoading) return <PageSkeleton />;

  const currentWeek = plan
    ? Math.min(10, Math.max(1, Math.ceil((Date.now() - new Date(plan.start_date).getTime()) / (1000 * 60 * 60 * 24 * 10))))
    : 1;

  const completedCount = milestones.filter((m: any) => m.is_completed).length;
  const totalCount = milestones.length || 1;

  const planData = plan
    ? {
        currentWeek,
        progressPercent: Math.round((completedCount / totalCount) * 100),
        currentMonth: Math.ceil(currentWeek / 3),
        currentMilestone: milestones.find((m: any) => !m.is_completed) || null,
      }
    : null;

  return <MobileHeroGrid planData={planData} />;
}
