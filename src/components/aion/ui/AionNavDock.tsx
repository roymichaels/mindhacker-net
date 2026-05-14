import { CSSProperties, ReactNode } from "react";
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
  /** When false, fades out and disables pointer events. Defaults to true. */
  visible?: boolean;
  style?: CSSProperties;
}

/**
 * AionNavDock — minimal 5-tab bottom dock.
 * Transparent over atmosphere, hairline divider top, under-glow dot for active.
 * Composer floats above this when both are mounted.
 */
export function AionNavDock({ tabs, className, visible = true, style }: AionNavDockProps) {
  return (
    <nav
      style={style}
      className={cn(
        "fixed inset-x-0 bottom-0",
        "pb-[max(env(safe-area-inset-bottom),0.5rem)]",
        "transition-[opacity,transform] duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none",
        className,
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto flex max-w-screen-md items-center justify-around px-6 pt-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={t.onClick}
            aria-label={t.label}
            aria-current={t.active ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-0.5 px-2 py-1.5 transition active:scale-[0.95]",
              t.active ? "text-foreground" : "aion-text-mute hover:text-foreground/80",
            )}
          >
            <span className="block h-5 w-5">{t.icon}</span>
            <span className="text-[9px] tracking-[0.12em] uppercase opacity-80">{t.label}</span>
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