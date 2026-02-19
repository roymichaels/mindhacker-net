import { Suspense, lazy, useState } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useCoachSidebars } from '@/pages/Coaches';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));
const Coaches = lazy(() => import('@/pages/Coaches'));

export default function CoachesLayoutWrapper() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { hasRole, loading } = useUserRoles();
  const { user } = useAuth();
  const isPractitioner = !loading && user && hasRole('practitioner');
  
  const handleTabChange = (tab: string) => {
    setSelectedClientId(null);
    setActiveTab(tab);
  };

  const { leftSidebar, rightSidebar } = useCoachSidebars(
    selectedClientId,
    setSelectedClientId,
    activeTab,
    handleTabChange,
  );

  // For non-coaches, render without DashboardLayout sidebars (clean landing page)
  if (!loading && !isPractitioner) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <DashboardLayout leftSidebar={null} rightSidebar={null}>
          <Coaches />
        </DashboardLayout>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <DashboardLayout leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
        <Coaches
          selectedClientId={selectedClientId}
          onClearClient={() => setSelectedClientId(null)}
          activeTab={activeTab}
        />
      </DashboardLayout>
    </Suspense>
  );
}
