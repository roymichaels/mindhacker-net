/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Renders its own bottom tab navigation while sharing the global auth session.
 * Wraps all /fm/* routes via <Outlet />.
 */
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';
import { FMActivitySidebar } from '@/components/fm/FMActivitySidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

export default function FMAppShell() {
  const { language } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();

  // Sub-routes that manage their own sidebars
  const hasOwnSidebars = location.pathname.startsWith('/fm/earn');

  // Register FM-specific sidebars — mobile: none, desktop: right only
  // Skip when a child route manages its own sidebars
  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  useSidebars(
    hasOwnSidebars ? undefined : null,
    hasOwnSidebars ? undefined : (!isLoading && !needsOnboarding && !isMobile ? <FMActivitySidebar /> : null),
    [isLoading, needsOnboarding, isMobile, hasOwnSidebars]
  );

  if (isLoading) return <PageSkeleton />;

  if (needsOnboarding) {
    return (
      <div className="max-w-2xl mx-auto w-full py-8 px-4">
        <FMOnboarding onFinish={() => completeOnboarding.mutate()} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* FM Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-14">
        <Outlet />
      </div>

      {/* FM Bottom Tab Navigation */}
      <FMBottomNav />
    </div>
  );
}
