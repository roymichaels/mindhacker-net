/**
 * ArenaLayoutWrapper - No sidebars. Everything is in the page body.
 */
import { Suspense, lazy } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const ArenaHub = lazy(() => import('@/pages/ArenaHub'));

export default function ArenaLayoutWrapper() {
  // No sidebars for tactics
  useSidebars(null, null);

  return (
    <Suspense fallback={null}>
      <ArenaHub />
    </Suspense>
  );
}
