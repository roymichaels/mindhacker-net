import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PresenceScan } from "@/hooks/usePresenceScans";

const METRIC_LABELS: Record<string, string> = {
  facial_symmetry_band: "Facial Symmetry",
  jaw_definition_index: "Jaw Definition",
  body_fat_band: "Body Composition",
  shoulder_to_waist_ratio: "Shoulder-Waist Ratio",
  forward_head_severity: "Forward Head",
  rounded_shoulders_severity: "Rounded Shoulders",
  chest_projection: "Chest Projection",
  mandible_prominence: "Mandible Prominence",
  skin_clarity_band: "Skin Clarity",
  abdominal_definition_likelihood: "Abdominal Definition",
};

interface DeltaViewProps {
  currentScan: PresenceScan;
  previousScan: PresenceScan | null;
}

export default function DeltaView({ currentScan, previousScan }: DeltaViewProps) {
  const deltas = currentScan.delta_metrics;
  if (!deltas || !previousScan) return null;

  const entries = Object.entries(deltas).filter(([k]) => METRIC_LABELS[k]);

  // Overall score delta
  const currentIndex = currentScan.scores.presence_index;
  const previousIndex = previousScan.scores.presence_index;
  const indexDelta = currentIndex - previousIndex;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">Improvement Delta</h3>
      <p className="text-xs text-muted-foreground">Scan #{currentScan.scan_number} vs Scan #{previousScan.scan_number}</p>

      {/* Overall */}
      <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Presence Index</p>
          <p className="text-xs text-muted-foreground">
            {previousIndex} → {currentIndex}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {indexDelta > 0 ? (
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          ) : indexDelta < 0 ? (
            <TrendingDown className="w-5 h-5 text-red-500" />
          ) : (
            <Minus className="w-5 h-5 text-muted-foreground" />
          )}
          <span className={`font-bold ${indexDelta > 0 ? "text-emerald-500" : indexDelta < 0 ? "text-red-500" : "text-muted-foreground"}`}>
            {indexDelta > 0 ? "+" : ""}{indexDelta}
          </span>
        </div>
      </div>

      {indexDelta < 0 && (
        <p className="text-xs text-amber-500 font-medium px-1">
          Regression detected — protocol adherence adjustment needed.
        </p>
      )}

      {/* Per-metric */}
      <div className="space-y-2">
        {entries.map(([key, delta]: [string, any]) => (
          <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-foreground">{METRIC_LABELS[key]}</span>
            <span className="text-xs text-muted-foreground">
              {delta.previous} → {delta.current}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
