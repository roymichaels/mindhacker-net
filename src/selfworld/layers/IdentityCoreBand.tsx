/**
 * IdentityCoreBand — frames the existing ProfileNFTTriad as the
 * three-layer identity core (AION · DNA · Character). The triad cards
 * themselves are not redesigned; only the surrounding framing is new so
 * the user reads it as three distinct entities, not one profile.
 */
import ProfileNFTTriad from '@/components/profile/ProfileNFTTriad';
import { useTranslation } from '@/hooks/useTranslation';

export default function IdentityCoreBand() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const captions = isHe
    ? [
        { title: 'AION', sub: 'שכבת אינטליגנציה · המלווה הקבוע שלך' },
        { title: 'אווטאר', sub: 'שכבת התגלמות · איך אתה מופיע ונכנס לעולמות' },
        { title: 'DNA', sub: 'שכבת תודעה · האני הפנימי המתפתח שלך' },
      ]
    : [
        { title: 'AION', sub: 'Intelligence layer · your persistent guide' },
        { title: 'Avatar', sub: 'Embodiment layer · how you appear & access worlds' },
        { title: 'DNA', sub: 'Consciousness layer · your evolving inner self' },
      ];

  return (
    <section className="space-y-3 px-1">
      <div>
        <h3 className="text-[10px] tracking-[0.32em] uppercase text-foreground/45">
          {isHe ? 'ליבת זהות' : 'Identity Core'}
        </h3>
        <p className="text-[11px] text-foreground/45 mt-1">
          {isHe
            ? 'שלוש ישויות נפרדות — לא פרופיל אחד'
            : 'Three distinct entities — not one profile'}
        </p>
      </div>
      <ProfileNFTTriad />
      <div className="grid grid-cols-3 gap-2.5">
        {captions.map((c) => (
          <div key={c.title} className="text-center px-1">
            <p className="text-[9px] text-foreground/50 leading-snug">{c.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
