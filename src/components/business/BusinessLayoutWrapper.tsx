/**
 * BusinessLayoutWrapper — Wraps business routes to show FM bottom nav.
 * Hides default DashboardLayout sidebars since business is part of the FM sub-app.
 */
import { Suspense, lazy } from 'react';
import { FMBottomNav } from '@/components/fm/FMBottomNav';
import { PageSkeleton } from '@/components/ui/skeleton';
import { useSidebars } from '@/hooks/useSidebars';

const Business = lazy(() => import('@/pages/Business'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));

export function BusinessIndexWrapper() {
  useSidebars(null, null, []);

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
  useSidebars(null, null, []);

  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <BusinessDashboard />
      </Suspense>
      <FMBottomNav />
    </>
  );
}
