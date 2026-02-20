/**
 * DashboardLayoutWrapper - Wraps the Dashboard with conditional sidebar visibility.
 * Hides HUD sidebars for un-onboarded users (like CoachesLayoutWrapper does for non-coaches).
 * Auto-triggers PillarSynthesisModal when all 11 domains are complete.
 */
import { Suspense, lazy, useState, useEffect } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useAllDomainsComplete } from '@/hooks/useAllDomainsComplete';
import { PillarSynthesisModal } from '@/components/dashboard/PillarSynthesisModal';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));

import { flowAudit } from '@/lib/flowAudit';

export default function DashboardLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { shouldTriggerSynthesis } = useAllDomainsComplete();
  const [synthesisOpen, setSynthesisOpen] = useState(false);

  // Auto-trigger synthesis modal when all domains complete
  useEffect(() => {
    if (shouldTriggerSynthesis) {
      setSynthesisOpen(true);
    }
  }, [shouldTriggerSynthesis]);

  flowAudit.redirect('/dashboard', isLaunchpadComplete ? '(full layout)' : '(no sidebars)', `isLaunchpadComplete=${isLaunchpadComplete}`);

  // Un-onboarded users: no sidebars (clean intro page)
  if (!isLaunchpadComplete) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <UserDashboard />
        </DashboardLayout>
        <PillarSynthesisModal open={synthesisOpen} onOpenChange={setSynthesisOpen} />
      </Suspense>
    );
  }

  // Onboarded users: default sidebars (HudSidebar + RoadmapSidebar)
  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout>
        <UserDashboard />
      </DashboardLayout>
      <PillarSynthesisModal open={synthesisOpen} onOpenChange={setSynthesisOpen} />
    </Suspense>
  );
}