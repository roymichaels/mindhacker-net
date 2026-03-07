import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMMarket = lazy(() => import('@/pages/fm/FMMarket'));

export default function FMMarketLayoutWrapper() {
  useSidebars(null, null, []);
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMMarket />
    </Suspense>
  );
}
