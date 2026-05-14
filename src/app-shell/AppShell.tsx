/**
 * @deprecated Dead skeleton. ShellV2 (`src/shellv2/ShellV2.tsx`) is the canonical
 * shell. Scheduled for deletion in Phase B of `.lovable/plan.md`.
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