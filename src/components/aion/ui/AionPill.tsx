import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AionPillProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

/** AionPill — small status / filter chip on the pill surface token. */
export function AionPill({ children, active, onClick, className }: AionPillProps) {
  const Comp: any = onClick ? "button" : "span";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "aion-pill-surface inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium tracking-wide",
        active ? "text-foreground aion-glow-cyan" : "aion-text-soft",
        onClick && "transition active:scale-[0.96] hover:text-foreground",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export default AionPill;