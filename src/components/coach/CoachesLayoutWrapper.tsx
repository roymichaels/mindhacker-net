import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';
import { FMBottomNav } from '@/components/fm/FMBottomNav';

const Coaches = lazy(() => import('@/pages/Coaches'));

export default function CoachesLayoutWrapper() {
  // Suppress all sidebars — navigation is inline now
  useSidebars(null, null, []);

  return (
    <>
      <Suspense fallback={null}>
        <Coaches />
      </Suspense>
      <FMBottomNav />
    </>
  );
}
