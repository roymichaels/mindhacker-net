import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useCoachSidebars } from '@/pages/Coaches';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Coaches = lazy(() => import('@/pages/Coaches'));

export default function CoachesLayoutWrapper() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { leftSidebar, rightSidebar } = useCoachSidebars(selectedClientId, setSelectedClientId);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <Coaches selectedClientId={selectedClientId} onClearClient={() => setSelectedClientId(null)} />
      </DashboardLayout>
    </Suspense>
  );
}
