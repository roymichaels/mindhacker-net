import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Check, MessageCircle, X as XIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { confirmBrainNode, rejectBrainNode, useBrainNodeEvidence } from "./useBrainOverview";
import type { BrainNode } from "./types";

interface Props {
  node: BrainNode | null;
  onClose: () => void;
  onTalkToAion: (node: BrainNode) => void;
}

export default function BrainNodeSheet({ node, onClose, onTalkToAion }: Props) {
  const qc = useQueryClient();
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

  return (
    <Sheet open={!!node} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
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

            <p className="mt-3 text-sm text-foreground leading-relaxed">{node.content}</p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Bar label="Confidence" value={node.confidence} />
              <Bar label="Strength" value={node.strength * 10} />
            </div>

            <div className="mt-5">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2">Evidence</h4>
              {evidence.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">No recorded evidence yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {evidence.map((ev) => (
                    <li
                      key={ev.id}
                      className="text-xs text-muted-foreground bg-muted/30 rounded-xl px-3 py-2"
                    >
                      <span className="font-medium text-foreground/80 me-2">{ev.source_kind}</span>
                      {ev.summary}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button variant="secondary" size="sm" onClick={() => onTalkToAion(node)}>
                <MessageCircle className="w-4 h-4 me-1" /> AION
              </Button>
              <Button variant="secondary" size="sm" onClick={handleConfirm}>
                <Check className="w-4 h-4 me-1" /> Confirm
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReject}>
                <XIcon className="w-4 h-4 me-1" /> Not me
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
      <div className="h-1 mt-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}