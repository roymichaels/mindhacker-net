/**
 * CommunityLayoutWrapper - Sets sidebars for the Community hub.
 */
import { Suspense, lazy, useState } from 'react';
import { CommunityHudSidebar } from '@/components/community/CommunityHudSidebar';
import { CommunityActivitySidebar } from '@/components/community/CommunityActivitySidebar';
import { useSidebars } from '@/hooks/useSidebars';

const Community = lazy(() => import('@/pages/Community'));

export default function CommunityLayoutWrapper() {
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const handlePillarSelect = (pillar: string) => {
    setSelectedPillar(pillar);
    setSelectedTopic(null);
  };

  useSidebars(
    <CommunityHudSidebar
      selectedPillar={selectedPillar}
      onPillarSelect={handlePillarSelect}
      onCreateThread={() => setCreateOpen(true)}
    />,
    <CommunityActivitySidebar
      selectedPillar={selectedPillar}
      selectedTopic={selectedTopic}
      onSelectTopic={setSelectedTopic}
    />,
    [selectedPillar, selectedTopic]
  );

  return (
    <Suspense fallback={null}>
      <Community
        selectedPillar={selectedPillar}
        onPillarSelect={handlePillarSelect}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
      />
    </Suspense>
  );
}
