/**
 * WorkLayoutWrapper — wraps WorkHub page.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const WorkHub = lazy(() => import('@/pages/WorkHub'));

export default function WorkLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <WorkHub />
    </Suspense>
  );
}
