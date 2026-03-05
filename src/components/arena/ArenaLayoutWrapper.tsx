/**
 * ArenaLayoutWrapper - Sets sidebars for the Tactics hub.
 * Available to all users (free tier included).
 */
import { Suspense, lazy, useState } from 'react';
import { ArenaHudSidebar } from '@/components/arena/ArenaHudSidebar';
import { ArenaActivitySidebar } from '@/components/arena/ArenaActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSidebars } from '@/hooks/useSidebars';

const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();

  const showSidebars = isLaunchpadComplete;

  useSidebars(
    showSidebars ? <ArenaHudSidebar onNewProject={() => setWizardTrigger(prev => prev + 1)} /> : null,
    showSidebars ? <ArenaActivitySidebar /> : null
  );

  return (
    <Suspense fallback={null}>
      <ArenaHub />
    </Suspense>
  );
}
