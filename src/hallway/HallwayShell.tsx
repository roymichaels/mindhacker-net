/**
 * HallwayShell — the world-first entry surface.
 *
 * The hallway is not a dashboard. It is the persistent inner space the user
 * walks through. Each door opens a room (a state of consciousness), not a
 * page. Door order is informational, not a tab bar — the user enters the room
 * AION suggests, or the one they feel pulled toward.
 */
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { listRooms } from './rooms';
import type { RoomDefinition } from './types';

function ambienceStyle(room: RoomDefinition): React.CSSProperties {
  const { hue, saturation, lightness } = room.ambience;
  // Soft inner glow that hints at the room's ambience without overpowering
  // the global background. Uses raw HSL deliberately — these are room-local
  // signals, not global theme tokens.
  return {
    background: `radial-gradient(120% 120% at 30% 20%, hsl(${hue} ${saturation}% ${lightness}% / 0.55) 0%, hsl(${hue} ${Math.max(20, saturation - 20)}% ${Math.max(8, lightness - 10)}% / 0.15) 60%, transparent 100%)`,
    borderColor: `hsl(${hue} ${saturation}% ${Math.min(70, lightness + 30)}% / 0.25)`,
  };
}

export default function HallwayShell() {
  const { language, isRTL } = useLanguage();
  const lang = language === 'he' ? 'he' : 'en';
  const rooms = listRooms();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-[100dvh] w-full px-4 pt-10 pb-32 md:pt-16"
    >
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {lang === 'he' ? 'המסדרון' : 'The Hallway'}
        </p>
        <h1 className="mt-3 text-2xl font-light text-foreground md:text-3xl">
          {lang === 'he'
            ? 'איזה חדר נכנס אליו עכשיו?'
            : 'Which room are we walking into?'}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {lang === 'he'
            ? 'כל חדר הוא מצב של תודעה, לא מסך.'
            : 'Each room is a state of consciousness, not a screen.'}
        </p>
      </header>

      <nav
        aria-label={lang === 'he' ? 'חדרים בתוך המסדרון' : 'Rooms in the hallway'}
        className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {rooms.map((room) => {
          const isOpen = room.implemented;
          return (
            <Link
              key={room.id}
              to={`/hallway/${room.slug}`}
              className="group relative overflow-hidden rounded-2xl border bg-card/40 p-5 backdrop-blur-md transition hover:bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
              style={ambienceStyle(room)}
              aria-label={room.copy.label[lang]}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-medium text-foreground">
                  {room.copy.label[lang]}
                </h2>
                {!isOpen && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {lang === 'he' ? 'נפתח בקרוב' : 'Opening soon'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {room.copy.tagline[lang]}
              </p>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}