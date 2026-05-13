/**
 * ProtectedAppShellV2 — auth + onboarding gate that renders ShellV2.
 *
 * Mirrors `src/components/layout/ProtectedAppShell.tsx` but skips every
 * legacy provider (`SidebarProvider`, `ChromeVisibilityProvider`,
 * `DashboardLayout`, `HubModalProvider`, …). Activated route-by-route
 * behind the `ff_shell_v2` client flag during Phases 2–5.
 */
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { OnboardingGate } from '@/components/layout/OnboardingGate';
import ShellV2 from './ShellV2';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ChromeVisibilityProvider } from '@/contexts/ChromeVisibilityContext';
import { AuroraActionsProvider } from '@/contexts/AuroraActionsContext';
import GameLayerBootstrap from '@/components/game/GameLayerBootstrap';

export default function ProtectedAppShellV2() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <ChromeVisibilityProvider>
          <SidebarProvider>
            <AuroraActionsProvider>
              <ShellV2>
                <GameLayerBootstrap />
                <Outlet />
              </ShellV2>
            </AuroraActionsProvider>
          </SidebarProvider>
        </ChromeVisibilityProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}