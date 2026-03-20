/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Gates access behind AION activation wizard.
 */
import { Outlet } from 'react-router-dom';
import { useFMWallet } from '@/hooks/useFMWallet';
import { useSoulWallet } from '@/hooks/useSoulWallet';
import { useSoulAvatarWizard } from '@/contexts/SoulAvatarContext';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { EarnLaunchpadBanner } from '@/components/fm/EarnLaunchpadBanner';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';
import { useEffect } from 'react';

export default function FMAppShell() {
  const { wallet, isLoading, completeOnboarding } = useFMWallet();
  const { isMinted, isLoading: soulLoading } = useSoulWallet();
  const { openWizard } = useSoulAvatarWizard();

  // Hide global sidebars for all FM pages
  useSidebars(null, null, []);

  // Gate: If user hasn't activated AION, open wizard
  useEffect(() => {
    if (soulLoading) return;
    if (!isMinted) {
      openWizard();
    }
    // Also pick up post-onboarding trigger
    const trigger = sessionStorage.getItem('trigger_soul_avatar_wizard');
    if (trigger && !isMinted) {
      sessionStorage.removeItem('trigger_soul_avatar_wizard');
      openWizard();
    }
  }, [soulLoading, isMinted, openWizard]);

  if (isLoading || soulLoading) return <PageSkeleton />;

  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  if (needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <FMOnboarding onFinish={() => completeOnboarding.mutate()} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col -mx-2 lg:-mx-3 -mb-64 md:-mb-24 pb-28">
      <div className="px-4 relative z-10">
        <Outlet />
      </div>

      {/* Floating Earn Launchpad dock — bottom of FM */}
      <div className="fixed bottom-16 inset-x-0 z-40 px-3 pb-2">
        <EarnLaunchpadBanner />
      </div>
    </div>
  );
}
