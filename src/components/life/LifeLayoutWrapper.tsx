/**
 * LifeLayoutWrapper - Wraps LifeHub with sidebar-driven layout.
 * Core hub is OPEN to all tiers (assessment for Free, full depth for Plus+).
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

  // Core is open to all tiers — depth gating happens at pillar level
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
