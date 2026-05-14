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
import { useEffect } from 'react';
import {
  ManifestationProvider,
  ManifestationLayer,
} from '@/components/aion/manifestation';

/**
 * Phase B tripwire — fires once on mount in dev to confirm ShellV2 is the
 * sole active shell. If a legacy shell ever re-mounts in the same tree we
 * will see two `[ShellSentinel]` messages instead of one.
 */
function ShellSentinel() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window as unknown as { __MINDOS_SHELL__?: string };
    if (w.__MINDOS_SHELL__ && w.__MINDOS_SHELL__ !== 'ShellV2') {
      // eslint-disable-next-line no-console
      console.error(
        `[ShellSentinel] Legacy shell "${w.__MINDOS_SHELL__}" mounted alongside ShellV2 — Phase B violated.`,
      );
    }
    w.__MINDOS_SHELL__ = 'ShellV2';
    // eslint-disable-next-line no-console
    if (import.meta.env.DEV) console.info('[ShellSentinel] ShellV2 active (Phase B).');
    return () => {
      if (w.__MINDOS_SHELL__ === 'ShellV2') delete w.__MINDOS_SHELL__;
    };
  }, []);
  return null;
}

export default function ProtectedAppShellV2() {
  return (
    <ProtectedRoute>
      <OnboardingGate>
        <ChromeVisibilityProvider>
          <SidebarProvider>
            <AuroraActionsProvider>
              <ManifestationProvider>
                <ShellV2>
                  <ShellSentinel />
                  <GameLayerBootstrap />
                  <Outlet />
                </ShellV2>
                <ManifestationLayer />
              </ManifestationProvider>
            </AuroraActionsProvider>
          </SidebarProvider>
        </ChromeVisibilityProvider>
      </OnboardingGate>
    </ProtectedRoute>
  );
}