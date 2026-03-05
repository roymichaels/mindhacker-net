/**
 * BusinessLayoutWrapper — Wraps business routes to show FM bottom nav.
 */
import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { FMBottomNav } from '@/components/fm/FMBottomNav';
import { PageSkeleton } from '@/components/ui/skeleton';

const Business = lazy(() => import('@/pages/Business'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));

export function BusinessIndexWrapper() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Business />
      </Suspense>
      <FMBottomNav />
    </>
  );
}

export function BusinessDashboardWrapper() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <BusinessDashboard />
      </Suspense>
      <FMBottomNav />
    </>
  );
}
