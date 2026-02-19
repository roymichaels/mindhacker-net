/**
 * DashboardLayoutWrapper - Wraps the Dashboard with conditional sidebar visibility.
 * Hides HUD sidebars for un-onboarded users (like CoachesLayoutWrapper does for non-coaches).
 */
import { Suspense, lazy } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));

export default function DashboardLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // Un-onboarded users: no sidebars (clean intro page)
  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <UserDashboard />
        </DashboardLayout>
      </Suspense>
    );
  }

  // Onboarded users: default sidebars (HudSidebar + RoadmapSidebar)
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
    </Suspense>
  );
}
