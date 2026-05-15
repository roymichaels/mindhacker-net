/**
 * BrainPage — Phase 4 of ShellV2.
 *
 * Replaces the legacy "Brain" tab inside the profile modal with a full route.
 * Mounts `BrainView` inside ShellV2 as the chat surface — the orb background,
 * composer, and overlay layers all stay live so the user can talk to AION
 * about any node without leaving the graph.
 */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BrainErrorBoundary from "@/features/brain/BrainErrorBoundary";
import ConsciousnessAtlas from "@/features/brain/atlas/ConsciousnessAtlas";
import RoomView from "@/features/brain/atlas/RoomView";
import { useBrainAtlas } from "@/features/brain/data/useBrainAtlas";
import { useCurrentUserId } from "@/features/brain/useBrainOverview";
import { getRoomById } from "@/hallway/rooms";
import ShellHeader from "@/shellv2/ShellHeader";
import { zStyle } from "@/shellv2/zindex";
import { useTranslation } from "@/hooks/useTranslation";
import { useProfileModal } from "@/contexts/ProfileModalContext";
import { aionPresence } from "@/copy/aionPresence";
import { useDiagnosticsFlag } from "@/diagnostics/useDiagnosticsFlag";
import { ViewIdentityScope } from "@/viewIdentity";

/**
 * BrainPage — rendered inside ProtectedAppShellV2 → ShellV2 via <Outlet />.
 * Acts as the chat-slot replacement for /brain. No nested ShellV2 here.
 */
export default function BrainPage() {
  const { isRTL } = useTranslation();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") ?? "atlas";
  const room = params.get("room");
  const panel = params.get("panel");
  const userId = useCurrentUserId();
  const { data: atlas, isLoading: atlasLoading, error: atlasError } = useBrainAtlas(userId);
  const { openProfile } = useProfileModal();
  const diag = useDiagnosticsFlag();

  // Phase E — /profile is consolidated into Brain. Opening /brain?panel=profile
  // surfaces the profile overlay once, then strips the param so back/forward
  // doesn't re-trigger.
  useEffect(() => {
    if (panel === "profile") {
      openProfile();
      const next = new URLSearchParams(params);
      next.delete("panel");
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  const goAtlas = () => setParams({});
  const goRoom = (roomId: string) => setParams({ view: "room", room: roomId });
  const roomDef = room ? getRoomById(room) : null;

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      style={zStyle("chat")}
      data-shellv2-layer="chat"
      data-shellv2-route="brain"
    >
      <ViewIdentityScope id="brain" />
      <BrainErrorBoundary isRTL={isRTL}>
        {view === "room" && roomDef ? (
          <div className="flex flex-col h-full overflow-y-auto overscroll-contain touch-pan-y px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-44 space-y-3">
            <ShellHeader
              showBack
              onBack={goAtlas}
              title={isRTL ? roomDef.copy.label.he : roomDef.copy.label.en}
              subtitle={isRTL ? roomDef.copy.tagline.he : roomDef.copy.tagline.en}
            />
            <RoomView roomId={roomDef.id} />
          </div>
        ) : (
          <div className="relative h-full w-full">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-6 pt-[max(env(safe-area-inset-top),1rem)] text-center">
              <p className="text-[12px] italic text-foreground/55">
                {isRTL ? aionPresence.aionInnerView.he : aionPresence.aionInnerView.en}
              </p>
              {atlasError && (
                <p className="mt-1 text-[10px] text-muted-foreground/70">
                  {isRTL ? aionPresence.aionLostFocus.he : aionPresence.aionLostFocus.en}
                  {diag && <span className="ms-2 text-destructive/70">{atlasError.message}</span>}
                </p>
              )}
            </div>

            <div className="absolute inset-0 pb-32">
              {atlasLoading ? (
                <div className="h-full w-full bg-muted/10 animate-pulse" />
              ) : (
                <ConsciousnessAtlas
                  atlas={atlas ?? null}
                  onRoomTap={goRoom}
                  height={typeof window !== "undefined" ? window.innerHeight : 720}
                />
              )}
            </div>
          </div>
        )}
      </BrainErrorBoundary>
    </main>
  );
}
