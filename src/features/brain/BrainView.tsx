import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, RefreshCw } from "lucide-react";
import ShellHeader from "@/shellv2/ShellHeader";
import BrainGraphCanvas from "./BrainGraphCanvas";
import BrainNodeSheet from "./BrainNodeSheet";
import BrainSections from "./BrainSections";
import { useBackfillBrain } from "./useBackfill";
import BrainBackfillDebug from "./BrainBackfillDebug";
import { useBrainOverview, useCurrentUserId } from "./useBrainOverview";
import { useBrainFallback } from "./useBrainFallback";
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
  const { data: primary, isLoading, error } = useBrainOverview(userId);
  const backfill = useBackfillBrain();
  const primaryEmpty = !primary || primary.nodes.length === 0;
  const { data: fallback } = useBrainFallback(userId, primaryEmpty || !!error);
  const data = !primary || primary.nodes.length === 0 ? fallback ?? primary : primary;
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
  const hasNodes = (data?.nodes.length ?? 0) > 0;
  const usingFallback = !!fallback && (!primary || primary.nodes.length === 0);
  const ctaLabel = backfill.isPending
    ? "Building…"
    : hasNodes
    ? "Refresh brain"
    : "Build my brain";

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

  // Premium empty state — no data at all yet
  if (!isLoading && !hasNodes) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-6 gap-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <div className="relative h-24 w-24 rounded-full bg-primary/10 ring-1 ring-primary/30 backdrop-blur-md flex items-center justify-center">
            <Brain className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h2 className="text-xl font-semibold text-foreground">
            Your brain is still forming
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AION will build it from your conversations, journals, goals and history.
          </p>
        </div>
        {error && (
          <p className="text-[11px] text-destructive max-w-xs">
            Backend error: {error.message}
          </p>
        )}
        <button
          onClick={() => backfill.mutate()}
          disabled={backfill.isPending}
          className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${backfill.isPending ? "animate-spin" : ""}`} />
          {backfill.isPending ? "Building…" : "Build my brain"}
        </button>
        <div className="w-full max-w-md">
          <BrainBackfillDebug result={backfill.data} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ShellHeader title="Brain" subtitle="AION is building your map">
        {hasNodes && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            Understanding {understanding}% · {data?.nodes.length ?? 0} nodes
            {usingFallback && " · fallback view"}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-destructive mt-1">
            Live graph error: {error.message}
          </p>
        )}
        <button
          onClick={() => backfill.mutate()}
          disabled={backfill.isPending}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${backfill.isPending ? "animate-spin" : ""}`} />
          {ctaLabel}
        </button>
      </ShellHeader>

      <BrainBackfillDebug result={backfill.data} />

      <BrainSections overview={data} onSelect={setSelectedId} />

      {/* Graph — full-bleed, no card chrome */}
      {isLoading ? (
        <div className="h-[460px] rounded-2xl bg-muted/20 animate-pulse" />
      ) : (
        <div className="-mx-4">
          <BrainGraphCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      )}

      {/* Filters — below graph, horizontal scroll */}
      <div className="mt-3 -mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 w-max">
          {(["all", "surface", "pattern", "deep"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`text-[11px] px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                layer === l
                  ? "bg-primary/20 text-primary"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
            >
              {LAYER_LABEL[l]}
            </button>
          ))}
          <button
            onClick={() => setShowWeak((v) => !v)}
            className={`text-[11px] px-3 py-1.5 rounded-full transition whitespace-nowrap ${
              showWeak
                ? "bg-primary/20 text-primary"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            Weak signals
          </button>
        </div>
      </div>

      {data && data.unknown_areas.length > 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Unknown areas: {data.unknown_areas.slice(0, 5).join(" · ")}
        </p>
      )}

      <BrainNodeSheet
        node={selected}
        onClose={() => setSelectedId(null)}
        onTalkToAion={handleTalkToAion}
      />
    </div>
  );
}