/**
 * Freelancer — entry router page (mirrors Coaches.tsx pattern).
 * Shows FreelancerHub if user has freelancer role, otherwise shows landing.
 */
import { lazy, Suspense } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';

const FreelancerHub = lazy(() => import('./FreelancerHub'));
const FreelancerLanding = lazy(() => import('@/components/freelancer/FreelancerLanding'));

export default function Freelancer() {
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const { user } = useAuth();

  // @ts-ignore — 'freelancer' role added via migration
  const isFreelancer = hasRole('freelancer');

  if (rolesLoading) return <PageSkeleton />;

  if (user && isFreelancer) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <FreelancerHub />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <FreelancerLanding />
    </Suspense>
  );
}
