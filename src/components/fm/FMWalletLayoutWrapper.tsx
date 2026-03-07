/**
 * FMWalletLayoutWrapper — wraps FMWalletPage without sidebars (content merged into page).
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMWalletPage = lazy(() => import('@/pages/fm/FMWallet'));

export default function FMWalletLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMWalletPage />
    </Suspense>
  );
}
