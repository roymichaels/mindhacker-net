import { useState, lazy, Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMyCoachProfile } from '@/domain/coaches';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachSubscription } from '@/hooks/useCoachSubscription';
import { PageSkeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const CoachHub = lazy(() => import('./CoachHub'));
const CoachesLanding = lazy(() => import('@/components/coach/CoachesLanding'));
const CoachPricingPage = lazy(() => import('@/components/coach/CoachPricingPage'));

// Legacy export kept for compatibility — no longer used
export function useCoachSidebars() {
  return { leftSidebar: null, rightSidebar: null };
}

export default function Marketplace() {
  const { data: myProfile, isLoading: profileLoading } = useMyCoachProfile();
  const { hasRole, loading: rolesLoading, refetch: refetchRoles } = useUserRoles();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const checkoutStatus = searchParams.get('checkout');
  const { data: coachSub, refetch: refetchCoachSub } = useCoachSubscription();

  const isPractitioner = hasRole('practitioner');

  useEffect(() => {
    if (checkoutStatus === 'success') {
      toast.success('Subscription activated! Setting up your coach profile...');
      const interval = setInterval(async () => {
        const { data } = await refetchCoachSub();
        if (data?.subscribed) {
          await refetchRoles();
          clearInterval(interval);
          setSearchParams({});
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [checkoutStatus]);

  if (rolesLoading || profileLoading) return <PageSkeleton />;

  if (user && isPractitioner) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CoachHub />
      </Suspense>
    );
  }

  if (tab === 'pricing') {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CoachPricingPage onBack={() => setSearchParams({})} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CoachesLanding />
    </Suspense>
  );
}
