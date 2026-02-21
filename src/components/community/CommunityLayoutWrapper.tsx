/**
 * CommunityLayoutWrapper - Wraps Community page with sidebar-driven layout.
 * Mirrors ProjectsLayoutWrapper / LifeLayoutWrapper pattern.
 */
import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { CommunityHudSidebar } from '@/components/community/CommunityHudSidebar';
import { CommunityActivitySidebar } from '@/components/community/CommunityActivitySidebar';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Community = lazy(() => import('@/pages/Community'));

export default function CommunityLayoutWrapper() {
  const [selectedPillar, setSelectedPillar] = useState('consciousness');
  const [createOpen, setCreateOpen] = useState(false);

  const leftSidebar = (
    <CommunityHudSidebar
      selectedPillar={selectedPillar}
      onPillarSelect={setSelectedPillar}
      onCreateThread={() => setCreateOpen(true)}
    />
  );

  const rightSidebar = (
    <CommunityActivitySidebar />
  );

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <Community
          selectedPillar={selectedPillar}
          onPillarSelect={setSelectedPillar}
          createOpen={createOpen}
          onCreateOpenChange={setCreateOpen}
        />
      </DashboardLayout>
    </Suspense>
  );
}
