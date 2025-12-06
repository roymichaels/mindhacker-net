import { Clock, Flame } from "lucide-react";

interface UrgencyBadgeProps {
  spotsLeft?: number;
  variant?: "inline" | "floating";
}

const UrgencyBadge = ({ spotsLeft = 3, variant = "inline" }: UrgencyBadgeProps) => {
  if (variant === "floating") {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/40 text-destructive text-sm animate-pulse">
        <Flame className="w-4 h-4" />
        <span className="font-semibold">{spotsLeft} מקומות פנויים השבוע</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-accent text-sm mt-4">
      <Clock className="w-4 h-4" />
      <span className="font-medium">🔥 {spotsLeft} מקומות פנויים השבוע בלבד</span>
    </div>
  );
};

export default UrgencyBadge;
