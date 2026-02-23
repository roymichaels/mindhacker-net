/**
 * ArenaLayoutWrapper - Wraps ArenaHub with sidebar-driven layout.
 * Gated behind Plus subscription (was Pro).
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
  const { canAccessArenaFull, isLoading } = useSubscriptionGate();

  // Plus gate (Arena full access requires Plus+)
  if (!isLoading && !canAccessArenaFull) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <div className="flex items-center justify-center min-h-[60vh] p-4">
            <ProGateOverlay feature="arena" targetTier="plus" className="max-w-md w-full" />
          </div>
        </DashboardLayout>
      </Suspense>
    );
  }

  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <ArenaHub />
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
        <ArenaHub />
      </DashboardLayout>
    </Suspense>
  );
}
