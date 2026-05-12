/**
 * GraphCanvas — placeholder for the 3-layer subconscious atlas.
 *
 * Phase 3.1 ships the shell only. The real canvas lands in Phase 3.6 once
 * `graph_nodes` / `graph_edges` and the `memory-writer` edge function exist.
 * Until then we render an honest "your graph is empty / AION is listening"
 * state so the gesture is discoverable without faking data.
 */
import { useLanguage } from '@/contexts/LanguageContext';

export default function GraphCanvas() {
  const { language } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        {lang === 'he' ? 'מפה פנימית' : 'Inner map'}
      </p>
      <h2 className="mt-3 text-2xl font-light text-foreground">
        {lang === 'he' ? 'הגרף שלך עדיין מתעורר' : 'Your graph is still waking up'}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {lang === 'he'
          ? 'אַיון יתחיל לארוג צמתים עם כל שיחה, יומן וסריקה.'
          : 'AION begins weaving nodes from every conversation, journal, and scan.'}
      </p>
    </div>
  );
}
