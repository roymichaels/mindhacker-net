/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * No tabs — single page at /fm with wallet icon in header.
 */
import { Outlet } from 'react-router-dom';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { EarnLaunchpadBanner } from '@/components/fm/EarnLaunchpadBanner';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';

export default function FMAppShell() {
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

  // Hide global sidebars for all FM pages
  useSidebars(null, null, []);

  if (isLoading) return <PageSkeleton />;

  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  if (needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <FMOnboarding onFinish={() => completeOnboarding.mutate()} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col -mx-2 lg:-mx-3 -mb-64 md:-mb-24 pb-20">
      {/* Persistent Earn Launchpad banner — above content */}
      <div className="relative z-10 px-4 pt-2 pb-0">
        <EarnLaunchpadBanner />
      </div>

      <div className="px-4 relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
