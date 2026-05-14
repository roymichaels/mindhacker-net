/**
 * RoomView — internal force-graph for one consciousness room.
 *
 * Uses `brain_get_room` (room-scoped nodes + edges + gaps) and reuses
 * BrainGraphForce + BrainNodeSheet so behaviour matches the legacy
 * full-graph view. Surfaces AION's "still exploring" hint when the room
 * is empty and lists the lowest-confidence gaps as inline nudges.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrainGraphForce from "../BrainGraphForce";
import BrainNodeSheet from "../BrainNodeSheet";
import { useBrainRoom } from "../data/useBrainRoom";
import { useCurrentUserId } from "../useBrainOverview";
import type { BrainNode } from "../types";
import { getRoomById } from "@/hallway/rooms";
import { useTranslation } from "@/hooks/useTranslation";
import { Sparkles } from "lucide-react";
import { aionPresence } from "@/copy/aionPresence";
import { useDiagnosticsFlag } from "@/diagnostics/useDiagnosticsFlag";

interface Props {
  roomId: string;
}

export default function RoomView({ roomId }: Props) {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const room = getRoomById(roomId);
  const { data, isLoading, error } = useBrainRoom(userId, roomId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const diag = useDiagnosticsFlag();

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const selected = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const handleTalkToAion = (node: BrainNode) => {
    try {
      sessionStorage.setItem(
        "aion.brain_focus",
        JSON.stringify({
          node_id: node.id,
          type: node.type,
          content: node.content,
          room: roomId,
        }),
      );
    } catch {}
    navigate("/aurora");
  };

  if (isLoading) {
    return <div className="h-[460px] rounded-2xl bg-muted/20 animate-pulse" />;
  }

  if (error) {
    return (
      <p className="text-[11px] text-muted-foreground/70">
        {isRTL ? aionPresence.aionLostFocus.he : aionPresence.aionLostFocus.en}
        {diag && <span className="ms-2 text-destructive/70">{error.message}</span>}
      </p>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.03] p-6 text-center space-y-2">
        <Sparkles className="w-6 h-6 mx-auto text-primary/70" />
        <p className="text-sm text-foreground">
          {isRTL ? aionPresence.roomStillForming.he : aionPresence.roomStillForming.en}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {isRTL ? aionPresence.aionPiecingTogether.he : aionPresence.aionPiecingTogether.en}
        </p>
        <button
          type="button"
          onClick={() => navigate("/aurora")}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-medium"
        >
          {isRTL ? aionPresence.askAionAboutThis.he : aionPresence.askAionAboutThis.en}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-foreground/70 italic px-1">
        {isRTL ? aionPresence.roomNoticingPattern.he : aionPresence.roomNoticingPattern.en}
      </p>

      <div className="-mx-4">
        <BrainGraphForce
          nodes={nodes}
          edges={edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {data?.gaps && data.gaps.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] p-3 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {isRTL ? aionPresence.aionPiecingTogether.he : aionPresence.aionPiecingTogether.en}
          </p>
          <ul className="space-y-1.5">
            {data.gaps.slice(0, 5).map((g) => (
              <li
                key={g.id}
                className="text-xs text-foreground/85"
              >
                {g.content}
              </li>
            ))}
          </ul>
        </div>
      )}

      <BrainNodeSheet
        node={selected}
        onClose={() => setSelectedId(null)}
        onTalkToAion={handleTalkToAion}
      />
    </div>
  );
}