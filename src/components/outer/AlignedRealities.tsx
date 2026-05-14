/**
 * AlignedRealities — Outer World portal layer.
 *
 * No marketplace grid, no app-store rows. Four contextual portals into the
 * external economy. Routes are unchanged; only the framing softens.
 */
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface Portal {
  he: string;
  en: string;
  to: string;
}

const PORTALS: Portal[] = [
  { he: 'מאמנים שמתאימים לטרנספורמציה שלך', en: 'Coaches that fit your trajectory', to: '/coaches' },
  { he: 'למידה שסוגרת פער',                en: 'Learning that closes a gap',        to: '/learn' },
  { he: 'קהילה למסע שלך',                  en: 'Community for your current shift',  to: '/community' },
  { he: 'שוק חופשי',                        en: 'Marketplace',                      to: '/fm' },
];

export default function AlignedRealities() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const navigate = useNavigate();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="mx-auto w-full max-w-md">
      <div className="aion-text-soft text-[10px] tracking-[0.28em] uppercase opacity-60 mb-4 text-center">
        {isHe ? 'מציאויות שמתאימות לך עכשיו' : 'Realities aligned with you now'}
      </div>
      <ul className="flex flex-col gap-2.5">
        {PORTALS.map((p) => (
          <li key={p.to}>
            <button
              type="button"
              onClick={() => navigate(p.to)}
              className={cn(
                'group w-full flex items-center justify-between rounded-2xl px-5 py-4',
                'bg-foreground/[0.03] hover:bg-foreground/[0.06] border border-white/[0.05]',
                'backdrop-blur-xl transition-all active:scale-[0.99] text-start',
              )}
            >
              <span className="text-[14px] text-foreground/85">{isHe ? p.he : p.en}</span>
              <span
                aria-hidden
                className="text-foreground/30 group-hover:text-foreground/60 transition-colors text-lg leading-none"
              >
                {isRTL ? '←' : '→'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}