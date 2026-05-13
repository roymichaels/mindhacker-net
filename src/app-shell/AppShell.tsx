/**
 * AppShell — unified shell scaffold.
 *
 * Phase 1: structural skeleton only. Wires nothing yet; mounted only
 * behind the `ff_app_shell` feature flag. Real layers will be lifted
 * out of `src/shellv2/*` in subsequent phases.
 */
import { Outlet } from "react-router-dom";
import OverlayHost from "@/app-shell/overlay/OverlayHost";

export default function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ChromeLayer placeholder — header + bottom nav land here in P2 */}
      <main className="flex-1 relative">
        <Outlet />
      </main>
      <OverlayHost />
    </div>
  );
}