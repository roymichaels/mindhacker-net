import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AionNavTab {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface AionNavDockProps {
  tabs: AionNavTab[];
  className?: string;
}

/**
 * AionNavDock — minimal 5-tab bottom dock.
 * Transparent over atmosphere, hairline divider top, under-glow dot for active.
 * Composer floats above this when both are mounted.
 */
export function AionNavDock({ tabs, className }: AionNavDockProps) {
  return (
    <nav
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0",
        "pb-[max(env(safe-area-inset-bottom),0.5rem)]",
        className,
      )}
    >
      <div className="atmo-divider mx-auto max-w-screen-md" />
      <div className="pointer-events-auto mx-auto flex max-w-screen-md items-center justify-around px-4 pt-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={t.onClick}
            aria-label={t.label}
            aria-current={t.active ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-1 px-3 py-2 transition active:scale-[0.95]",
              t.active ? "text-foreground" : "aion-text-mute hover:text-foreground/80",
            )}
          >
            <span className="block h-5 w-5">{t.icon}</span>
            <span className="text-[10px] tracking-wide">{t.label}</span>
            {t.active && (
              <span
                aria-hidden
                className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-current aion-glow-cyan"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default AionNavDock;