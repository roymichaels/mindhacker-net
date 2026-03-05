/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Renders its own bottom tab navigation while sharing the global auth session.
 * Wraps all /fm/* routes via <Outlet />.
 *
 * Sidebar management is delegated to individual child routes
 * (e.g., EarnLayoutWrapper) to avoid parent-child effect conflicts.
 */
import { Outlet } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

export default function FMAppShell() {
  const { language } = useTranslation();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

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
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto px-4 pb-16">
        <Outlet />
      </div>
      <FMBottomNav />
    </div>
  );
}
