/**
 * BrainPage — Phase 4 of ShellV2.
 *
 * Replaces the legacy "Brain" tab inside the profile modal with a full route.
 * Mounts `BrainView` inside ShellV2 as the chat surface — the orb background,
 * composer, and overlay layers all stay live so the user can talk to AION
 * about any node without leaving the graph.
 */
import ShellV2 from "@/shellv2/ShellV2";
import ProtectedRoute from "@/components/ProtectedRoute";
import BrainView from "@/features/brain/BrainView";
import { zStyle } from "@/shellv2/zindex";

export default function BrainPage() {
  return (
    <ProtectedRoute>
      <ShellV2>
        <main
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-4 pt-16 pb-40"
          style={zStyle("chat")}
          data-shellv2-layer="chat"
          data-shellv2-route="brain"
        >
          <BrainView />
        </main>
      </ShellV2>
    </ProtectedRoute>
  );
}
