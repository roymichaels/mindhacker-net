/**
 * BrainPage — Phase 4 of ShellV2.
 *
 * Replaces the legacy "Brain" tab inside the profile modal with a full route.
 * Mounts `BrainView` inside ShellV2 as the chat surface — the orb background,
 * composer, and overlay layers all stay live so the user can talk to AION
 * about any node without leaving the graph.
 */
import { useSearchParams } from "react-router-dom";
import BrainView from "@/features/brain/BrainView";
import BrainErrorBoundary from "@/features/brain/BrainErrorBoundary";
import ConsciousnessAtlas from "@/features/brain/atlas/ConsciousnessAtlas";
import RoomView from "@/features/brain/atlas/RoomView";
import SelfPanel from "@/features/brain/SelfPanel";
import { useBrainAtlas } from "@/features/brain/data/useBrainAtlas";
import { useCurrentUserId } from "@/features/brain/useBrainOverview";
import { getRoomById } from "@/hallway/rooms";
import ShellHeader from "@/shellv2/ShellHeader";
import { zStyle } from "@/shellv2/zindex";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * BrainPage — rendered inside ProtectedAppShellV2 → ShellV2 via <Outlet />.
 * Acts as the chat-slot replacement for /brain. No nested ShellV2 here.
 */
export default function BrainPage() {
  const { isRTL } = useTranslation();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") ?? "atlas";
  const room = params.get("room");
  const userId = useCurrentUserId();
  const { data: atlas, isLoading: atlasLoading, error: atlasError } = useBrainAtlas(userId);

  const goAtlas = () => setParams({});
  const goRoom = (roomId: string) => setParams({ view: "room", room: roomId });
  const roomDef = room ? getRoomById(room) : null;

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain touch-pan-y px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-44"
      style={zStyle("chat")}
      data-shellv2-layer="chat"
      data-shellv2-route="brain"
    >
      <BrainErrorBoundary isRTL={isRTL}>
        {view === "room" && roomDef ? (
          <div className="space-y-3">
            <ShellHeader
              showBack
              onBack={goAtlas}
              title={isRTL ? roomDef.copy.label.he : roomDef.copy.label.en}
              subtitle={isRTL ? roomDef.copy.tagline.he : roomDef.copy.tagline.en}
            />
            <RoomView roomId={roomDef.id} />
          </div>
        ) : (
          <div className="space-y-4">
            <ShellHeader
              title={isRTL ? "מפת התודעה" : "Consciousness Map"}
              subtitle={
                isRTL
                  ? "כל חדר הוא מערכת תודעה ש־AION מעדכן"
                  : "Each room is a consciousness system AION keeps updating"
              }
            />
            <SelfPanel isRTL={isRTL} atlas={atlas ?? null} />
            {atlasError && (
              <p className="text-[11px] text-destructive">
                {isRTL ? "שגיאת מפה: " : "Atlas error: "}
                {atlasError.message}
              </p>
            )}
            {atlasLoading ? (
              <div className="h-[480px] rounded-2xl bg-muted/20 animate-pulse" />
            ) : (
              <ConsciousnessAtlas atlas={atlas ?? null} onRoomTap={goRoom} />
            )}
            <details className="rounded-2xl bg-white/[0.03] p-3">
              <summary className="text-[11px] text-muted-foreground cursor-pointer">
                {isRTL ? "תצוגת גרף מלא (מורשת)" : "Full graph (legacy)"}
              </summary>
              <div className="mt-3">
                <BrainView />
              </div>
            </details>
          </div>
        )}
      </BrainErrorBoundary>
    </main>
  );
}
