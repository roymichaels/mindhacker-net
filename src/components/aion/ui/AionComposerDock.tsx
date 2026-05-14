import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useChamberIdle } from "@/shellv2/hooks/useChamberIdle";

interface AionComposerDockProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * AionComposerDock — floating wrapper for the global composer.
 * Centers content, applies safe-area, no chrome of its own.
 */
export function AionComposerDock({ children, className, style }: AionComposerDockProps) {
  const { composerState, navVisible } = useChamberIdle();
  const isIdle = composerState === 'idle';
  const hostRef = useRef<HTMLDivElement>(null);

  // Publish composer height as `--composer-h` on the document root so other
  // chamber layers (nav grabber, chat bottom padding) can react.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const apply = () => {
      const h = Math.round(el.getBoundingClientRect().height);
      if (h > 0) document.documentElement.style.setProperty('--composer-h', `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Extra cushion when the ghost nav dock is up so they never stack tight.
  const navCushion = navVisible ? 28 : 0;

  return (
    <div
      ref={hostRef}
      className={cn(
        "pointer-events-none fixed inset-x-0 px-3 flex justify-center",
        className,
      )}
      style={{
        bottom: `calc(max(env(safe-area-inset-bottom), 22px) + ${navCushion}px)`,
        transition: 'bottom 280ms ease',
        ...style,
      }}
      data-composer-state={composerState}
    >
      <div className="relative pointer-events-auto w-full max-w-screen-md">
        {/* Soft environmental underglow — composer hovers like a holographic dock */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-6 -bottom-6 h-24 -z-10 transition-opacity duration-700",
            isIdle ? "opacity-40" : "opacity-100",
          )}
          style={{
            background:
              "radial-gradient(60% 100% at 50% 100%, hsl(var(--aion-violet) / 0.22) 0%, hsl(var(--aion-cyan) / 0.08) 40%, transparent 75%)",
            filter: "blur(14px)",
          }}
        />
        {children}
      </div>
    </div>
  );
}

export default AionComposerDock;