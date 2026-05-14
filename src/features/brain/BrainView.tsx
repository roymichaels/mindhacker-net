import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, RefreshCw } from "lucide-react";
import ShellHeader from "@/shellv2/ShellHeader";
import { useTranslation } from "@/hooks/useTranslation";
import BrainGraphForce from "./BrainGraphForce";
import { inferSoftEdges } from "./inferSoftEdges";
import { ALL_TYPES, styleForType } from "./brainNodeStyle";
import BrainNodeSheet from "./BrainNodeSheet";
import BrainSections from "./BrainSections";
import { useBackfillBrain } from "./useBackfill";
import BrainBackfillDebug from "./BrainBackfillDebug";
import { useBrainOverview, useCurrentUserId } from "./useBrainOverview";
import { useBrainFallback } from "./useBrainFallback";
import { CORE_DOMAINS } from "@/navigation/lifeDomains";
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
  const [showWeak, setShowWeak] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");

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
  const usingFallback = !!fallback && (!primary || primary.nodes.length === 0);
  const ctaLabel = backfill.isPending
    ? (isRTL ? "בונה…" : "Building…")
    : hasNodes
    ? (isRTL ? "רענון המוח" : "Refresh brain")
    : (isRTL ? "בנה את המוח שלי" : "Build my brain");

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
          <div className="relative h-24 w-24 rounded-full bg-primary/10 ring-1 ring-primary/30 backdrop-blur-md flex items-center justify-center">
            <Brain className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
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
        <div className="w-full max-w-md">
          <BrainBackfillDebug result={backfill.data} />
        </div>
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="w-full">
      <ShellHeader
        title={isRTL ? "מוח" : "Brain"}
        subtitle={isRTL ? "AION בונה את המפה שלך" : "AION is building your map"}
      >
        {hasNodes && (
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            {isRTL
              ? <>הבנה <span dir="ltr">{understanding}%</span> · <span dir="ltr">{data?.nodes.length ?? 0}</span> צמתים{usingFallback && " · תצוגת גיבוי"}</>
              : <>Understanding {understanding}% · {data?.nodes.length ?? 0} nodes{usingFallback && " · fallback view"}</>}
          </p>
        )}
        {error && (
          <p className="text-[11px] text-destructive mt-1">
            {isRTL ? "שגיאת גרף: " : "Live graph error: "}{error.message}
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
          <BrainGraphForce
            nodes={filteredNodes}
            edges={filteredEdges}
            softEdges={softEdges}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {softEdges.length > 0 && (
            <p className="px-4 mt-1 text-[10px] text-muted-foreground/70 text-center">
              {isRTL
                ? "מוצגים קשרים משוערים — AION תחזק אותם בהמשך הלמידה."
                : "Showing inferred connections — AION will firm them up as it learns."}
            </p>
          )}
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
            {isRTL ? "אותות חלשים" : "Weak signals"}
          </button>
        </div>
      </div>

      {/* Type chips */}
      <div className="mt-2 -mx-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 w-max">
          <button
            onClick={() => setTypeFilter("all")}
            className={`text-[11px] px-3 py-1.5 rounded-full transition whitespace-nowrap ${
              typeFilter === "all"
                ? "bg-primary/20 text-primary"
                : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
            }`}
          >
            {isRTL ? "כל הסוגים" : "All types"}
          </button>
          {ALL_TYPES.map((t) => {
            const st = styleForType(t);
            const active = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(active ? "all" : t)}
                className={`text-[11px] px-3 py-1.5 rounded-full transition whitespace-nowrap inline-flex items-center gap-1.5 ${
                  active
                    ? "bg-white/[0.08] text-foreground ring-1 ring-white/10"
                    : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: st.color }} />
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {data && data.unknown_areas.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">
            {isRTL ? "אזורים לא ידועים:" : "Unknown areas:"}
          </span>
          {data.unknown_areas.slice(0, 6).map((area) => {
            const d = CORE_DOMAINS.find((x) => x.id === area.toLowerCase());
            const label = d ? (isRTL ? d.labelHe : d.labelEn) : area;
            const route = d ? `/strategy/${d.id}/assess` : null;
            return route ? (
              <button
                key={area}
                onClick={() => navigate(route)}
                className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition"
                title={isRTL ? "התחל אבחון בצ'אט עם AION" : "Start AION chat assessment"}
              >
                {label}
              </button>
            ) : (
              <span key={area} className="text-[11px] text-muted-foreground">{label}</span>
            );
          })}
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