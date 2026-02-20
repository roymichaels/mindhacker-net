import { cn } from "@/lib/utils";

const COMPONENT_INFO: Record<string, { label: string; description: string; improvedBy: string }> = {
  structural_integrity: {
    label: "Structural Integrity",
    description: "Jaw, mandible, zygomatic structure, and shoulder framework.",
    improvedBy: "Neck/traps training, body fat reduction, mewing protocol.",
  },
  aesthetic_symmetry: {
    label: "Aesthetic Symmetry",
    description: "Facial symmetry, thirds balance, and upper/lower development.",
    improvedBy: "Balanced training, sleep quality, facial exercises.",
  },
  composition: {
    label: "Composition",
    description: "Body fat distribution, abdominal definition, chest projection.",
    improvedBy: "Recomposition protocol, nutrition optimization, progressive overload.",
  },
  posture_alignment: {
    label: "Posture Alignment",
    description: "Forward head, rounded shoulders, pelvic tilt, thoracic curvature.",
    improvedBy: "Cervical protocol, upper back strengthening, hip flexor release.",
  },
  projection_potential: {
    label: "Projection Potential",
    description: "How structural elements project presence in space.",
    improvedBy: "Posture correction, neck development, chest/shoulder work.",
  },
};

interface ComponentCardProps {
  componentKey: string;
  score: number;
  directModeNote?: string;
  directMode: boolean;
}

export default function ComponentCard({ componentKey, score, directModeNote, directMode }: ComponentCardProps) {
  const info = COMPONENT_INFO[componentKey];
  if (!info) return null;

  const getBarColor = (s: number) => {
    if (s >= 75) return "bg-emerald-500";
    if (s >= 55) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground text-sm">{info.label}</h4>
        <span className={cn("text-lg font-bold", score >= 75 ? "text-emerald-500" : score >= 55 ? "text-amber-500" : "text-red-500")}>
          {score}
        </span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", getBarColor(score))} style={{ width: `${score}%` }} />
      </div>

      <p className="text-xs text-muted-foreground">{info.description}</p>

      {directMode && directModeNote ? (
        <p className="text-xs text-red-400 font-medium border-t border-border pt-2">{directModeNote}</p>
      ) : (
        <p className="text-xs text-primary/80 border-t border-border pt-2">
          <span className="font-medium">Improvement lever:</span> {info.improvedBy}
        </p>
      )}
    </div>
  );
}
