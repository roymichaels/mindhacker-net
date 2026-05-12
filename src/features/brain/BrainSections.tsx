import { useMemo } from "react";
import type { BrainNode, BrainOverview } from "./types";

interface Props {
  overview: BrainOverview | undefined;
  onSelect: (id: string) => void;
}

const GROUPS: Array<{ key: string; label: string; types: string[] }> = [
  { key: "identity", label: "Identity", types: ["identity"] },
  { key: "values", label: "Values", types: ["value"] },
  { key: "beliefs", label: "Beliefs", types: ["belief"] },
  { key: "goals", label: "Goals", types: ["goal"] },
  { key: "habits", label: "Habits", types: ["habit"] },
  { key: "patterns", label: "Patterns", types: ["pattern"] },
  { key: "memories", label: "Memories", types: ["memory"] },
];

export default function BrainSections({ overview, onSelect }: Props) {
  const grouped = useMemo(() => {
    const map: Record<string, BrainNode[]> = {};
    for (const n of overview?.nodes ?? []) {
      const g = GROUPS.find((g) => g.types.includes(n.type));
      const k = g?.key ?? "other";
      (map[k] ??= []).push(n);
    }
    Object.values(map).forEach((arr) => arr.sort((a, b) => b.score - a.score));
    return map;
  }, [overview]);

  const pillars = overview?.pillars ?? {};
  const pillarRows = Object.entries(pillars).sort(
    (a, b) => (b[1].confidence ?? 0) - (a[1].confidence ?? 0),
  );
  const contradictions = overview?.contradictions ?? [];
  const recent = overview?.recent ?? [];

  if (!overview || overview.nodes.length === 0) return null;

  return (
    <div className="space-y-4 mb-4">
      <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-4">
        <h4 className="text-xs font-semibold text-foreground mb-2">
          What AION knows about you
        </h4>
        <div className="space-y-3">
          {GROUPS.map((g) => {
            const items = grouped[g.key] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={g.key}>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                  {g.label} · {items.length}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onSelect(n.id)}
                      className="text-[11px] px-2 py-1 rounded-full border border-border/40 bg-muted/30 text-foreground hover:bg-primary/10 hover:border-primary/40 transition truncate max-w-[200px]"
                      title={n.content}
                    >
                      {truncate(n.content, 40)}
                    </button>
                  ))}
                  {items.length > 12 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{items.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pillarRows.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-4">
          <h4 className="text-xs font-semibold text-foreground mb-2">Pillar understanding</h4>
          <div className="space-y-1.5">
            {pillarRows.slice(0, 10).map(([id, p]) => (
              <div key={id} className="flex items-center gap-2">
                <div className="text-[11px] text-muted-foreground w-24 truncate">{id}</div>
                <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div
                    className="h-full bg-primary/70"
                    style={{ width: `${Math.max(2, Math.min(100, p.confidence ?? 0))}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground w-8 text-end">
                  {Math.round(p.confidence ?? 0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contradictions.length > 0 && (
        <div className="rounded-2xl bg-destructive/5 p-4">
          <h4 className="text-xs font-semibold text-foreground mb-2">Contradictions</h4>
          <ul className="space-y-1">
            {contradictions.slice(0, 5).map((c) => (
              <li key={c.id} className="text-[11px] text-muted-foreground">
                <span className="text-foreground">{truncate(c.a, 40)}</span> ↔{" "}
                <span className="text-foreground">{truncate(c.b, 40)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] backdrop-blur-md p-4">
          <h4 className="text-xs font-semibold text-foreground mb-2">Recent memories</h4>
          <ul className="space-y-1">
            {recent.slice(0, 6).map((r) => (
              <li key={r.id} className="text-[11px] text-muted-foreground truncate">
                · {truncate(r.content, 80)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function truncate(s: string, n: number) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}