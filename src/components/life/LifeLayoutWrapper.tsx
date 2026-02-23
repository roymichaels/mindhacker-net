/**
 * LifeLayoutWrapper - Sets sidebars for the Life hub.
 * Core hub is OPEN to all tiers (assessment for Free, full depth for Plus+).
 */
import { Suspense, lazy } from 'react';
import { LifeHudSidebar } from '@/components/life/LifeHudSidebar';
import { LifeActivitySidebar } from '@/components/life/LifeActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSidebars } from '@/hooks/useSidebars';

const LifeHub = lazy(() => import('@/pages/LifeHub'));

export default function LifeLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();

  useSidebars(
    isLaunchpadComplete ? <LifeHudSidebar /> : null,
    isLaunchpadComplete ? <LifeActivitySidebar /> : null
  );

  return (
    <Suspense fallback={null}>
      <LifeHub />
    </Suspense>
  );
}
