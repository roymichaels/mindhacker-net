import { CSSProperties, ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { AionOrb } from "./AionOrb";

interface AionHeaderProps {
  /** Brand label, default "AION". */
  brand?: ReactNode;
  onMenuClick?: () => void;
  onBrandClick?: () => void;
  onOrbClick?: () => void;
  className?: string;
  /** Pull rendering up to the chrome layer (fixed top). Default true. */
  fixed?: boolean;
  style?: CSSProperties;
}

/**
 * AionHeader — single canonical top bar.
 * 56px, no border, fade-down mask, ghost menu / centered AION / orb status.
 * RTL aware.
 */
export function AionHeader({
  brand = "AION",
  onMenuClick,
  onBrandClick,
  onOrbClick,
  className,
  fixed = true,
  style,
}: AionHeaderProps) {
  const { isRTL, language } = useTranslation();
  const isHe = language === "he";

  return (
    <header
      dir={isRTL ? "rtl" : "ltr"}
      style={style}
      className={cn(
        fixed && "pointer-events-none fixed inset-x-0 top-0",
        "bg-transparent",
        "pt-[env(safe-area-inset-top)]",
        className,
      )}
      data-aion-header
    >
      {/* Soft bloom behind the AION title — sacred light, no horizontal band */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[env(safe-area-inset-top)] -translate-x-1/2"
        style={{
          width: 320,
          height: 110,
          background:
            "radial-gradient(closest-side, hsl(var(--aion-violet) / 0.18) 0%, hsl(var(--aion-cyan) / 0.06) 45%, transparent 75%)",
          filter: "blur(2px)",
        }}
      />
      <div className="pointer-events-none relative mx-auto min-h-[56px] w-full max-w-screen-md px-2 sm:px-4">
        {/* Side controls — absolute, so the title stays pixel-centered */}
        <button
          type="button"
          aria-label={isHe ? "תפריט" : "Menu"}
          onClick={onMenuClick}
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2",
            isRTL ? "right-2 sm:right-4" : "left-2 sm:left-4",
            "flex h-11 w-11 items-center justify-center rounded-full text-foreground/30 transition-colors hover:text-foreground/70",
          )}
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>

        {/* Centered AION wordmark */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <button
            type="button"
            onClick={onBrandClick}
            className="pointer-events-auto select-none px-3 py-1 active:scale-[0.97] transition"
            aria-label={isHe ? "אודות" : "About"}
          >
            <span
              className="aion-text-hero text-[18px] font-semibold tracking-[0.42em] leading-none"
              style={{
                textShadow:
                  "0 0 18px hsl(var(--aion-violet) / 0.45), 0 0 38px hsl(var(--aion-cyan) / 0.18)",
              }}
            >
              {brand}
            </span>
          </button>
        </div>

        {/* Orb — absolute on the trailing edge, no badge wrapper */}
        <div
          className={cn(
            "pointer-events-auto absolute top-1/2 -translate-y-1/2",
            isRTL ? "left-2 sm:left-4" : "right-2 sm:right-4",
          )}
        >
          <AionOrb
            size="md"
            onClick={onOrbClick}
            ariaLabel={isHe ? "מצב אינטראקטיבי" : "Interactive mode"}
          />
        </div>
      </div>
    </header>
  );
}

export default AionHeader;