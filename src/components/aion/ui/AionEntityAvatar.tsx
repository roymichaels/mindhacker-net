import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AionOrb } from "./AionOrb";

interface AionEntityAvatarProps {
  /** Optional name override; defaults to "AION". */
  name?: ReactNode;
  /** Short status line (e.g. "thinking", "ready"). */
  status?: ReactNode;
  className?: string;
}

/** AionEntityAvatar — compact AION presence chip. */
export function AionEntityAvatar({ name = "AION", status, className }: AionEntityAvatarProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <AionOrb size="xs" />
      <span className="flex flex-col leading-tight">
        <span className="text-[12px] font-semibold tracking-[0.18em] text-foreground">{name}</span>
        {status && <span className="text-[10px] aion-text-mute">{status}</span>}
      </span>
    </span>
  );
}

export default AionEntityAvatar;