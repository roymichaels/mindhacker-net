import { Target } from "lucide-react";

const LABELS: Record<string, string> = {
  structural_integrity: "Structural Integrity",
  aesthetic_symmetry: "Aesthetic Symmetry",
  composition: "Composition",
  posture_alignment: "Posture Alignment",
  projection_potential: "Projection Potential",
};

interface LeveragePointsProps {
  scores: Record<string, number | string>;
}

export default function LeveragePoints({ scores }: LeveragePointsProps) {
  const sorted = Object.entries(scores)
    .filter(([k, v]) => k !== "presence_index" && k !== "confidence_band" && typeof v === "number")
    .sort((a, b) => (a[1] as number) - (b[1] as number))
    .slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Top 3 Leverage Points</h3>
      </div>
      <p className="text-xs text-muted-foreground">Highest-impact areas for protocol focus.</p>

      <div className="space-y-2">
        {sorted.map(([key, val], i) => (
          <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{LABELS[key] ?? key}</p>
            </div>
            <span className="text-sm font-bold text-red-500">{val as number}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
