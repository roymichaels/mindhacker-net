import { useTranslation } from '@/hooks/useTranslation';
import { aionPresence } from '@/copy/aionPresence';

export default function WhatAionKnowsSection() {
  const { language } = useTranslation();
  const isHe = language === 'he';
  // Placeholder list — real facts wire-up arrives in a later phase.
  const facts: string[] = [];
  return (
    <section className="space-y-2 px-1">
      <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/45">
        {isHe ? 'מה AION יודע' : 'What AION knows'}
      </h3>
      {facts.length === 0 ? (
        <p className="text-[13px] text-foreground/55 italic">
          {isHe ? aionPresence.stillLearning.he : aionPresence.stillLearning.en}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {facts.map((f, i) => (
            <li key={i} className="text-[13px] text-foreground/75">· {f}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
