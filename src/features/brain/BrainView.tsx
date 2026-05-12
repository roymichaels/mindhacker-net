import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrainGraphCanvas from "./BrainGraphCanvas";
import BrainNodeSheet from "./BrainNodeSheet";
import BrainSections from "./BrainSections";
import { useBackfillBrain } from "./useBackfill";
import { useBrainOverview, useCurrentUserId } from "./useBrainOverview";
import type { BrainLayer, BrainNode } from "./types";

const LAYER_LABEL: Record<BrainLayer | "all", string> = {
  all: "All",
  surface: "Surface",
  pattern: "Pattern",
  deep: "Deep",
};

interface Props {
  /** Called instead of router push when integrating inside a modal. */
  onTalkToAion?: (node: BrainNode) => void;
}

export default function BrainView({ onTalkToAion }: Props) {
  const navigate = useNavigate();
  const userId = useCurrentUserId();
  const { data, isLoading } = useBrainOverview(userId);
  const backfill = useBackfillBrain();
  const [layer, setLayer] = useState<"all" | BrainLayer>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWeak, setShowWeak] = useState(false);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter((n) => {
      if (layer !== "all" && n.layer !== layer) return false;
      if (!showWeak && n.confidence < 30 && !n.user_confirmed) return false;
      return true;
    });
  }, [data, layer, showWeak]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(
    () => (data?.edges ?? []).filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [data, visibleIds],
  );

  const understanding = useMemo(() => {
    if (!data) return 0;
    const vals = Object.values(data.pillars);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((s, p) => s + (p.confidence ?? 0), 0) / vals.length);
  }, [data]);

  const selected = filteredNodes.find((n) => n.id === selectedId) ?? null;

  const handleTalkToAion = (node: BrainNode) => {
    if (onTalkToAion) {
      onTalkToAion(node);
      return;
    }
    try {
      sessionStorage.setItem(
        "aion.brain_focus",
        JSON.stringify({ node_id: node.id, type: node.type, content: node.content }),
      );
    } catch {}
    navigate("/aurora");
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Brain View</h3>
          <p className="text-[11px] text-muted-foreground">
            Understanding {understanding}% · {data?.nodes.length ?? 0} nodes
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => backfill.mutate()}
            disabled={backfill.isPending}
            className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50"
          >
            {backfill.isPending ? "Building…" : "Build my brain"}
          </button>
          <button
            onClick={() => setShowWeak((v) => !v)}
            className="text-[11px] px-2 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground transition"
          >
            {showWeak ? "Hide weak" : "Show weak"}
          </button>
        </div>
      </div>

      <BrainSections overview={data} onSelect={setSelectedId} />

      <div className="flex items-center gap-1 mb-2 px-1">
        {(["all", "surface", "pattern", "deep"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className={`text-[11px] px-3 py-1 rounded-full transition ${
              layer === l
                ? "bg-primary/20 text-primary border border-primary/40"
                : "border border-border/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {LAYER_LABEL[l]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-[460px] rounded-2xl bg-muted/30 animate-pulse" />
      ) : filteredNodes.length === 0 ? (
        <div className="h-[460px] rounded-2xl bg-background/40 backdrop-blur-md border border-border/40 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p className="text-sm text-muted-foreground max-w-xs">
            Your brain is empty. Pull your identity, goals, habits and history into the graph.
          </p>
          <button
            onClick={() => backfill.mutate()}
            disabled={backfill.isPending}
            className="text-xs px-4 py-2 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition disabled:opacity-50"
          >
            {backfill.isPending ? "Building…" : "Build my brain"}
          </button>
        </div>
      ) : (
        <BrainGraphCanvas
          nodes={filteredNodes}
          edges={filteredEdges}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}

      {data && data.unknown_areas.length > 0 && (
        <div className="mt-3 px-1">
          <p className="text-[11px] text-muted-foreground">
            Unknown areas: {data.unknown_areas.slice(0, 5).join(" · ")}
          </p>
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