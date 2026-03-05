/**
 * FMWorkLayoutWrapper — wraps FMWork with custom sidebars.
 */
import { Suspense, lazy, useMemo } from 'react';
import { FMWorkHudSidebar } from '@/components/fm/FMWorkHudSidebar';
import { FMWorkActivitySidebar } from '@/components/fm/FMWorkActivitySidebar';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';

const FMWork = lazy(() => import('@/pages/fm/FMWork'));

export default function FMWorkLayoutWrapper() {
  const left = useMemo(() => <FMWorkHudSidebar />, []);
  const right = useMemo(() => <FMWorkActivitySidebar />, []);

  useSidebars(left, right, [left, right]);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FMWork />
    </Suspense>
  );
}
