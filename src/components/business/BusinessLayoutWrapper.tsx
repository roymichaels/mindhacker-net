/**
 * BusinessLayoutWrapper — Wraps business routes.
 * Hides all sidebars. No chat dock — business is a standalone hub.
 */
import { Suspense, lazy } from 'react';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';

const Business = lazy(() => import('@/pages/Business'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));

export function BusinessIndexWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Business />
    </Suspense>
  );
}

export function BusinessDashboardWrapper() {
  useSidebars(null, null, []);

  return (
    <Suspense fallback={<PageSkeleton />}>
      <BusinessDashboard />
    </Suspense>
  );
}

export function BusinessJourneyWrapper() {
  useSidebars(null, null, []);

  const BusinessJourney = lazy(() => import('@/pages/BusinessJourney'));

  return (
    <Suspense fallback={<PageSkeleton />}>
      <BusinessJourney />
    </Suspense>
  );
}
