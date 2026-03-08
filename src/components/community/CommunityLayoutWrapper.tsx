/**
 * CommunityLayoutWrapper - Sidebar-less layout for Community hub.
 * Pillars and topics are rendered as inline cards within the page.
 */
import { Suspense, lazy, useState } from 'react';
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

  // Suppress all sidebars — pillars/topics are inline cards now
  useSidebars(null, null, []);

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
