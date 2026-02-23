import { Suspense, lazy, useState } from 'react';
import { useCoachSidebars } from '@/pages/Coaches';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebars } from '@/hooks/useSidebars';

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

  useSidebars(
    !loading && !isPractitioner ? null : leftSidebar,
    !loading && !isPractitioner ? null : rightSidebar
  );

  if (!loading && !isPractitioner) {
    return (
      <Suspense fallback={null}>
        <Coaches />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <Coaches
        selectedClientId={selectedClientId}
        onClearClient={() => setSelectedClientId(null)}
        activeTab={activeTab}
      />
    </Suspense>
  );
}
