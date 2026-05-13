/**
 * ConsciousnessAtlas — global navigable map of the 8 rooms.
 *
 * Layout: rooms placed on a circle around the center. Cluster radius scales
 * with `node_count`; ring stroke encodes `avg_confidence`; fill opacity
 * encodes `coverage`. Cross-room edges are thin lines between centers.
 * Empty rooms render as fog (low alpha + dashed ring) and surface a
 * "AION is still exploring" hint on tap.
 *
 * No gradients, no drop-shadows (per design memory). Mobile-first SVG.
 */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { listRooms } from "@/hallway/rooms";
import type { RoomDefinition } from "@/hallway/types";
import type { BrainAtlas } from "../data/useBrainAtlas";
import { useTranslation } from "@/hooks/useTranslation";

interface Props {
  atlas: BrainAtlas | null;
  onRoomTap: (roomId: string) => void;
  height?: number;
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function ConsciousnessAtlas({ atlas, onRoomTap, height = 520 }: Props) {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const rooms = listRooms();

  const positioned = useMemo(() => {
    const cx = 200;
    const cy = height / 2;
    const radius = Math.min(170, height / 2 - 80);
    const stats = new Map(
      (atlas?.rooms ?? []).map((r) => [r.id, r] as const),
    );
    return rooms.map((room, i) => {
      const angle = (i / rooms.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const s = stats.get(room.id);
      const nodeCount = num(s?.node_count);
      const r = 18 + Math.min(36, Math.sqrt(nodeCount) * 6);
      return {
        room,
        x,
        y,
        r,
        nodeCount,
        avgConfidence: num(s?.avg_confidence),
        coverage: num(s?.coverage),
        gaps: num(s?.gaps_count),
      };
    });
  }, [atlas, height, rooms]);

  const positionById = useMemo(() => {
    const m = new Map<string, { x: number; y: number; r: number }>();
    for (const p of positioned) m.set(p.room.id, { x: p.x, y: p.y, r: p.r });
    return m;
  }, [positioned]);

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <svg
        viewBox={`0 0 400 ${height}`}
        className="w-full h-auto select-none touch-none"
        role="img"
        aria-label={isRTL ? "מפת תודעה" : "Consciousness map"}
      >
        {/* Cross-room edges (drawn first so rooms overlap them) */}
        {(atlas?.cross_edges ?? []).map((e, idx) => {
          const a = positionById.get(e.from_room);
          const b = positionById.get(e.to_room);
          if (!a || !b) return null;
          const w = Math.max(1, Math.min(3, Math.log2(num(e.weight) + 1)));
          return (
            <line
              key={`xe-${idx}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="hsl(var(--primary))"
              strokeOpacity={0.18}
              strokeWidth={w}
            />
          );
        })}

        {/* Rooms */}
        {positioned.map(({ room, x, y, r, nodeCount, avgConfidence, coverage, gaps }) => {
          const empty = nodeCount === 0;
          const ringOpacity = empty ? 0.18 : 0.4 + Math.min(0.6, avgConfidence / 200);
          const fillOpacity = empty ? 0.04 : 0.08 + Math.min(0.22, coverage * 0.3);
          const hue = room.ambience.hue;
          const fill = `hsl(${hue} 65% 55% / ${fillOpacity})`;
          const stroke = `hsl(${hue} 65% 65% / ${ringOpacity})`;
          return (
            <g
              key={room.id}
              className="cursor-pointer"
              onClick={() => onRoomTap(room.id)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") onRoomTap(room.id);
              }}
              tabIndex={0}
              role="button"
              aria-label={isRTL ? room.copy.label.he : room.copy.label.en}
            >
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={empty ? 1 : 2}
                strokeDasharray={empty ? "3 4" : undefined}
              />
              {/* gap dot */}
              {gaps > 0 && !empty && (
                <circle
                  cx={x + r * 0.7}
                  cy={y - r * 0.7}
                  r={4}
                  fill="hsl(var(--destructive))"
                  fillOpacity={0.85}
                />
              )}
              <text
                x={x}
                y={y + r + 16}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="11"
                fontWeight={500}
              >
                {isRTL ? room.copy.label.he : room.copy.label.en}
              </text>
              <text
                x={x}
                y={y + r + 30}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="9"
                opacity={0.8}
              >
                {empty
                  ? isRTL
                    ? "AION עדיין חוקר"
                    : "AION exploring"
                  : `${nodeCount} · ${Math.round(avgConfidence)}%`}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 px-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {isRTL ? "טפיחה על חדר לכניסה" : "Tap a room to enter"}
        </span>
        <button
          type="button"
          className="underline hover:text-foreground"
          onClick={() => navigate("/hallway")}
        >
          {isRTL ? "מצב פרוזדור" : "Hallway view"}
        </button>
      </div>
    </div>
  );
}