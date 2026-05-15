import { CSSProperties, ReactNode, useId } from "react";
import { cn } from "@/lib/utils";

export interface AionNavTab {
  key: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onHoverFocal?: (focal: { x: number; y: number }) => void;
  /**
   * Soft glyph energy for this anchor, 0..1. Higher = warmer presence,
   * lower = quieter (avoidance). Modulates opacity, glow, and a tiny
   * vertical drift — never layout.
   */
  energy?: number;
}

interface AionNavDockProps {
  tabs: AionNavTab[];
  className?: string;
  /** When false, fades out and disables pointer events. Defaults to true. */
  visible?: boolean;
  style?: CSSProperties;
}

/**
 * AionNavDock — constellation anchors (Phase 5M).
 *
 * Five realm anchors suspended above the composer. No bar background,
 * no permanent labels, no tab pills. Active realm glows like a star;
 * dim realms recede; warm realms breathe slightly. Labels appear only
 * on active / hover / focus.
 */
export function AionNavDock({ tabs, className, visible = true, style }: AionNavDockProps) {
  const seedBase = useId();
  return (
    <nav
      style={style}
      className={cn(
        "fixed inset-x-0",
        "transition-[opacity,transform] duration-500 ease-out",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none",
        className,
      )}
      aria-hidden={!visible}
      aria-label="Realm anchors"
    >
      {/* 5N.4 — when nav is closed, anchors do not exist in the layout, so
          they cannot ghost behind the composer underglow. */}
      {!visible ? null : (
      <div className="mx-auto flex max-w-screen-md items-center justify-around px-8 pt-3 pb-1">
        {tabs.map((t, i) => {
          const energy = typeof t.energy === 'number'
            ? Math.max(0, Math.min(1, t.energy))
            : 0.6;
          // 5N.4 — readable contrast floor when anchors are open.
          const baseOpacity = 0.7 + energy * 0.3;
          const glowAlpha = (energy - 0.55) * 0.6; // negative => no glow
          const driftSeed = (i * 1.37) % 1;
          const animDur = 7 + (1 - energy) * 5; // calmer realms drift slower
          return (
            <button
              key={t.key}
              type="button"
              onClick={t.onClick}
              onPointerEnter={(e) => {
                if (!t.onHoverFocal) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                t.onHoverFocal({
                  x: (rect.left + rect.width / 2) / window.innerWidth,
                  y: (rect.top + rect.height / 2) / window.innerHeight,
                });
              }}
              onFocus={(e) => {
                if (!t.onHoverFocal) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                t.onHoverFocal({
                  x: (rect.left + rect.width / 2) / window.innerWidth,
                  y: (rect.top + rect.height / 2) / window.innerHeight,
                });
              }}
              aria-label={t.label}
              aria-current={t.active ? "page" : undefined}
              style={{
                opacity: t.active ? 1 : baseOpacity,
                animation: `aion-anchor-drift-${seedBase.replace(/[^a-z0-9]/gi,'')}-${i} ${animDur}s ease-in-out ${driftSeed * -animDur}s infinite`,
              }}
              className={cn(
                "group relative flex flex-col items-center justify-end",
                "h-11 w-11 rounded-full",
                "transition-[color,transform,opacity] duration-500 ease-out",
                "focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/40 focus-visible:ring-offset-0",
                "active:scale-[0.92]",
                t.active ? "text-foreground" : "text-foreground/55 hover:text-foreground/85",
              )}
            >
              {/* glow halo (active or warm) */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-full transition-opacity duration-700",
                  t.active ? "opacity-100" : "opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60",
                )}
                style={{
                  background: t.active
                    ? `radial-gradient(circle, hsl(var(--primary) / ${0.35 + energy * 0.25}) 0%, transparent 65%)`
                    : glowAlpha > 0
                      ? `radial-gradient(circle, hsl(var(--foreground) / ${glowAlpha}) 0%, transparent 70%)`
                      : 'transparent',
                  filter: t.active ? 'blur(6px)' : 'blur(4px)',
                }}
              />
              {/* glyph */}
              <span className="relative flex h-5 w-5 items-center justify-center">
                {t.icon}
              </span>
              {/* anchor pin — tiny dot beneath active */}
              {t.active && (
                <span
                  aria-hidden
                  className="relative mt-1 h-[3px] w-[3px] rounded-full bg-current"
                  style={{ boxShadow: `0 0 6px hsl(var(--primary) / ${0.6 + energy * 0.4})` }}
                />
              )}
              {/* label — only on active / hover / focus */}
              <span
                className={cn(
                  "pointer-events-none absolute -bottom-3.5 whitespace-nowrap text-[9px] tracking-[0.18em] uppercase",
                  "transition-opacity duration-300",
                  t.active
                    ? "opacity-80"
                    : "opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70",
                )}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
      )}
      {/* per-anchor drift keyframes (tiny vertical breathe, no horizontal jitter) */}
      <style>{tabs.map((_, i) => `
        @keyframes aion-anchor-drift-${seedBase.replace(/[^a-z0-9]/gi,'')}-${i} {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-2.5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes aion-anchor-drift-${seedBase.replace(/[^a-z0-9]/gi,'')}-${i} {
            0%,100% { transform: none; }
          }
        }
      `).join('\n')}</style>
    </nav>
  );
}

export default AionNavDock;
