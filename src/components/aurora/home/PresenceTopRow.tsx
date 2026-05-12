/**
 * PresenceTopRow — minimal top-of-home row.
 * Tiny identity dot + current phase label. No buttons, no chrome.
 */
import { useTranslation } from '@/hooks/useTranslation';
import { useAionDecision } from '@/contexts/AionDecisionContext';

const MODE_HE: Record<string, string> = {
  flow: 'בזרימה',
  focus: 'ממוקד',
  recovery: 'בהתאוששות',
  overwhelmed: 'עמוס',
  hypnosis: 'מופנם',
  calm: 'רגוע',
  neutral: 'מאוזן',
};

export default function PresenceTopRow() {
  const { language, isRTL } = useTranslation();
  const { decision } = useAionDecision();
  const isHe = language === 'he';
  const mode = decision?.mode;
  const label = mode ? (isHe ? (MODE_HE[mode] ?? mode) : mode) : (isHe ? 'נוכח' : 'present');

  return (
    <div
      className="w-full flex items-center gap-2 px-1 pt-2 text-[11px] text-muted-foreground/70"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse" />
      <span className="tracking-tight">{label}</span>
    </div>
  );
}
