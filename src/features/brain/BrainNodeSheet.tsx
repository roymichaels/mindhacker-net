import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, X as XIcon, DoorOpen, Pencil, Compass, Sparkles } from "lucide-react";
import { aionPresence } from "@/copy/aionPresence";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { confirmBrainNode, rejectBrainNode, useBrainNodeEvidence } from "./useBrainOverview";
import { getRoomById } from "@/hallway/rooms";
import { useTranslation } from "@/hooks/useTranslation";
import type { BrainNode } from "./types";

interface Props {
  node: BrainNode | null;
  onClose: () => void;
  onTalkToAion: (node: BrainNode) => void;
}

export default function BrainNodeSheet({ node, onClose, onTalkToAion }: Props) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const { data: evidence = [] } = useBrainNodeEvidence(node?.id ?? null);

  const handleConfirm = async () => {
    if (!node) return;
    await confirmBrainNode(node.id);
    qc.invalidateQueries({ queryKey: ["brain-overview"] });
    onClose();
  };
  const handleReject = async () => {
    if (!node) return;
    await rejectBrainNode(node.id);
    qc.invalidateQueries({ queryKey: ["brain-overview"] });
    onClose();
  };

  // Read-only handoffs to AION — no DB writes; the chat composer picks up the
  // focus from sessionStorage (same pattern as `onTalkToAion`).
  const handoffToAion = (intent: "correct" | "explore") => {
    if (!node) return;
    try {
      const prompt = intent === "correct"
        ? (isRTL
            ? `תקן את ההבנה שלך לגבי: ${node.content}`
            : `Correct your understanding about: ${node.content}`)
        : (isRTL
            ? `קח אותי עמוק יותר לתוך: ${node.content}`
            : `Take me deeper into: ${node.content}`);
      sessionStorage.setItem(
        "aion.brain_focus",
        JSON.stringify({
          node_id: node.id,
          type: node.type,
          content: node.content,
          room: node.room ?? null,
          intent,
          prompt,
        }),
      );
    } catch {}
    navigate("/aurora");
    onClose();
  };

  return (
    <Sheet open={!!node} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto border-0 dark:atmo-surface dark:aion-glow-cyan">
        {node && (
          <>
            <SheetHeader>
              <SheetTitle className="text-start">
                <span className="text-xs uppercase tracking-wide text-muted-foreground me-2">
                  {node.type}
                </span>
                {node.pillar && (
                  <span className="text-xs text-muted-foreground">· {node.pillar}</span>
                )}
              </SheetTitle>
            </SheetHeader>

            {node.room && (() => {
              const r = getRoomById(node.room);
              if (!r) return null;
              return (
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/brain?view=room&room=${r.id}`);
                    onClose();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-white/[0.05] text-foreground hover:bg-white/[0.08] transition"
                  style={{ color: `hsl(${r.ambience.hue} 65% 70%)` }}
                >
                  <DoorOpen className="w-3 h-3" />
                  {isRTL ? r.copy.label.he : r.copy.label.en}
                </button>
              );
            })()}

            <p className="mt-3 text-sm text-foreground leading-relaxed">{node.content}</p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Bar label={isRTL ? aionPresence.feelsClear.he : aionPresence.feelsClear.en} value={node.confidence} />
              <Bar label={isRTL ? aionPresence.pattern.he : aionPresence.pattern.en} value={node.strength * 10} />
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                {isRTL ? aionPresence.whatShapedThis.he : aionPresence.whatShapedThis.en}
              </h4>
              {evidence.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">
                  {isRTL ? aionPresence.aionLearning.he : aionPresence.aionLearning.en}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {evidence.map((ev) => (
                    <li
                      key={ev.id}
                      className="text-xs text-muted-foreground atmo-surface-soft rounded-xl px-3 py-2"
                    >
                      <span className="font-medium text-foreground/80 me-2">{ev.source_kind}</span>
                      {ev.summary}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Phase 2 — primary affordance is conversation with AION.
                Confirm / Not me / Correct / Explore demote to secondary. */}
            <Button
              className="mt-5 w-full"
              size="lg"
              onClick={() => onTalkToAion(node)}
            >
              <Sparkles className="w-4 h-4 me-2" />
              {isRTL ? aionPresence.askAionAboutThis.he : aionPresence.askAionAboutThis.en}
            </Button>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={() => handoffToAion("correct")}>
                <Pencil className="w-4 h-4 me-1" />
                {isRTL ? "תקן את זה" : "Correct"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handoffToAion("explore")}>
                <Compass className="w-4 h-4 me-1" />
                {isRTL ? "חקור לעומק" : "Explore deeper"}
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" onClick={handleConfirm}>
                <Check className="w-4 h-4 me-1" /> {isRTL ? "כן, זה אני" : "Yes, that's me"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReject}>
                <XIcon className="w-4 h-4 me-1" /> {isRTL ? "לא אני" : "Not me"}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <span>{Math.round(v)}</span>
      </div>
      <div className="h-px mt-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full dark:bg-aion-cyan bg-primary"
          style={{ width: `${v}%`, boxShadow: '0 0 8px hsl(var(--aion-cyan) / 0.6)' }}
        />
      </div>
    </div>
  );
}