/**
 * FMAppShell — Self-contained app shell for the Free Market module.
 * Renders its own bottom tab navigation while sharing the global auth session.
 * Wraps all /fm/* routes via <Outlet />.
 */
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useFMWallet } from '@/hooks/useFMWallet';
import { FMOnboarding } from '@/components/fm/FMOnboarding';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { FMActivitySidebar } from '@/components/fm/FMActivitySidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

/** Routes within FM that register their own sidebars */
const SELF_SIDEBAR_ROUTES = ['/fm/earn'];

export default function FMAppShell() {
  const { language } = useTranslation();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { wallet, isLoading, completeOnboarding } = useFMWallet();
  const { setLeftSidebar, setRightSidebar } = useSidebarContext();

  const needsOnboarding = !wallet || !wallet.onboarding_complete;
  const hasOwnSidebars = SELF_SIDEBAR_ROUTES.some(r => location.pathname.startsWith(r));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = useMemo(() => ({}), [isLoading, needsOnboarding, isMobile, hasOwnSidebars]);

  // Set FM sidebars only when the child route doesn't manage its own
  useEffect(() => {
    if (!hasOwnSidebars) {
      setLeftSidebar(null);
      setRightSidebar(
        !isLoading && !needsOnboarding && !isMobile ? <FMActivitySidebar /> : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, setLeftSidebar, setRightSidebar]);

  // Clear on unmount
  useEffect(() => {
    return () => {
      setLeftSidebar(undefined);
      setRightSidebar(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
