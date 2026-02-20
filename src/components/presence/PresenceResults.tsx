import { useState, useEffect } from "react";
import type { PresenceScan } from "@/hooks/usePresenceScans";
import PresenceIndex from "./PresenceIndex";
import ComponentCard from "./ComponentCard";
import LeveragePoints from "./LeveragePoints";
import DeltaView from "./DeltaView";
import DirectModeToggle from "./DirectModeToggle";
import { TrendingUp } from "lucide-react";

interface PresenceResultsProps {
  scan: PresenceScan;
  previousScan: PresenceScan | null;
}

const COMPONENT_KEYS = [
  "structural_integrity",
  "aesthetic_symmetry",
  "composition",
  "posture_alignment",
  "projection_potential",
];

export default function PresenceResults({ scan, previousScan }: PresenceResultsProps) {
  const [directMode, setDirectMode] = useState(() => {
    try { return localStorage.getItem("presence_direct_mode") === "true"; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem("presence_direct_mode", String(directMode));
  }, [directMode]);

  const scores = scan.scores;

  // 90-day projection: addressable components
  const addressable = COMPONENT_KEYS.filter((k) => (scores[k as keyof typeof scores] as number) < 70);
  const projectedGain = addressable.length * 8; // conservative estimate

  return (
    <div className="space-y-8">
      {/* Direct mode toggle */}
      <DirectModeToggle enabled={directMode} onToggle={setDirectMode} />

      {/* Section 1: Presence Index */}
      <PresenceIndex score={scores.presence_index} confidence={scores.confidence_band} />

      {/* Section 2: Component Breakdown */}
      <div className="space-y-3">
        <h3 className="font-bold text-foreground">Component Breakdown</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {COMPONENT_KEYS.map((key) => (
            <ComponentCard
              key={key}
              componentKey={key}
              score={scores[key as keyof typeof scores] as number}
              directModeNote={scan.direct_mode_notes?.[key]}
              directMode={directMode}
            />
          ))}
        </div>
      </div>

      {/* Section 3: Leverage Points */}
      <LeveragePoints scores={scores} />

      {/* Section 4: 90-Day Projection */}
      <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">90-Day Projection</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          With consistent protocol adherence across {addressable.length} addressable component{addressable.length !== 1 ? "s" : ""},
          estimated Presence Index improvement: <span className="text-primary font-bold">+{projectedGain} points</span>.
        </p>
        <p className="text-xs text-muted-foreground">Not a guarantee. Projection based on addressable structural factors only.</p>
      </div>

      {/* Section 5: Delta */}
      {previousScan && <DeltaView currentScan={scan} previousScan={previousScan} />}
    </div>
  );
}
