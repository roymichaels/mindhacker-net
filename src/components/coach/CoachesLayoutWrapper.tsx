import { Suspense, lazy } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useCoachSidebars } from '@/pages/Coaches';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Coaches = lazy(() => import('@/pages/Coaches'));

export default function CoachesLayoutWrapper() {
  const { leftSidebar, rightSidebar } = useCoachSidebars();

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <Coaches />
      </DashboardLayout>
    </Suspense>
  );
}
