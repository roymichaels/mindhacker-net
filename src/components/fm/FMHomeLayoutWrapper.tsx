/**
 * FMHomeLayoutWrapper — wraps FMHome with custom sidebars.
 */
import { Suspense, lazy, useMemo } from 'react';
import { FMHomeHudSidebar } from '@/components/fm/FMHomeHudSidebar';
import { FMHomeActivitySidebar } from '@/components/fm/FMHomeActivitySidebar';
import { useFMWallet, useFMClaims } from '@/hooks/useFMWallet';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMHome = lazy(() => import('@/pages/FMHome'));

export default function FMHomeLayoutWrapper() {
  const { wallet } = useFMWallet();
  const { data: claims = [] } = useFMClaims();

  const balance = wallet?.mos_balance ?? 0;
  const lifetimeEarned = wallet?.lifetime_earned ?? 0;
  const activeBounties = claims.filter((c: any) => c.status === 'claimed').length;

  const left = useMemo(() => (
    <FMHomeHudSidebar balance={balance} lifetimeEarned={lifetimeEarned} activeBounties={activeBounties} />
  ), [balance, lifetimeEarned, activeBounties]);

  const right = useMemo(() => (
    <FMHomeActivitySidebar />
  ), []);

  useSidebars(left, right, [left, right]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMHome />
    </Suspense>
  );
}
