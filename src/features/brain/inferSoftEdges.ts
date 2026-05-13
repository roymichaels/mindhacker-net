import type { BrainEdge, BrainNode } from "./types";

const STOP = new Set([
  "the","a","an","and","or","but","if","then","of","to","in","on","for","with","at","by",
  "is","are","was","were","be","been","being","i","you","he","she","it","we","they","my",
  "your","this","that","these","those","not","no","do","does","did","have","has","had",
  "will","would","can","could","should","about","from","as","so","just","like","really",
]);

function tokens(s: string): string[] {
  return (s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOP.has(t));
}

export interface SoftEdge extends BrainEdge {
  inferred: true;
}

/**
 * Infer soft client-side edges when backend edges are sparse.
 * Heuristics: same pillar (weak), shared significant tokens (medium),
 * same type within same pillar (weak). Caps degree per node.
 */
export function inferSoftEdges(nodes: BrainNode[], existing: BrainEdge[]): SoftEdge[] {
  if (nodes.length < 2) return [];
  const have = new Set<string>();
  for (const e of existing) {
    have.add(`${e.from}|${e.to}`);
    have.add(`${e.to}|${e.from}`);
  }
  const tokMap = new Map<string, Set<string>>();
  for (const n of nodes) tokMap.set(n.id, new Set(tokens(n.content)));

  const degree = new Map<string, number>();
  const inc = (id: string) => degree.set(id, (degree.get(id) ?? 0) + 1);
  const MAX_DEG = 4;

  const candidates: Array<{ from: string; to: string; w: number; rel: string }> = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const key = `${a.id}|${b.id}`;
      if (have.has(key)) continue;

      let weight = 0;
      let rel = "related";
      const ta = tokMap.get(a.id)!;
      const tb = tokMap.get(b.id)!;
      let shared = 0;
      ta.forEach((t) => { if (tb.has(t)) shared++; });
      if (shared >= 2) { weight += shared; rel = "related"; }

      if (a.pillar && a.pillar === b.pillar) {
        weight += 0.6;
        if (a.type === b.type) { weight += 0.4; rel = "belongs_to"; }
      }
      if (weight >= 1) candidates.push({ from: a.id, to: b.id, w: weight, rel });
    }
  }
  candidates.sort((x, y) => y.w - x.w);

  const out: SoftEdge[] = [];
  for (const c of candidates) {
    if ((degree.get(c.from) ?? 0) >= MAX_DEG) continue;
    if ((degree.get(c.to) ?? 0) >= MAX_DEG) continue;
    out.push({ from: c.from, to: c.to, relation: c.rel, weight: c.w, inferred: true });
    inc(c.from); inc(c.to);
    if (out.length > nodes.length * 2) break;
  }
  return out;
}
