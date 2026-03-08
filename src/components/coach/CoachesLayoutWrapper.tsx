import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const Coaches = lazy(() => import('@/pages/Coaches'));

export default function CoachesLayoutWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={null}>
      <Coaches />
    </Suspense>
  );
}
