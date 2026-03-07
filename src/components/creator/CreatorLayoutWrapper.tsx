/**
 * CreatorLayoutWrapper — wraps Creator without sidebars.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

const Creator = lazy(() => import('@/pages/Creator'));

export default function CreatorLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Creator />
      </Suspense>
      <FMBottomNav />
    </>
  );
}
