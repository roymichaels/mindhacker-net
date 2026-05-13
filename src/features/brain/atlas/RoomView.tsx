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
      <p className="text-[11px] text-destructive">
        {isRTL ? "שגיאת חדר: " : "Room error: "}
        {error.message}
      </p>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-2xl bg-white/[0.03] p-6 text-center space-y-2">
        <Sparkles className="w-6 h-6 mx-auto text-primary/70" />
        <p className="text-sm text-foreground">
          {isRTL
            ? `${room?.copy.label.he ?? "החדר"} עדיין ריק`
            : `${room?.copy.label.en ?? "This room"} is still empty`}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {isRTL
            ? "AION יבנה אותו משיחות, יומנים ומשימות."
            : "AION will build it from conversations, journals and missions."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/aurora")}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-medium"
        >
          {isRTL ? "דבר עם AION" : "Talk to AION"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
            {isRTL ? "פערים שזוהו" : "Detected gaps"}
          </p>
          <ul className="space-y-1.5">
            {data.gaps.slice(0, 5).map((g) => (
              <li
                key={g.id}
                className="flex items-start justify-between gap-2 text-xs text-foreground"
              >
                <span className="flex-1">{g.content}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {Math.round(g.confidence)}%
                </span>
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