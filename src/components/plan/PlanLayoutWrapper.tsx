/**
 * PlanLayoutWrapper - No sidebars. Unified Plan page.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const PlanHub = lazy(() => import('@/pages/PlanHub'));

export default function PlanLayoutWrapper() {
  useSidebars(null, null);

  return (
    <Suspense fallback={null}>
      <PlanHub />
    </Suspense>
  );
}
