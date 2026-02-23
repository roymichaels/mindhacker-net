/**
 * CommunityLayoutWrapper - Sets sidebars for the Community hub.
 */
import { Suspense, lazy, useState } from 'react';
import { CommunityHudSidebar } from '@/components/community/CommunityHudSidebar';
import { CommunityActivitySidebar } from '@/components/community/CommunityActivitySidebar';
import { useSidebars } from '@/hooks/useSidebars';

const Community = lazy(() => import('@/pages/Community'));

export default function CommunityLayoutWrapper() {
  const [selectedPillar, setSelectedPillar] = useState('consciousness');
  const [createOpen, setCreateOpen] = useState(false);

  useSidebars(
    <CommunityHudSidebar
      selectedPillar={selectedPillar}
      onPillarSelect={setSelectedPillar}
      onCreateThread={() => setCreateOpen(true)}
    />,
    <CommunityActivitySidebar />
  );

  return (
    <Suspense fallback={null}>
      <Community
        selectedPillar={selectedPillar}
        onPillarSelect={setSelectedPillar}
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
      />
    </Suspense>
  );
}
