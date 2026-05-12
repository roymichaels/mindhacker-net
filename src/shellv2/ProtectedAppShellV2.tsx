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

export default function ProtectedAppShellV2() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <ShellV2>
          <Outlet />
        </ShellV2>
      </OnboardingGate>
    </ProtectedRoute>
  );
}