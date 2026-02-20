interface PresenceIndexProps {
  score: number;
  confidence: string;
}

export default function PresenceIndex({ score, confidence }: PresenceIndexProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return "text-emerald-500";
    if (s >= 55) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${getColor(score)} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${getColor(score)}`}>{score}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Presence Index</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Confidence: <span className="capitalize font-medium text-foreground">{confidence}</span>
      </p>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Private Structural Assessment — reflects internal structural coherence only.
      </p>
    </div>
  );
}
