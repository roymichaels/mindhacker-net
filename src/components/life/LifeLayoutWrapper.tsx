/**
 * LifeLayoutWrapper - Wraps LifeHub with sidebar-driven layout.
 * Mirrors ProjectsLayoutWrapper pattern.
 */
import { Suspense, lazy } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { LifeHudSidebar } from '@/components/life/LifeHudSidebar';
import { LifeActivitySidebar } from '@/components/life/LifeActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const LifeHub = lazy(() => import('@/pages/LifeHub'));

export default function LifeLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();

  // Un-onboarded users: no sidebars
  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <LifeHub />
        </DashboardLayout>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout
        leftSidebar={<LifeHudSidebar />}
        rightSidebar={<LifeActivitySidebar />}
      >
        <LifeHub />
      </DashboardLayout>
    </Suspense>
  );
}
