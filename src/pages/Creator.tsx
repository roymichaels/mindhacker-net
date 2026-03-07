/**
 * Creator — entry router page (mirrors Coaches.tsx pattern).
 * Shows CreatorHub if user has creator role, otherwise shows landing.
 */
import { lazy, Suspense } from 'react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';

const CreatorHub = lazy(() => import('./CreatorHub'));
const CreatorLanding = lazy(() => import('@/components/creator/CreatorLanding'));

export default function Creator() {
  const { hasRole, loading: rolesLoading } = useUserRoles();
  const { user } = useAuth();

  // @ts-ignore — 'creator' role added via migration
  const isCreator = hasRole('creator');

  if (rolesLoading) return <PageSkeleton />;

  if (user && isCreator) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <CreatorHub />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CreatorLanding />
    </Suspense>
  );
}
