/**
 * FreelancerLayoutWrapper — wraps Freelancer without sidebars.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { PageSkeleton } from '@/components/ui/skeleton';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

const Freelancer = lazy(() => import('@/pages/Freelancer'));

export default function FreelancerLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Freelancer />
      </Suspense>
      <FMBottomNav />
    </>
  );
}
