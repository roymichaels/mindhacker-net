/**
 * BackButton — single back affordance used across modals, sub-pages, and inner hubs.
 *
 * Default: history.back() with `fallbackPath` if there's no history.
 * Override: pass `onBack` to dismiss a modal or run custom logic.
 * RTL-aware: chevron flips automatically.
 */
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  onBack?: () => void;
  fallbackPath?: string;
  ariaLabel?: string;
  className?: string;
}

export default function BackButton({
  onBack,
  fallbackPath = '/outer-world',
  ariaLabel,
  className,
}: BackButtonProps) {
  const navigate = useNavigate();
  const { isRTL } = useTranslation();
  const Chevron = isRTL ? ChevronRight : ChevronLeft;

  const handleClick = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? (isRTL ? 'חזרה' : 'Back')}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full',
        'bg-background/70 backdrop-blur-xl border border-white/10',
        'text-foreground/90 active:scale-95 transition shadow-sm',
        className,
      )}
    >
      <Chevron className="h-5 w-5" />
    </button>
  );
}
