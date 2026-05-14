import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import OrbView from "@/components/orb/v2/OrbView";
import { useTranslation } from "@/hooks/useTranslation";
import BrainGraphForce from "./BrainGraphForce";
import { inferSoftEdges } from "./inferSoftEdges";
import BrainNodeSheet from "./BrainNodeSheet";
import { useBackfillBrain } from "./useBackfill";
import { useBrainOverview, useCurrentUserId } from "./useBrainOverview";
import { useBrainFallback } from "./useBrainFallback";
import type { BrainLayer, BrainNode } from "./types";

const LAYER_LABEL_EN: Record<BrainLayer | "all", string> = {
  all: "All",
  surface: "Surface",
  pattern: "Pattern",
  deep: "Deep",
};
const LAYER_LABEL_HE: Record<BrainLayer | "all", string> = {
  all: "הכול",
  surface: "פני שטח",
  pattern: "דפוס",
  deep: "עומק",
};

interface Props {
  /** Called instead of router push when integrating inside a modal. */
  onTalkToAion?: (node: BrainNode) => void;
}

export default function BrainView({ onTalkToAion }: Props) {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const LAYER_LABEL = isRTL ? LAYER_LABEL_HE : LAYER_LABEL_EN;
  const userId = useCurrentUserId();
  const { data: primary, isLoading, error } = useBrainOverview(userId);
  const backfill = useBackfillBrain();
  const primaryEmpty = !primary || primary.nodes.length === 0;
  const { data: fallback } = useBrainFallback(userId, primaryEmpty || !!error);
  const data = !primary || primary.nodes.length === 0 ? fallback ?? primary : primary;
  const [layer, setLayer] = useState<"all" | BrainLayer>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWeak] = useState(true);
  const [typeFilter] = useState<string>("all");

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    return data.nodes.filter((n) => {
      if (layer !== "all" && n.layer !== layer) return false;
      if (typeFilter !== "all" && n.type?.toLowerCase() !== typeFilter) return false;
      if (!showWeak && (Number(n.confidence) || 0) < 30 && !n.user_confirmed) return false;
      return true;
    });
  }, [data, layer, showWeak, typeFilter]);

  const visibleIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);
  const filteredEdges = useMemo(
    () => (data?.edges ?? []).filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [data, visibleIds],
  );

  const softEdges = useMemo(() => {
    if (!filteredNodes.length) return [];
    if (filteredEdges.length >= filteredNodes.length / 4) return [];
    return inferSoftEdges(filteredNodes, filteredEdges);
  }, [filteredNodes, filteredEdges]);

  const understanding = useMemo(() => {
    if (!data) return 0;
    const pillars = data.pillars;
    const vals =
      pillars && typeof pillars === "object" && !Array.isArray(pillars)
        ? Object.values(pillars)
        : [];
    if (!vals.length) return 0;
    return Math.round(
      vals.reduce((s, p: any) => s + (Number(p?.confidence) || 0), 0) / vals.length,
    );
  }, [data]);

  const selected = filteredNodes.find((n) => n.id === selectedId) ?? null;
  const hasNodes = (data?.nodes.length ?? 0) > 0;

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
      <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-6 gap-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
          <OrbView
            size={120}
            state="thinking"
            tier="standard"
            tintHue="hsl(265 85% 65%)"
            className="relative"
          />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h2 className="text-xl font-semibold text-foreground">
            {isRTL ? "המוח שלך עדיין מתגבש" : "Your brain is still forming"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isRTL
              ? "AION תבנה אותו מהשיחות, היומנים, היעדים וההיסטוריה שלך."
              : "AION will build it from your conversations, journals, goals and history."}
          </p>
        </div>
        {error && (
          <p className="text-[11px] text-destructive max-w-xs">
            {isRTL ? "שגיאת שרת: " : "Backend error: "}{error.message}
          </p>
        )}
        <button
          onClick={() => backfill.mutate()}
          disabled={backfill.isPending}
          className="mt-2 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${backfill.isPending ? "animate-spin" : ""}`} />
          {backfill.isPending ? (isRTL ? "בונה…" : "Building…") : (isRTL ? "בנה את המוח שלי" : "Build my brain")}
        </button>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
      {/* Ambient header — single hero word, no card */}
      <div className="relative px-6 pt-6 pb-3 text-center">
        <h1 className="aion-text-hero text-[22px] font-light tracking-[0.32em] uppercase">
          {isRTL ? "מוח" : "Brain"}
        </h1>
        <p className="mt-1 text-[11px] text-foreground/45 tracking-wide">
          {isRTL
            ? <>{understanding}% · <span dir="ltr">{data?.nodes.length ?? 0}</span> {isRTL ? "צמתים חיים" : "living signals"}</>
            : <>{understanding}% understanding · {data?.nodes.length ?? 0} living signals</>}
        </p>
      </div>

      {/* Cinematic full-bleed graph */}
      {isLoading ? (
        <div className="h-[520px] mx-4 rounded-3xl atmo-surface-soft animate-aion-breath" />
      ) : (
        <div className="-mx-4 relative">
          <BrainGraphForce
            nodes={filteredNodes}
            edges={filteredEdges}
            softEdges={softEdges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      )}

      {/* Layer drift selector — minimal ghost row, single line */}
      <div className="mt-2 px-6 flex items-center justify-center gap-5 text-[10px] uppercase tracking-[0.22em]">
        {(["all", "surface", "pattern", "deep"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLayer(l)}
            className={`transition ${
              layer === l
                ? "text-foreground/90"
                : "text-foreground/30 hover:text-foreground/60"
            }`}
          >
            {LAYER_LABEL[l]}
          </button>
        ))}
      </div>

      {/* Floating refresh — bottom-right, ghost */}
      <button
        onClick={() => backfill.mutate()}
        disabled={backfill.isPending}
        aria-label={isRTL ? "רענן" : "Refresh"}
        className="fixed bottom-24 right-4 z-30 h-10 w-10 inline-flex items-center justify-center rounded-full atmo-surface-soft text-foreground/70 hover:text-foreground transition disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${backfill.isPending ? "animate-spin" : ""}`} />
      </button>

      <BrainNodeSheet
        node={selected}
        onClose={() => setSelectedId(null)}
        onTalkToAion={handleTalkToAion}
      />
    </div>
  );
}