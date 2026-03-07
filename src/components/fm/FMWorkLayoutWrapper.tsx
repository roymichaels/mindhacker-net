/**
 * FMWorkLayoutWrapper — wraps FMWork without sidebars (content merged into page).
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMWork = lazy(() => import('@/pages/fm/FMWork'));

export default function FMWorkLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMWork />
    </Suspense>
  );
}
