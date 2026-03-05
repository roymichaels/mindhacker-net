/**
 * FMWalletLayoutWrapper — wraps FMWalletPage with custom sidebars.
 */
import { Suspense, lazy, useMemo } from 'react';
import { FMWalletHudSidebar } from '@/components/fm/FMWalletHudSidebar';
import { FMWalletActivitySidebar } from '@/components/fm/FMWalletActivitySidebar';
import { useFMWallet } from '@/hooks/useFMWallet';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMWalletPage = lazy(() => import('@/pages/fm/FMWallet'));

export default function FMWalletLayoutWrapper() {
  const { wallet } = useFMWallet();

  const balance = wallet?.mos_balance ?? 0;
  const lifetimeEarned = wallet?.lifetime_earned ?? 0;
  const lifetimeSpent = wallet?.lifetime_spent ?? 0;
  const mode = wallet?.mode ?? 'simple';

  const left = useMemo(() => (
    <FMWalletHudSidebar balance={balance} lifetimeEarned={lifetimeEarned} lifetimeSpent={lifetimeSpent} mode={mode} />
  ), [balance, lifetimeEarned, lifetimeSpent, mode]);

  const right = useMemo(() => <FMWalletActivitySidebar />, []);

  useSidebars(left, right, [left, right]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMWalletPage />
    </Suspense>
  );
}
