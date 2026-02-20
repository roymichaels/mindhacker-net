/**
 * ArenaLayoutWrapper - Wraps ArenaHub with sidebar-driven layout.
 */
import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { ArenaHudSidebar } from '@/components/arena/ArenaHudSidebar';
import { ArenaActivitySidebar } from '@/components/arena/ArenaActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();

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
