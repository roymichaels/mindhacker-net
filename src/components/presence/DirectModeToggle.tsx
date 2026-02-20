import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";

interface DirectModeToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}

export default function DirectModeToggle({ enabled, onToggle }: DirectModeToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2">
        <Zap className={`w-4 h-4 ${enabled ? "text-red-500" : "text-muted-foreground"}`} />
        <div>
          <p className="text-sm font-medium text-foreground">Direct Mode</p>
          <p className="text-xs text-muted-foreground">Clinical blunt-language assessment</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}
