/**
 * FMHomeLayoutWrapper — wraps FMHome without sidebars (content merged into page).
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMHome = lazy(() => import('@/pages/FMHome'));

export default function FMHomeLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMHome />
    </Suspense>
  );
}
