/**
 * RoomEnvironment — turns a RoomDefinition into a live consciousness state.
 *
 * Responsibilities (Phase 1.4 minimum):
 *  - Resolve the room from the URL slug.
 *  - Apply room ambience to a wrapping surface.
 *  - Render the entry whisper (single-sentence AION line on entry).
 *  - Provide a stub list of surfaces; real surface implementations land in
 *    Phase 2 alongside the data-graph wiring.
 *
 * It deliberately does NOT mount its own orb — the canonical AION presence is
 * the root SharedOrbStage + AIONPresenceButton in the app shell.
 */
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { getRoomBySlug } from './rooms';
import { pillarsForRoom } from './pillarMap';
import { Surface, isSurfaceImplemented } from './surfaceRegistry';

export default function RoomEnvironment() {
  const { slug } = useParams<{ slug: string }>();
  const { language, isRTL } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  const room = getRoomBySlug(slug);

  if (!room) {
    return (
      <div dir={isRTL ? 'rtl' : 'ltr'} className="px-4 pt-16 text-center">
        <h1 className="text-xl font-light text-foreground">
          {lang === 'he' ? 'אין חדר כזה' : 'No such room'}
        </h1>
        <Link to="/hallway" className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline">
          {lang === 'he' ? 'חזרה למסדרון' : 'Back to the hallway'}
        </Link>
      </div>
    );
  }

  const { hue, saturation, lightness } = room.ambience;
  const ambient: React.CSSProperties = {
    background: `radial-gradient(80% 60% at 50% 0%, hsl(${hue} ${saturation}% ${lightness}% / 0.55) 0%, hsl(${hue} ${Math.max(20, saturation - 30)}% ${Math.max(6, lightness - 8)}% / 0.2) 60%, transparent 100%)`,
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="relative min-h-[100dvh] w-full px-4 pt-12 pb-32 md:pt-20"
      data-room-id={room.id}
      data-aion-mode={room.aion}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={ambient} />

      <header className="mx-auto max-w-2xl text-center">
        <Link to="/hallway" className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          {lang === 'he' ? '← המסדרון' : '← Hallway'}
        </Link>
        <h1 className="mt-4 text-2xl font-light text-foreground md:text-3xl">
          {room.copy.label[lang]}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {room.copy.tagline[lang]}
        </p>
      </header>

      <section
        aria-label={lang === 'he' ? 'אַיון מקבל אותך' : 'AION welcomes you'}
        className="mx-auto mt-10 max-w-xl rounded-2xl border bg-card/40 p-5 text-center backdrop-blur-md"
      >
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {lang === 'he' ? 'אַיון לוחש' : 'AION whispers'}
        </p>
        <p className="mt-3 text-base text-foreground">
          “{room.copy.entryWhisper[lang]}”
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-2xl">
        <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {lang === 'he' ? 'משטחים בתוך החדר' : 'Surfaces inside this room'}
        </h2>
        <div className="mt-4 grid gap-3">
          {room.surfaces.map((surfaceId) => {
            const live = isSurfaceImplemented(surfaceId);
            const pendingFallback = (
              <div className="rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
                <span className="font-mono text-xs">{surfaceId}</span>
                <span className="ms-3 text-[11px] uppercase tracking-widest">
                  {lang === 'he' ? 'בבנייה' : 'pending'}
                </span>
              </div>
            );
            if (!live) return <div key={surfaceId}>{pendingFallback}</div>;
            return (
              <Surface
                key={surfaceId}
                surfaceId={surfaceId}
                roomId={room.id}
                fallback={pendingFallback}
              />
            );
          })}
        </div>

        {(() => {
          const pillars = pillarsForRoom(room.id);
          if (!pillars.length) return null;
          return (
            <div className="mt-8">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {lang === 'he' ? 'תחומים מאוחדים בחדר זה' : 'Pillars federated here'}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {pillars.map((p) => (
                  <li
                    key={p}
                    className="rounded-full border border-border/50 bg-card/30 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}
      </section>
    </div>
  );
}