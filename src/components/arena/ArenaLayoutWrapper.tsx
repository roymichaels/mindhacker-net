/**
 * ArenaLayoutWrapper - Sets sidebars for the Arena hub.
 * Gated behind Plus subscription.
 */
import { Suspense, lazy, useState } from 'react';
import { ArenaHudSidebar } from '@/components/arena/ArenaHudSidebar';
import { ArenaActivitySidebar } from '@/components/arena/ArenaActivitySidebar';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { useSidebars } from '@/hooks/useSidebars';

const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  const [wizardTrigger, setWizardTrigger] = useState(0);
  const { isLaunchpadComplete } = useLaunchpadProgress();
  const { canAccessArenaFull, isLoading } = useSubscriptionGate();

  const showSidebars = !isLoading && canAccessArenaFull && isLaunchpadComplete;

  useSidebars(
    showSidebars ? <ArenaHudSidebar onNewProject={() => setWizardTrigger(prev => prev + 1)} /> : null,
    showSidebars ? <ArenaActivitySidebar /> : null
  );

  if (!isLoading && !canAccessArenaFull) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <ProGateOverlay feature="arena" targetTier="plus" />
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <ArenaHub />
    </Suspense>
  );
}
