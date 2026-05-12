/**
 * SmartRoot — what `/` renders.
 *
 * Authenticated users land in the PresenceShell (state-space root, no
 * homepage). Unauthenticated visitors still see the public marketing Index.
 * This is the single hinge that makes the homepage disappear for the user
 * once they cross the auth threshold.
 */
import { lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/ui/skeleton';

const Index = lazy(() => import('@/pages/Index'));
const PresenceShell = lazy(() => import('./PresenceShell'));

export default function SmartRoot() {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  return (
    <Suspense fallback={<PageSkeleton />}>
      {user ? <PresenceShell /> : <Index />}
    </Suspense>
  );
}
