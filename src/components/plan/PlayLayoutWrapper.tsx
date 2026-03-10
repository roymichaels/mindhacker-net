/**
 * PlayLayoutWrapper - No sidebars. Unified Play page.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const PlayHub = lazy(() => import('@/pages/PlayHub'));

export default function PlayLayoutWrapper() {
  useSidebars(null, null);

  return (
    <Suspense fallback={null}>
      <PlayHub />
    </Suspense>
  );
}
