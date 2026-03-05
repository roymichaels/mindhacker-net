/**
 * LifeLayoutWrapper - Sets sidebars for the Strategy hub.
 * Left sidebar = 100-day roadmap. No right sidebar.
 */
import { Suspense, lazy } from 'react';
import { StrategyRoadmapSidebar } from '@/components/sidebars/StrategyRoadmapSidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSidebars } from '@/hooks/useSidebars';

const LifeHub = lazy(() => import('@/pages/LifeHub'));

export default function LifeLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();

  useSidebars(
    isLaunchpadComplete ? <StrategyRoadmapSidebar /> : null,
    null
  );

  return (
    <Suspense fallback={null}>
      <LifeHub />
    </Suspense>
  );
}
