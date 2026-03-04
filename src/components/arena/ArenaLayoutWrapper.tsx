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
      <div className="flex items-start justify-center overflow-y-auto flex-1 min-h-0 h-full"
        style={{ background: 'linear-gradient(135deg, hsl(270 60% 12%) 0%, hsl(280 50% 8%) 30%, hsl(40 60% 10%) 70%, hsl(35 70% 14%) 100%)', minHeight: '100%' }}
      >
        <ProGateOverlay feature="arena" targetTier="plus" className="rounded-none" />
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <ArenaHub />
    </Suspense>
  );
}
