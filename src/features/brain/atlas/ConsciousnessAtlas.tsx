/**
 * ConsciousnessAtlas — global navigable map of consciousness rooms.
 *
 * Each room is a force-directed super-node (no perfect circle, no orbit
 * rings, no decorative particles). Cross-room edges from `brain_get_atlas`
 * become spring links; empty rooms participate with weak gravity so the
 * map never collapses. Pinch / drag / wheel-zoom are native via the
 * shared `useGraphGestures` hook.
 *
 * Tap behaviour:
 *  - Real (hallway) room → onRoomTap(roomId) opens RoomView.
 *  - Virtual room → deep-links to its canonical surface (/play, /messages,
 *    /outer-world) without leaving the consciousness shell.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listAtlasRooms } from "./atlasRooms";
import type { BrainAtlas } from "../data/useBrainAtlas";
import { useGraphGestures } from "../useGraphGestures";
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

interface SimRoom {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Deterministic pseudo-random in [-1, 1] from a string. */
function seedJitter(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return ((h % 2000) / 1000) - 1;
}

export default function ConsciousnessAtlas({ atlas, onRoomTap, height = 640 }: Props) {
  const { isRTL } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 360, h: height });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rooms = useMemo(() => listAtlasRooms(), []);
  const stats = useMemo(() => {
    const m = new Map<string, { node_count: number; avg_confidence: number; coverage: number; gaps_count: number }>();
    for (const r of atlas?.rooms ?? []) {
      m.set(r.id, {
        node_count: num(r.node_count),
        avg_confidence: num(r.avg_confidence),
        coverage: num(r.coverage),
        gaps_count: num(r.gaps_count),
      });
    }
    return m;
  }, [atlas]);

  const meta = useMemo(() => {
    return rooms.map((room) => {
      const s = stats.get(room.id);
      const nodeCount = s?.node_count ?? 0;
      const r = 22 + Math.min(40, Math.sqrt(nodeCount) * 7);
      return {
        room,
        nodeCount,
        avgConfidence: s?.avg_confidence ?? 0,
        coverage: s?.coverage ?? 0,
        gaps: s?.gaps_count ?? 0,
        r,
      };
    });
  }, [rooms, stats]);

  const edges = useMemo(() => atlas?.cross_edges ?? [], [atlas]);

  // ---- Force simulation (room-level) ----
  const simRef = useRef<SimRoom[]>([]);
  const [tick, setTick] = useState(0);
  const heatRef = useRef(220);
  const rafRef = useRef<number | null>(null);

  // Rebuild sim when topology changes.
  useEffect(() => {
    const seeded = simRef.current;
    const byId = new Map(seeded.map((s) => [s.id, s] as const));
    simRef.current = meta.map((m) => {
      const prev = byId.get(m.room.id);
      if (prev) return { ...prev, r: m.r };
      // Deterministic jittered seeding around center — never a circle.
      const jx = seedJitter(m.room.id, 1);
      const jy = seedJitter(m.room.id, 7);
      return {
        id: m.room.id,
        x: jx * 160,
        y: jy * 200,
        vx: 0,
        vy: 0,
        r: m.r,
      };
    });
    heatRef.current = 220;
  }, [meta]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const sim = simRef.current;
      if (!sim.length) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      const REPULSE = 9000;
      const LINK = 0.05;
      const LINK_DIST = 130;
      const CENTER = 0.018;
      const DAMP = 0.82;
      const idMap = new Map(sim.map((s) => [s.id, s] as const));

      // repulsion
      for (let i = 0; i < sim.length; i++) {
        const a = sim[i];
        for (let j = i + 1; j < sim.length; j++) {
          const b = sim[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) d2 = 1;
          const f = REPULSE / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }
      // links
      for (const e of edges) {
        const a = idMap.get(e.from_room);
        const b = idMap.get(e.to_room);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const w = Math.max(0.5, Math.min(3, Math.log2(num(e.weight) + 2)));
        const f = (d - LINK_DIST) * LINK * (0.5 + w * 0.25);
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
      // gravity to center
      for (const s of sim) {
        s.vx += -s.x * CENTER;
        s.vy += -s.y * CENTER;
      }
      // integrate
      for (const s of sim) {
        s.vx *= DAMP; s.vy *= DAMP;
        const cap = 9;
        if (s.vx > cap) s.vx = cap; if (s.vx < -cap) s.vx = -cap;
        if (s.vy > cap) s.vy = cap; if (s.vy < -cap) s.vy = -cap;
        s.x += s.vx; s.y += s.vy;
      }
      heatRef.current -= 1;
      setTick((t) => (t + 1) % 1_000_000);
      if (heatRef.current > 0) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [edges, meta.length]);

  // gestures
  const initialTransform = useMemo(
    () => ({ tx: size.w / 2, ty: size.h / 2, k: 1 }),
    [size.w, size.h],
  );
  const { transform: t, handlers } = useGraphGestures(initialTransform);

  const positionById = useMemo(() => {
    const m = new Map<string, { x: number; y: number; r: number }>();
    for (const s of simRef.current) {
      const md = meta.find((x) => x.room.id === s.id);
      m.set(s.id, { x: s.x, y: s.y, r: md?.r ?? 22 });
    }
    return m;
    // tick is intentionally a dependency — this map is the live render snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, meta]);

  const handleTap = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (room.kind === "virtual" && room.deepLink) {
      navigate(room.deepLink);
      return;
    }
    onRoomTap(roomId);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden touch-none select-none"
      style={{ height }}
      dir={isRTL ? "rtl" : "ltr"}
      {...handlers}
    >
      <svg width={size.w} height={size.h} className="block">
        <g transform={`translate(${t.tx} ${t.ty}) scale(${t.k})`}>
          {/* cross-room edges from the live simulation */}
          {edges.map((e, idx) => {
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
                strokeOpacity={0.22}
                strokeWidth={w}
              />
            );
          })}

          {meta.map((m) => {
            const pos = positionById.get(m.room.id);
            if (!pos) return null;
            const empty = m.nodeCount === 0;
            const ringOpacity = empty ? 0.22 : 0.4 + Math.min(0.55, m.avgConfidence / 200);
            const fillOpacity = empty ? 0.05 : 0.1 + Math.min(0.22, m.coverage * 0.3);
            const hue = m.room.ambience.hue;
            const fill = `hsl(${hue} 65% 55% / ${fillOpacity})`;
            const stroke = `hsl(${hue} 65% 70% / ${ringOpacity})`;
            return (
              <g
                key={m.room.id}
                className="cursor-pointer"
                onPointerDown={(ev) => ev.stopPropagation()}
                onClick={(ev) => { ev.stopPropagation(); handleTap(m.room.id); }}
                role="button"
                aria-label={isRTL ? m.room.copy.label.he : m.room.copy.label.en}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={m.r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={empty ? 1 : 2}
                  strokeDasharray={empty ? "3 4" : undefined}
                />
                {m.room.kind === "virtual" && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={m.r - 6}
                    fill="none"
                    stroke={`hsl(${hue} 65% 70% / 0.3)`}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                )}
                {m.gaps > 0 && !empty && (
                  <circle
                    cx={pos.x + m.r * 0.7}
                    cy={pos.y - m.r * 0.7}
                    r={4}
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.85}
                  />
                )}
                <text
                  x={pos.x}
                  y={pos.y + m.r + 14}
                  textAnchor="middle"
                  className="fill-foreground"
                  fontSize={11}
                  fontWeight={500}
                  style={{ pointerEvents: "none", paintOrder: "stroke" }}
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                >
                  {isRTL ? m.room.copy.label.he : m.room.copy.label.en}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + m.r + 27}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize={9}
                  opacity={0.85}
                  style={{ pointerEvents: "none", paintOrder: "stroke" }}
                  stroke="hsl(var(--background))"
                  strokeWidth={2.5}
                >
                  {empty
                    ? (isRTL ? "AION עדיין חוקר" : "AION exploring")
                    : `${m.nodeCount} · ${Math.round(m.avgConfidence)}%`}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
        <span>{isRTL ? "טפיחה לכניסה · גרירה · צביטה לזום" : "Tap to enter · drag · pinch to zoom"}</span>
      </div>
    </div>
  );
}