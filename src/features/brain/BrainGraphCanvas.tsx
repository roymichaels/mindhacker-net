import { useMemo } from "react";
import type { BrainEdge, BrainLayer, BrainNode } from "./types";

interface Props {
  nodes: BrainNode[];
  edges: BrainEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  height?: number;
}

const LAYER_COLOR: Record<BrainLayer, string> = {
  surface: "hsl(190 90% 60%)",
  pattern: "hsl(45 95% 60%)",
  deep: "hsl(292 80% 65%)",
};

const LAYER_RING: Record<BrainLayer, number> = {
  surface: 0.42,
  pattern: 0.7,
  deep: 0.95,
};

/**
 * Lightweight polar layout: nodes are clustered in concentric rings by
 * layer (surface → inner, pattern → middle, deep → outer) and spread
 * evenly inside each ring. Sized by score (strength × confidence).
 * No external graph library — pure SVG, mobile-friendly.
 */
export default function BrainGraphCanvas({ nodes, edges, selectedId, onSelect, height = 460 }: Props) {
  const view = 600;
  const cx = view / 2;
  const cy = view / 2;

  const positioned = useMemo(() => {
    const groups: Record<BrainLayer, BrainNode[]> = { surface: [], pattern: [], deep: [] };
    for (const n of nodes) groups[n.layer]?.push(n);
    for (const layer of Object.keys(groups) as BrainLayer[]) {
      groups[layer].sort((a, b) => b.score - a.score);
    }
    const placed = new Map<string, { x: number; y: number; r: number; node: BrainNode }>();
    (Object.keys(groups) as BrainLayer[]).forEach((layer) => {
      const arr = groups[layer];
      const ringR = (view / 2 - 30) * LAYER_RING[layer];
      arr.forEach((n, i) => {
        const angle = (i / Math.max(arr.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * ringR;
        const y = cy + Math.sin(angle) * ringR;
        const r = 6 + Math.min(18, Math.sqrt(n.score) / 3);
        placed.set(n.id, { x, y, r, node: n });
      });
    });
    return placed;
  }, [nodes]);

  const visibleEdges = edges.filter((e) => positioned.has(e.from) && positioned.has(e.to));

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      <svg viewBox={`0 0 ${view} ${view}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Layer guide rings */}
        {(["surface", "pattern", "deep"] as BrainLayer[]).map((layer) => (
          <circle
            key={layer}
            cx={cx}
            cy={cy}
            r={(view / 2 - 30) * LAYER_RING[layer]}
            fill="none"
            stroke="hsl(var(--border))"
            strokeOpacity={0.18}
            strokeDasharray="2 4"
          />
        ))}

        {/* Edges */}
        {visibleEdges.map((e, i) => {
          const a = positioned.get(e.from)!;
          const b = positioned.get(e.to)!;
          const stroke =
            e.relation === "contradicts"
              ? "hsl(0 80% 60%)"
              : e.relation === "reinforces"
              ? "hsl(140 70% 55%)"
              : "hsl(var(--muted-foreground))";
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={stroke}
              strokeOpacity={0.35}
              strokeWidth={Math.min(2, 0.5 + e.weight / 4)}
            />
          );
        })}

        {/* Nodes */}
        {Array.from(positioned.values()).map(({ x, y, r, node }) => {
          const color = LAYER_COLOR[node.layer];
          const isSelected = node.id === selectedId;
          const conf = Math.max(15, Math.min(100, node.confidence)) / 100;
          const isWeak = node.confidence < 30 && !node.user_confirmed;
          return (
            <g
              key={node.id}
              onClick={() => onSelect(node.id)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={x}
                cy={y}
                r={r + 4}
                fill="none"
                stroke={color}
                strokeOpacity={conf}
                strokeWidth={isSelected ? 2.5 : 1.2}
                strokeDasharray={isWeak ? "3 3" : undefined}
              />
              <circle cx={x} cy={y} r={r} fill={color} fillOpacity={0.85} />
              {node.user_confirmed && (
                <circle cx={x} cy={y} r={r * 0.45} fill="hsl(var(--background))" />
              )}
              {isSelected && (
                <text
                  x={x}
                  y={y + r + 12}
                  textAnchor="middle"
                  fontSize={10}
                  fill="hsl(var(--foreground))"
                  style={{ pointerEvents: "none" }}
                >
                  {truncate(node.content, 28)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
        <Legend color={LAYER_COLOR.surface} label="Surface" />
        <Legend color={LAYER_COLOR.pattern} label="Pattern" />
        <Legend color={LAYER_COLOR.deep} label="Deep" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}