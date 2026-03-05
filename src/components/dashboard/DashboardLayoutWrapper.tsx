/**
 * DashboardLayoutWrapper - No sidebars. Everything is in the page body.
 */
import { Suspense, lazy, useState, useEffect } from 'react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useAllDomainsComplete } from '@/hooks/useAllDomainsComplete';
import { PillarSynthesisModal } from '@/components/dashboard/PillarSynthesisModal';
import { useSidebars } from '@/hooks/useSidebars';

const UserDashboard = lazy(() => import('@/pages/UserDashboard'));

export default function DashboardLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { shouldTriggerSynthesis } = useAllDomainsComplete();
  const [synthesisOpen, setSynthesisOpen] = useState(false);

  useSidebars(null, null);

  useEffect(() => {
    if (shouldTriggerSynthesis) setSynthesisOpen(true);
  }, [shouldTriggerSynthesis]);

  return (
    <>
      <Suspense fallback={null}>
        <UserDashboard />
      </Suspense>
      <PillarSynthesisModal open={synthesisOpen} onOpenChange={setSynthesisOpen} />
    </>
  );
}
