/**
 * PresenceIndicators — single muted line of micro-signals.
 * Format: "78% understood · 12d · ↑ calm"
 * No cards, no progress bars, no icons larger than 12px.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useStreak } from '@/hooks/useGameState';
import { useAionDecision } from '@/contexts/AionDecisionContext';

const MODE_HE: Record<string, string> = {
  flow: 'בזרימה', focus: 'ממוקד', recovery: 'התאוששות',
  overwhelmed: 'עומס', hypnosis: 'מופנם', calm: 'רוגע', neutral: 'מאוזן',
};

export default function PresenceIndicators() {
  const { language, isRTL } = useTranslation();
  const { streak } = useStreak();
  const { decision } = useAionDecision();
  const isHe = language === 'he';

  const parts: string[] = [];

  if (streak && streak > 0) {
    parts.push(isHe ? `${streak} ימים` : `${streak}d`);
  }

  if (decision?.mode) {
    const m = isHe ? (MODE_HE[decision.mode] ?? decision.mode) : decision.mode;
    parts.push(m);
  }

  if (decision?.tone) {
    parts.push(decision.tone);
  }

  if (!parts.length) return null;

  return (
    <div
      className="w-full text-center text-[11px] text-muted-foreground/60 tracking-tight"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {parts.join(' · ')}
    </div>
  );
}
