import { useState, lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useMyCoachProfile } from '@/domain/coaches';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachSubscription } from '@/hooks/useCoachSubscription';
import { PageSkeleton } from '@/components/ui/skeleton';
import { CoachHudSidebar } from '@/components/coach/CoachHudSidebar';
import { CoachActivitySidebar } from '@/components/coach/CoachActivitySidebar';
import { toast } from 'sonner';

const CoachHub = lazy(() => import('./CoachHub'));
const CoachesLanding = lazy(() => import('@/components/coach/CoachesLanding'));
const CoachPricingPage = lazy(() => import('@/components/coach/CoachPricingPage'));

// Hook to provide coach-specific sidebars when user is a practitioner
export function useCoachSidebars(
  selectedClientId?: string | null,
  onSelectClient?: (id: string | null) => void,
  activeTab?: string,
  onTabChange?: (tab: string) => void,
) {
  const { hasRole, loading } = useUserRoles();
  const { user } = useAuth();
  const isPractitioner = !loading && user && hasRole('practitioner');

  if (!isPractitioner) {
    return { leftSidebar: undefined, rightSidebar: undefined };
  }

  return {
    leftSidebar: <CoachHudSidebar activeTab={activeTab} onTabChange={onTabChange} />,
    rightSidebar: <CoachActivitySidebar selectedClientId={selectedClientId} onSelectClient={onSelectClient} />,
  };
}

interface CoachesProps {
  selectedClientId?: string | null;
  onClearClient?: () => void;
  activeTab?: string;
}

export default function Marketplace({ selectedClientId, onClearClient, activeTab = 'dashboard' }: CoachesProps) {
  const { data: myProfile, isLoading: profileLoading } = useMyCoachProfile();
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const isPractitioner = hasRole('practitioner');

  if (rolesLoading || profileLoading) {
    return <PageSkeleton />;
  }

  // Practitioners see the Coach Hub
  if (user && isPractitioner) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CoachHub selectedClientId={selectedClientId} onClearClient={onClearClient} activeTab={activeTab} />
      </Suspense>
    );
  }

  // Pricing page
  if (tab === 'pricing') {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CoachPricingPage onBack={() => setSearchParams({})} />
      </Suspense>
    );
  }

  // Default: dual-card landing
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CoachesLanding />
    </Suspense>
  );
}
