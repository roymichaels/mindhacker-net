/**
 * ArenaLayoutWrapper - Wraps ArenaHub with sidebar-driven layout.
 * Gated behind Pro subscription.
 */
import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ArenaHudSidebar } from '@/components/arena/ArenaHudSidebar';
import { ArenaActivitySidebar } from '@/components/arena/ArenaActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { canAccessProjects: canAccessPro, isLoading } = useSubscriptionGate();

  // Pro gate
  if (!isLoading && !canAccessPro) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <ProGateOverlay feature="arena" className="max-w-md w-full" />
          </div>
        </DashboardLayout>
      </Suspense>
    );
  }

  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <ArenaHub openWizardTrigger={wizardTrigger} />
        </DashboardLayout>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout
        leftSidebar={<ArenaHudSidebar onNewProject={() => setWizardTrigger(prev => prev + 1)} />}
        rightSidebar={<ArenaActivitySidebar />}
      >
        <ArenaHub openWizardTrigger={wizardTrigger} />
      </DashboardLayout>
    </Suspense>
  );
}
