/**
 * BrainPage — Phase 4 of ShellV2.
 *
 * Replaces the legacy "Brain" tab inside the profile modal with a full route.
 * Mounts `BrainView` inside ShellV2 as the chat surface — the orb background,
 * composer, and overlay layers all stay live so the user can talk to AION
 * about any node without leaving the graph.
 */
import BrainView from "@/features/brain/BrainView";
import BrainErrorBoundary from "@/features/brain/BrainErrorBoundary";
import { zStyle } from "@/shellv2/zindex";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * BrainPage — rendered inside ProtectedAppShellV2 → ShellV2 via <Outlet />.
 * Acts as the chat-slot replacement for /brain. No nested ShellV2 here.
 */
export default function BrainPage() {
  const { isRTL } = useTranslation();
  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-44"
      style={zStyle("chat")}
      data-shellv2-layer="chat"
      data-shellv2-route="brain"
    >
      <BrainErrorBoundary isRTL={isRTL}>
        <BrainView />
      </BrainErrorBoundary>
    </main>
  );
}
