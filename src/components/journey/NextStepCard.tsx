/**
 * NextStepCard — single-action presentation for the Journey realm.
 * No checklist, no priority badge. One thing to do, two affordances.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface NextStepCardProps {
  title: string;
  titleEn?: string;
  onStart?: () => void;
}

export default function NextStepCard({ title, titleEn, onStart }: NextStepCardProps) {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();
  const display = isHe ? title : (titleEn || title);

  const askAion = () => {
    navigate('/');
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative w-full max-w-md mx-auto"
    >
      <div
        className="aion-text-soft text-[10px] tracking-[0.28em] uppercase opacity-60 mb-2 text-center"
      >
        {isHe ? 'הצעד הבא שלך' : 'Your one next step'}
      </div>

      <div
        className={cn(
          'rounded-3xl px-6 py-7 backdrop-blur-2xl',
          'bg-foreground/[0.035] border border-white/[0.05]',
        )}
      >
        <div className="text-foreground text-[18px] leading-snug font-medium text-center">
          {display}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {onStart && (
            <button
              type="button"
              onClick={onStart}
              className={cn(
                'inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px]',
                'bg-foreground/90 text-background hover:bg-foreground transition-colors',
              )}
            >
              {isHe ? 'התחל' : 'Start'}
            </button>
          )}
          <button
            type="button"
            onClick={askAion}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-5 py-2 text-[13px]',
              'bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/80 transition-colors',
              'border border-white/[0.06]',
            )}
          >
            {isHe ? 'שאל את AION' : 'Ask AION'}
          </button>
        </div>
      </div>
    </div>
  );
}