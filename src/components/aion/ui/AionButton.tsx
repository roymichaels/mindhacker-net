import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "pill" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "aion-pill-surface aion-glow-cyan text-foreground hover:brightness-110",
  ghost:
    "text-foreground/75 hover:text-foreground hover:bg-white/[0.04] rounded-full",
  pill:
    "aion-pill-surface text-foreground/80 hover:text-foreground",
  danger:
    "aion-pill-surface aion-glow-danger text-foreground",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

interface AionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * AionButton — token-driven action element. No shadcn variants.
 */
export const AionButton = forwardRef<HTMLButtonElement, AionButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  ),
);
AionButton.displayName = "AionButton";

export default AionButton;