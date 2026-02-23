/**
 * ProtectedAppShell - Root layout for ALL authenticated routes.
 * Renders header, sidebars (via context), bottom tab, aurora dock.
 * Hub pages set their sidebars via useSidebars() hook.
 */
import { Suspense, lazy } from 'react';
import { Outlet } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/skeleton';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardLayout = lazy(() => import('@/components/dashboard/DashboardLayout'));

export default function ProtectedAppShell() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <Suspense fallback={<PageSkeleton />}>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </Suspense>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
