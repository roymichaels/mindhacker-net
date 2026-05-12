/**
 * AmbientContextCard — the single calm card on the `/aurora` home.
 *
 * Renders three quiet lines fed by `useAmbientContext`:
 *   · understanding  — what AION senses about the user right now
 *   · focus          — the live thread that matters most
 *   · next step      — one suggested move (tap to send)
 *
 * No icons, no colors, no buttons. Intentionally minimal.
 */
import { Sparkles, Target, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAmbientContext } from '@/hooks/aurora/useAmbientContext';
import { cn } from '@/lib/utils';

interface AmbientContextCardProps {
  onSendPrompt: (prompt: string) => void;
}

export default function AmbientContextCard({ onSendPrompt }: AmbientContextCardProps) {
  const { language, isRTL } = useTranslation();
  const { understanding, focus, nextStep, isLoading } = useAmbientContext();
  const isHe = language === 'he';

  if (isLoading && !understanding && !focus && !nextStep) {
    return (
      <div
        dir={isRTL ? 'rtl' : 'ltr'}
        className="w-full max-w-md rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 py-4 text-foreground/70 text-sm"
      >
        {isHe ? 'מתחבר אליך…' : 'Tuning in…'}
      </div>
    );
  }

  const Line = ({
    icon: Icon,
    label,
    line,
    interactive,
  }: {
    icon: typeof Sparkles;
    label: string;
    line: { text: string; prompt?: string } | null;
    interactive?: boolean;
  }) => {
    if (!line) return null;
    const tappable = interactive && !!line.prompt;
    const Tag: any = tappable ? 'button' : 'div';
    return (
      <Tag
        type={tappable ? 'button' : undefined}
        onClick={tappable ? () => onSendPrompt(line.prompt!) : undefined}
        className={cn(
          'flex items-start gap-3 w-full text-start py-2.5',
          tappable && 'rounded-xl -mx-2 px-2 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors',
        )}
      >
        <div className="mt-0.5 h-7 w-7 rounded-full bg-white/[0.05] inline-flex items-center justify-center text-foreground/55 shrink-0">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] uppercase tracking-[0.18em] text-foreground/45 leading-none mb-1">
            {label}
          </div>
          <div className={cn('text-[13.5px] text-foreground/90 leading-snug', tappable && 'pe-4')}>
            {line.text}
          </div>
        </div>
        {tappable && (
          <ArrowRight className={cn('h-3.5 w-3.5 mt-1 text-foreground/35 shrink-0', isRTL && 'rotate-180')} />
        )}
      </Tag>
    );
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="w-full max-w-md rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-4 py-3 divide-y divide-white/[0.04]"
    >
      <Line
        icon={Sparkles}
        label={isHe ? 'מה אני מבין/ה' : 'Understanding'}
        line={understanding}
      />
      <Line
        icon={Target}
        label={isHe ? 'במה אנחנו מתמקדים' : 'Focus'}
        line={focus}
      />
      <Line
        icon={ArrowRight}
        label={isHe ? 'הצעד הבא' : 'Next step'}
        line={nextStep}
        interactive
      />
    </div>
  );
}