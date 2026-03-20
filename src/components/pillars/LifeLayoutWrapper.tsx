/**
 * LifeLayoutWrapper - No sidebars. Everything is in the page body.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const LifeHub = lazy(() => import('@/pages/LifeHub'));

export default function LifeLayoutWrapper() {
  useSidebars(null, null);

  return (
    <Suspense fallback={null}>
      <LifeHub />
    </Suspense>
  );
}
