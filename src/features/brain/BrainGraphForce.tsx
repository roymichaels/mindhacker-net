import { useEffect, useMemo, useRef, useState } from "react";
import type { BrainEdge, BrainNode } from "./types";
import { useForceLayout } from "./useForceLayout";
import { styleForNode } from "./brainNodeStyle";

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
      const drag = dragRef.current;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      setT((p) => ({ ...p, tx: drag.tx + dx, ty: drag.ty + dy }));
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

  // Unique colors present in this graph — one radial-gradient per color.
  const colorMap = useMemo(() => {
    const m = new Map<string, string>(); // color -> gradient id
    nodes.forEach((n) => {
      const c = styleForNode(n).color;
      if (!m.has(c)) m.set(c, `g${m.size}`);
    });
    return m;
  }, [nodes]);

  // Stable atmospheric drift particles (positions seeded once per mount)
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        cx: 10 + Math.random() * 80, // %
        cy: 10 + Math.random() * 80,
        r: 0.6 + Math.random() * 1.4,
        delay: Math.random() * 8,
        dur: 14 + Math.random() * 12,
      })),
    [],
  );

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
      {/* Atmospheric vignette behind graph */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 50%, hsl(var(--aion-cyan) / 0.10), transparent 70%)",
        }}
      />
      {/* Drifting consciousness particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-white/60 animate-aion-float"
            style={{
              left: `${p.cx}%`,
              top: `${p.cy}%`,
              width: `${p.r}px`,
              height: `${p.r}px`,
              filter: "blur(0.5px)",
              opacity: 0.4,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}
      </div>

      <svg width={size.w} height={size.h} className="block">
        <defs>
          <filter id="brain-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Radial halo gradients (large, transparent edge) per node color */}
          {Array.from(colorMap.entries()).map(([color, id]) => (
            <radialGradient key={`halo-${id}`} id={`halo-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.55" />
              <stop offset="40%" stopColor={color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          ))}
          {/* Orb gradients — bright core, soft falloff */}
          {Array.from(colorMap.entries()).map(([color, id]) => (
            <radialGradient key={`orb-${id}`} id={`orb-${id}`} cx="40%" cy="38%" r="60%">
              <stop offset="0%" stopColor="white" stopOpacity="0.95" />
              <stop offset="35%" stopColor={color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={color} stopOpacity="0.25" />
            </radialGradient>
          ))}
          {/* Edge gradient — atmospheric cyan link */}
          <linearGradient id="edge-soft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"  stopColor="hsl(var(--aion-cyan))" stopOpacity="0.05" />
            <stop offset="50%" stopColor="hsl(var(--aion-cyan))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--aion-violet))" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g transform={`translate(${t.tx} ${t.ty}) scale(${t.k})`}>
          {/* atmospheric edges — single soft language, no debug dashes */}
          {allEdges.map((e, i) => {
            const a = simById.get(e.from);
            const b = simById.get(e.to);
            if (!a || !b) return null;
            const isFocus = selectedId && (e.from === selectedId || e.to === selectedId);
            const dim = connected && !isFocus ? 0.25 : 1;
            const x1 = num(a.x), y1 = num(a.y), x2 = num(b.x), y2 = num(b.y);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="url(#edge-soft)"
                strokeOpacity={(isFocus ? 0.9 : 0.55) * dim}
                strokeWidth={isFocus ? 1.4 : 0.8}
                strokeLinecap="round"
              />
            );
          })}
          {/* living orb nodes */}
          {sim.map((s) => {
            const style = styleForNode(s.ref);
            const isSel = s.id === selectedId;
            const dim = connected && !isSel && !connected.has(s.id) ? 0.3 : 1;
            const conf = Math.max(0.2, Math.min(1, (Number(s.ref.confidence) || 0) / 100));
            const r = num(s.r, 6);
            const cx = num(s.x), cy = num(s.y);
            const gid = colorMap.get(style.color) ?? "g0";
            const haloR = (isSel ? r * 4.2 : r * 2.8) * (0.7 + conf * 0.4);
            return (
              <g
                key={s.id}
                onPointerDown={(ev) => { ev.stopPropagation(); }}
                onClick={(ev) => { ev.stopPropagation(); onSelect(s.id); }}
                style={{ cursor: "pointer", opacity: dim }}
              >
                {/* Outer breathing halo */}
                <circle
                  cx={cx} cy={cy} r={haloR}
                  fill={`url(#halo-${gid})`}
                  filter="url(#brain-glow)"
                  opacity={0.55 * conf}
                >
                  <animate
                    attributeName="r"
                    values={`${haloR};${haloR * 1.08};${haloR}`}
                    dur={`${4 + (parseInt(s.id.slice(0, 4), 36) % 4)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Orb body — radial gradient sphere */}
                <circle
                  cx={cx} cy={cy} r={r * 1.35}
                  fill={`url(#orb-${gid})`}
                  opacity={0.9}
                />
                {/* Inner luminous core */}
                <circle
                  cx={cx - r * 0.15} cy={cy - r * 0.2}
                  r={Math.max(1.2, r * 0.35)}
                  fill="white"
                  opacity={isSel ? 0.95 : 0.7}
                />
                {isSel && (
                  <>
                    <circle
                      cx={cx} cy={cy} r={haloR * 1.15}
                      fill="none"
                      stroke={style.color}
                      strokeOpacity={0.35}
                      strokeWidth={0.8}
                    />
                    <text
                      x={cx} y={cy + r * 1.6 + 14}
                      textAnchor="middle"
                      fontSize={11 / t.k + 1}
                      fill="hsl(var(--foreground) / 0.92)"
                      style={{ pointerEvents: "none", paintOrder: "stroke", letterSpacing: "0.04em" }}
                      stroke="hsl(230 60% 4% / 0.85)" strokeWidth={3}
                    >
                      {trunc(s.ref.content, 32)}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function trunc(s: string, n: number) {
  return s && s.length > n ? s.slice(0, n - 1) + "…" : s ?? "";
}

function num(v: number, fallback = 0) {
  return Number.isFinite(v) ? v : fallback;
}
