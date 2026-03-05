/**
 * DashboardLayoutWrapper - Sets sidebars for the Dashboard (Now) hub.
 * Left sidebar = daily roadmap. Right sidebar = HUD stats.
 */
import { Suspense, lazy, useState, useEffect } from 'react';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useAllDomainsComplete } from '@/hooks/useAllDomainsComplete';
import { PillarSynthesisModal } from '@/components/dashboard/PillarSynthesisModal';
import { useSidebars } from '@/hooks/useSidebars';
import { flowAudit } from '@/lib/flowAudit';
import { HudSidebar } from '@/components/dashboard/HudSidebar';
import { RoadmapSidebar } from '@/components/dashboard/RoadmapSidebar';

const UserDashboard = lazy(() => import('@/pages/UserDashboard'));

export default function DashboardLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { shouldTriggerSynthesis } = useAllDomainsComplete();
  const [synthesisOpen, setSynthesisOpen] = useState(false);

  useSidebars(
    isLaunchpadComplete ? <DailyRoadmapSidebar /> : null,
    isLaunchpadComplete ? <HudSidebar /> : null
  );

  useEffect(() => {
    if (shouldTriggerSynthesis) setSynthesisOpen(true);
  }, [shouldTriggerSynthesis]);

  flowAudit.redirect('/dashboard', isLaunchpadComplete ? '(full layout)' : '(no sidebars)', `isLaunchpadComplete=${isLaunchpadComplete}`);

  return (
    <>
      <Suspense fallback={null}>
        <UserDashboard />
      </Suspense>
      <PillarSynthesisModal open={synthesisOpen} onOpenChange={setSynthesisOpen} />
    </>
  );
}
