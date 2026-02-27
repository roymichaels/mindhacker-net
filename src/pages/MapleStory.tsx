import { Suspense, lazy, useEffect } from 'react';
import { useSidebars } from '@/hooks/useSidebars';

const MapleStoryPage = lazy(() => import('@/components/maple/MapleStoryPage'));

export default function MapleStoryView() {
  useSidebars(null, null);

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>}>
      <MapleStoryPage />
    </Suspense>
  );
}
