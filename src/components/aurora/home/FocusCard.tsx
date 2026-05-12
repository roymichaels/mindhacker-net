/**
 * FocusCard — single adaptive card on Minimal Home.
 * Shows the highest-priority signal from useAmbientContext (next step ▸ focus).
 * Tap = send the suggested prompt to AION. If no prompt is available, the
 * card is display-only.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAmbientContext } from '@/hooks/aurora/useAmbientContext';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface FocusCardProps {
  onSendPrompt: (prompt: string) => void;
}

export default function FocusCard({ onSendPrompt }: FocusCardProps) {
  const { isRTL } = useTranslation();
  const { nextStep, focus, isLoading } = useAmbientContext();

  const line = nextStep ?? focus;
  if (isLoading || !line) return null;

  const tappable = !!line.prompt;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const content = (
    <div className="flex items-center gap-3 w-full">
      <span className="flex-1 text-[13.5px] leading-snug text-foreground/90 line-clamp-2 text-start">
        {line.text}
      </span>
      {tappable && <Chevron className="w-4 h-4 text-muted-foreground/70 shrink-0" />}
    </div>
  );

  const baseClass = cn(
    'w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-white/[0.03]',
    'backdrop-blur-xl px-4 py-3.5 transition-colors',
    tappable && 'hover:bg-white/[0.06] active:bg-white/[0.08] cursor-pointer'
  );

  if (!tappable) {
    return <div className={baseClass} dir={isRTL ? 'rtl' : 'ltr'}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSendPrompt(line.prompt!)}
      className={baseClass}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {content}
    </button>
  );
}
