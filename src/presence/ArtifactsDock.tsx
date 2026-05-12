/**
 * ArtifactsDock — contextual feed of what AION has prepared for the active
 * room. NOT a menu. Items here are surfaces produced by the orchestrator
 * (today's mission, a hypnosis recommendation, a journal prompt, a scan
 * result). Phase 3.1 ships the contract; Phase 3.7 wires it to the graph.
 */
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const ROOM_DEFAULT_ARTIFACT: Record<string, { en: string; he: string; href: string }> = {
  body: { en: 'Enter a hypnosis session', he: 'כניסה להיפנוזה', href: '/hypnosis' },
  time: { en: 'Open journal', he: 'פתח יומן', href: '/journal' },
  identity: { en: 'View your DNA', he: 'הצג את ה־DNA שלך', href: '/aurora' },
  beliefs: { en: 'Talk it through with AION', he: 'דבר על זה עם אַיון', href: '/aurora' },
  emotions: { en: 'Talk it through with AION', he: 'דבר על זה עם אַיון', href: '/aurora' },
  parts: { en: 'Talk it through with AION', he: 'דבר על זה עם אַיון', href: '/aurora' },
};

export default function ArtifactsDock({ roomId }: { roomId: string }) {
  const { language } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  const fallback = ROOM_DEFAULT_ARTIFACT[roomId] ?? ROOM_DEFAULT_ARTIFACT.beliefs;
  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-4">
      <header className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
          {lang === 'he' ? 'חפצים' : 'Artifacts'}
        </p>
        <h2 className="mt-2 text-lg font-light text-foreground">
          {lang === 'he' ? 'מה שאַיון מציע ברגע זה' : 'What AION suggests right now'}
        </h2>
      </header>

      <Link
        to={fallback.href}
        className="rounded-2xl border border-border/60 bg-card/40 px-5 py-4 text-foreground backdrop-blur-md transition-colors hover:bg-card/60"
      >
        <p className="text-sm font-medium">{fallback[lang]}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {lang === 'he' ? 'הצעה מבוססת חדר נוכחי' : 'Suggestion based on the current room'}
        </p>
      </Link>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {lang === 'he'
          ? 'בקרוב: הזנה דינמית מהמתזמן והגרף.'
          : 'Soon: a dynamic feed from the orchestrator and graph.'}
      </p>
    </div>
  );
}
