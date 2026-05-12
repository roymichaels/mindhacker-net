/**
 * BodyHypnosisSurface — the first real room surface.
 *
 * Wraps the existing HypnosisModal as a surface inside the Body & Soma room
 * instead of as a top-level page. The modal already renders full-viewport
 * content, so we mount it open and let the user dismiss it; on dismiss we
 * collapse to a "tap to re-enter" affordance so the surface stays present
 * inside the room without forcing the user back through navigation.
 */
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HypnosisModal } from '@/components/dashboard/HypnosisModal';

export default function BodyHypnosisSurface() {
  const { language } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border bg-card/40 p-5 backdrop-blur-md">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {lang === 'he' ? 'שדה היפנוטי' : 'Hypnosis field'}
          </p>
          <h3 className="mt-1 text-base font-medium text-foreground">
            {lang === 'he' ? 'כניסה לעומק' : 'Drop in'}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-foreground transition hover:bg-primary/20"
        >
          {lang === 'he' ? 'התחל' : 'Begin'}
        </button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {lang === 'he'
          ? 'נחת בגוף, נשימה אחת, ואני אוביל מכאן.'
          : 'Land in the body, one breath, and I will guide from here.'}
      </p>

      <HypnosisModal open={open} onOpenChange={setOpen} />
    </div>
  );
}