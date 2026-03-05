/**
 * ArenaLayoutWrapper - Sets sidebars for the Tactics hub.
 * Available to all users (free tier included).
 */
import { Suspense, lazy, useState } from 'react';
import { TacticsRoadmapSidebar } from '@/components/sidebars/TacticsRoadmapSidebar';
import { ArenaActivitySidebar } from '@/components/arena/ArenaActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSidebars } from '@/hooks/useSidebars';

const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  const { isLaunchpadComplete } = useLaunchpadProgress();

  const showSidebars = isLaunchpadComplete;

  useSidebars(
    showSidebars ? <ArenaActivitySidebar /> : null,
    showSidebars ? <TacticsRoadmapSidebar /> : null
  );

  return (
    <Suspense fallback={null}>
      <ArenaHub />
    </Suspense>
  );
}
