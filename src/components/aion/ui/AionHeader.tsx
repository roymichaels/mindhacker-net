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
      <div className="pointer-events-auto relative mx-auto flex min-h-[56px] w-full max-w-screen-md items-center justify-between gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label={isHe ? "תפריט" : "Menu"}
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/35 transition-colors hover:text-foreground/80"
        >
          <Menu className="h-[16px] w-[16px]" strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={onBrandClick}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 select-none px-3 py-1 active:scale-[0.97] transition"
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

        <AionOrb
          size="sm"
          onClick={onOrbClick}
          ariaLabel={isHe ? "מצב אינטראקטיבי" : "Interactive mode"}
        />
      </div>
      {/* Smooth dissolve into the conversation atmosphere — no UI line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-10 h-12"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background) / 0.0) 0%, transparent 100%)",
        }}
      />
    </header>
  );
}

export default AionHeader;