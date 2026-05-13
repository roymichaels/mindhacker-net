import { useEffect, useMemo, useRef, useState } from "react";
import type { BrainEdge, BrainNode } from "./types";
import { useForceLayout } from "./useForceLayout";
import { edgeStyle, styleForNode } from "./brainNodeStyle";

interface Props {
  nodes: BrainNode[];
  edges: BrainEdge[];
  softEdges?: Array<BrainEdge & { inferred: true }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  height?: number;
}

interface Transform { tx: number; ty: number; k: number }

export default function BrainGraphForce({
  nodes, edges, softEdges = [], selectedId, onSelect, height = 520,
}: Props) {
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

  const allEdges = useMemo(
    () => [
      ...edges.map((e) => ({ from: e.from, to: e.to, weight: e.weight, relation: e.relation, inferred: false })),
      ...softEdges.map((e) => ({ from: e.from, to: e.to, weight: e.weight, relation: e.relation, inferred: true })),
    ],
    [edges, softEdges],
  );

  const { sim, tick, reheat } = useForceLayout(nodes, {
    width: size.w, height: size.h, edges: allEdges,
  });

  // pan / zoom
  const [t, setT] = useState<Transform>({ tx: size.w / 2, ty: size.h / 2, k: 1 });
  useEffect(() => { setT((p) => ({ ...p, tx: size.w / 2, ty: size.h / 2 })); }, [size.w, size.h]);

  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number; pid: number } | null>(null);
  const pinchRef = useRef<{ d: number; k: number; pts: Map<number, { x: number; y: number }> } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { x: e.clientX, y: e.clientY, tx: t.tx, ty: t.ty, pid: e.pointerId };
    } else if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { d, k: t.k, pts: new Map(pointers.current) };
      dragRef.current = null;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinchRef.current && pointers.current.size >= 2) {
      const pts = Array.from(pointers.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const k = Math.max(0.4, Math.min(3, pinchRef.current.k * (d / pinchRef.current.d)));
      setT((p) => ({ ...p, k }));
    } else if (dragRef.current && dragRef.current.pid === e.pointerId) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      setT((p) => ({ ...p, tx: dragRef.current!.tx + dx, ty: dragRef.current!.ty + dy }));
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) dragRef.current = null;
  };
  const onWheel = (e: React.WheelEvent) => {
    const factor = Math.exp(-e.deltaY * 0.0015);
    setT((p) => ({ ...p, k: Math.max(0.4, Math.min(3, p.k * factor)) }));
  };

  // recenter when selection changes (just reheat a touch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (selectedId) reheat(40); }, [selectedId]);

  const simById = useMemo(() => {
    const m = new Map<string, typeof sim[number]>();
    sim.forEach((s) => m.set(s.id, s));
    return m;
  }, [sim, tick]);

  const connected = useMemo(() => {
    if (!selectedId) return null;
    const s = new Set<string>();
    for (const e of allEdges) {
      if (e.from === selectedId) s.add(e.to);
      if (e.to === selectedId) s.add(e.from);
    }
    return s;
  }, [selectedId, allEdges]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden touch-none select-none"
      style={{ height }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
    >
      <svg width={size.w} height={size.h} className="block">
        <defs>
          <filter id="brain-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${t.tx} ${t.ty}) scale(${t.k})`}>
          {/* edges */}
          {allEdges.map((e, i) => {
            const a = simById.get(e.from);
            const b = simById.get(e.to);
            if (!a || !b) return null;
            const st = edgeStyle(("relation" in e ? (e as any).relation : "related") as string, e.inferred);
            const dim = connected && !(e.from === selectedId || e.to === selectedId) ? 0.35 : 1;
            const x1 = num(a.x), y1 = num(a.y), x2 = num(b.x), y2 = num(b.y);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={st.stroke}
                strokeOpacity={st.opacity * dim}
                strokeWidth={Math.min(2, 0.6 + (e.weight ?? 1) / 5)}
                strokeDasharray={st.dash}
              />
            );
          })}
          {/* nodes */}
          {sim.map((s) => {
            const style = styleForNode(s.ref);
            const isSel = s.id === selectedId;
            const dim = connected && !isSel && !connected.has(s.id) ? 0.3 : 1;
            const conf = Math.max(0.2, Math.min(1, (Number(s.ref.confidence) || 0) / 100));
            const r = num(s.r, 6);
            const cx = num(s.x), cy = num(s.y);
            return (
              <g
                key={s.id}
                onPointerDown={(ev) => { ev.stopPropagation(); }}
                onClick={(ev) => { ev.stopPropagation(); onSelect(s.id); }}
                style={{ cursor: "pointer", opacity: dim }}
              >
                <circle cx={cx} cy={cy} r={r + 8} fill={style.color} fillOpacity={0.18 * conf} filter="url(#brain-glow)" />
                {style.shape === "circle" && (
                  <circle cx={cx} cy={cy} r={r} fill={style.color} fillOpacity={0.85} />
                )}
                {style.shape === "ring" && (
                  <>
                    <circle cx={cx} cy={cy} r={r} fill="hsl(var(--background))" />
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke={style.color} strokeWidth={2.4} />
                  </>
                )}
                {style.shape === "diamond" && (
                  <rect
                    x={cx - r} y={cy - r} width={r * 2} height={r * 2}
                    fill={style.color} fillOpacity={0.85}
                    transform={`rotate(45 ${cx} ${cy})`}
                    rx={1}
                  />
                )}
                {style.shape === "square" && (
                  <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={3}
                    fill={style.color} fillOpacity={0.85} />
                )}
                <circle cx={cx} cy={cy} r={r + 3}
                  fill="none" stroke={style.color}
                  strokeOpacity={isSel ? 0.95 : 0}
                  strokeWidth={2}
                />
                {isSel && (
                  <text x={cx} y={cy + r + 14} textAnchor="middle"
                    fontSize={11 / t.k + 1}
                    fill="hsl(var(--foreground))"
                    style={{ pointerEvents: "none", paintOrder: "stroke" }}
                    stroke="hsl(var(--background))" strokeWidth={3}
                  >
                    {trunc(s.ref.content, 32)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-1 flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70">
        <span>{nodes.length} nodes</span>
        <span>·</span>
        <span>{edges.length} edges{softEdges.length ? ` + ${softEdges.length} soft` : ""}</span>
      </div>
    </div>
  );
}

function trunc(s: string, n: number) {
  return s && s.length > n ? s.slice(0, n - 1) + "…" : s ?? "";
}

function num(v: number, fallback = 0) {
  return Number.isFinite(v) ? v : fallback;
}
