/**
 * LifeLayoutWrapper - Wraps LifeHub with sidebar-driven layout.
 * Gated behind Pro subscription.
 */
import { Suspense, lazy } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { LifeHudSidebar } from '@/components/life/LifeHudSidebar';
import { LifeActivitySidebar } from '@/components/life/LifeActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const LifeHub = lazy(() => import('@/pages/LifeHub'));

export default function LifeLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { canAccessProjects: canAccessPro, isLoading } = useSubscriptionGate();

  // Pro gate
  if (!isLoading && !canAccessPro) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <ProGateOverlay feature="core" className="max-w-md w-full" />
          </div>
        </DashboardLayout>
      </Suspense>
    );
  }

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
