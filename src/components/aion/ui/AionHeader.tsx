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
        "bg-transparent dark:backdrop-blur-xl dark:backdrop-saturate-150",
        "pt-[env(safe-area-inset-top)]",
        className,
      )}
      data-aion-header
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full hidden dark:block"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--aion-navy) / 0.55) 0%, transparent 100%)",
        }}
      />
      <div className="pointer-events-auto relative mx-auto flex min-h-[56px] w-full max-w-screen-md items-center justify-between gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label={isHe ? "תפריט" : "Menu"}
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground hover:bg-white/[0.04]"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onBrandClick}
          className="flex min-w-0 flex-1 items-center justify-center gap-2 select-none px-3 py-1 active:scale-[0.97] transition"
          aria-label={isHe ? "אודות" : "About"}
        >
          <span className="aion-text-hero text-[18px] font-semibold tracking-[0.32em] leading-none">
            {brand}
          </span>
        </button>

        <AionOrb
          size="sm"
          onClick={onOrbClick}
          ariaLabel={isHe ? "מצב אינטראקטיבי" : "Interactive mode"}
        />
      </div>
    </header>
  );
}

export default AionHeader;