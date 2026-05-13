import { useEffect, useRef, useState } from "react";
import type { BrainEdge, BrainNode } from "./types";

export interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean;
  pillar: string | null;
  type: string;
  r: number;
  ref: BrainNode;
}

interface Options {
  width: number;
  height: number;
  edges: { from: string; to: string; weight: number; inferred?: boolean }[];
}

/**
 * Tiny force-directed layout. No external library.
 * - charge repulsion (O(n²), capped)
 * - link springs (real edges stiffer than inferred)
 * - per-pillar centroid gravity
 * - mild center gravity
 * Identity nodes pinned near center.
 */
export function useForceLayout(nodes: BrainNode[], opts: Options) {
  const [tick, setTick] = useState(0);
  const simRef = useRef<SimNode[]>([]);
  const idMapRef = useRef<Map<string, SimNode>>(new Map());
  const rafRef = useRef<number | null>(null);
  const heatRef = useRef(160);

  // Rebuild sim nodes when topology changes
  useEffect(() => {
    const cx = 0;
    const cy = 0;
    const next: SimNode[] = nodes.map((n, i) => {
      const prev = idMapRef.current.get(n.id);
      const angle = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      const radius = 60 + Math.random() * 120;
      return prev
        ? { ...prev, ref: n, type: n.type, pillar: n.pillar, r: 6 + Math.min(16, Math.sqrt(n.score) / 3), pinned: n.type === "identity" }
        : {
            id: n.id,
            x: n.type === "identity" ? cx : cx + Math.cos(angle) * radius,
            y: n.type === "identity" ? cy : cy + Math.sin(angle) * radius,
            vx: 0, vy: 0,
            pinned: n.type === "identity",
            pillar: n.pillar,
            type: n.type,
            r: 6 + Math.min(16, Math.sqrt(n.score) / 3),
            ref: n,
          };
    });
    const map = new Map<string, SimNode>();
    next.forEach((s) => map.set(s.id, s));
    simRef.current = next;
    idMapRef.current = map;
    heatRef.current = 160;
  }, [nodes]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      const sim = simRef.current;
      if (!sim.length) { rafRef.current = requestAnimationFrame(step); return; }

      const REPULSE = 1400;
      const LINK = 0.04;
      const LINK_SOFT = 0.012;
      const LINK_DIST = 70;
      const CENTER = 0.012;
      const PILLAR = 0.025;
      const DAMP = 0.82;

      // pillar centroids
      const centroids = new Map<string, { x: number; y: number; n: number }>();
      for (const s of sim) {
        if (!s.pillar) continue;
        const c = centroids.get(s.pillar) ?? { x: 0, y: 0, n: 0 };
        c.x += s.x; c.y += s.y; c.n += 1;
        centroids.set(s.pillar, c);
      }
      centroids.forEach((c) => { c.x /= c.n; c.y /= c.n; });

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
      for (const e of opts.edges) {
        const a = idMapRef.current.get(e.from);
        const b = idMapRef.current.get(e.to);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const k = e.inferred ? LINK_SOFT : LINK;
        const f = (d - LINK_DIST) * k;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // gravity
      for (const s of sim) {
        s.vx += -s.x * CENTER;
        s.vy += -s.y * CENTER;
        if (s.pillar) {
          const c = centroids.get(s.pillar);
          if (c) {
            s.vx += (c.x - s.x) * PILLAR * 0.3;
            s.vy += (c.y - s.y) * PILLAR * 0.3;
          }
        }
      }

      // integrate
      for (const s of sim) {
        if (s.pinned) { s.x = 0; s.y = 0; s.vx = 0; s.vy = 0; continue; }
        s.vx *= DAMP; s.vy *= DAMP;
        const cap = 8;
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
  }, [opts.edges, nodes.length]);

  const reheat = (n = 80) => { heatRef.current = Math.max(heatRef.current, n); };

  return { sim: simRef.current, tick, reheat };
}
