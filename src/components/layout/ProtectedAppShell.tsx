/**
 * ProtectedAppShell - Root layout for ALL authenticated routes.
 * Renders header, sidebars (via context), bottom tab, aurora dock.
 * Hub pages set their sidebars via useSidebars() hook.
 * Gates access behind authentication AND onboarding completion.
 */
import { Suspense } from 'react';
import { lazyWithRetry } from '@/lib/lazyWithRetry';
import { Outlet } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/skeleton';
import { SidebarProvider } from '@/contexts/SidebarContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OnboardingGate } from '@/components/layout/OnboardingGate';
import { ChromeVisibilityProvider } from '@/contexts/ChromeVisibilityContext';
import GameLayerBootstrap from '@/components/game/GameLayerBootstrap';
import { useAionDecision } from '@/contexts/AionDecisionContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DashboardLayout = lazyWithRetry(() => import('@/components/dashboard/DashboardLayout'), 'DashboardLayout');

function RouteSignalEmitter() {
  const location = useLocation();
  const { signal } = useAionDecision();
  useEffect(() => {
    signal('route_change', { path: location.pathname });
  }, [location.pathname, signal]);
  return null;
}

export default function ProtectedAppShell() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <ChromeVisibilityProvider>
          <SidebarProvider>
            <Suspense fallback={<PageSkeleton />}>
              <DashboardLayout>
                <RouteSignalEmitter />
                <GameLayerBootstrap />
                <Outlet />
              </DashboardLayout>
            </Suspense>
          </SidebarProvider>
        </ChromeVisibilityProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}
