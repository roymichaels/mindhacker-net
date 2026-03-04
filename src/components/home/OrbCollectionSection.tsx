/**
 * OrbCollectionSection - NFT-style gallery showcasing 10 distinct orb archetypes.
 * Each orb renders live using CSS fallback for performance on the homepage.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Orb } from '@/components/orb/Orb';
import { ORB_PRESETS } from '@/lib/orbPresets';
import { cn } from '@/lib/utils';

/** Metadata per orb for NFT-style cards */
const ORB_META: Record<string, { traitsEn: string[]; traitsHe: string[] }> = {
  'abyss-glass': {
    traitsEn: ['Glass', 'Cellular', 'Deep Ocean'],
    traitsHe: ['זכוכית', 'תאי', 'אוקיינוס עמוק'],
  },
  'solar-metal': {
    traitsEn: ['Metal', 'Shards', 'Golden Fire'],
    traitsHe: ['מתכת', 'רסיסים', 'אש זהובה'],
  },
  'violet-iridescence': {
    traitsEn: ['Iridescent', 'Voronoi', 'Cosmic'],
    traitsHe: ['אופלסנט', 'וורונוי', 'קוסמי'],
  },
  'emerald-plasma': {
    traitsEn: ['Plasma', 'Swirl', 'Living Energy'],
    traitsHe: ['פלזמה', 'מערבולת', 'אנרגיה חיה'],
  },
  'arctic-stone': {
    traitsEn: ['Stone', 'Strata', 'Calm Strength'],
    traitsHe: ['אבן', 'שכבות', 'כוח שקט'],
  },
  'neon-reactor': {
    traitsEn: ['Plasma', 'Fractal', 'Electric'],
    traitsHe: ['פלזמה', 'פרקטלי', 'חשמלי'],
  },
  'rose-quartz': {
    traitsEn: ['Glass', 'Voronoi', 'Soft Power'],
    traitsHe: ['זכוכית', 'וורונוי', 'כוח רך'],
  },
  'obsidian-wire': {
    traitsEn: ['Wireframe', 'Shards', 'Dark Core'],
    traitsHe: ['שלד', 'רסיסים', 'ליבה אפלה'],
  },
  'aurora-skin': {
    traitsEn: ['Iridescent', 'Cellular', 'Aurora'],
    traitsHe: ['אופלסנט', 'תאי', 'אורורה'],
  },
  'sunset-marble': {
    traitsEn: ['Metal', 'Strata', 'Warm Dusk'],
    traitsHe: ['מתכת', 'שכבות', 'שקיעה חמה'],
  },
};

const ORB_NAMES: Record<string, { en: string; he: string }> = {
  'abyss-glass': { en: 'Abyss Glass', he: 'זכוכית התהום' },
  'solar-metal': { en: 'Solar Metal', he: 'מתכת השמש' },
  'violet-iridescence': { en: 'Violet Iridescence', he: 'זוהר סגול' },
  'emerald-plasma': { en: 'Emerald Plasma', he: 'פלזמה אמרלד' },
  'arctic-stone': { en: 'Arctic Stone', he: 'אבן ארקטית' },
  'neon-reactor': { en: 'Neon Reactor', he: 'כור ניאון' },
  'rose-quartz': { en: 'Rose Quartz', he: 'קוורץ ורוד' },
  'obsidian-wire': { en: 'Obsidian Wire', he: 'שלד אובסידיאן' },
  'aurora-skin': { en: 'Aurora Skin', he: 'עור אורורה' },
  'sunset-marble': { en: 'Sunset Marble', he: 'שיש שקיעה' },
};

const ORB_DESCRIPTIONS: Record<string, { en: string; he: string }> = {
  'abyss-glass': {
    en: 'Born from deep introspection. Transparent layers reveal inner clarity.',
    he: 'נולד מהתבוננות עמוקה. שכבות שקופות חושפות בהירות פנימית.',
  },
  'solar-metal': {
    en: 'Forged by ambition and drive. A golden surface that commands attention.',
    he: 'מחושל על ידי שאיפה ודחף. משטח זהוב שמושך את העין.',
  },
  'violet-iridescence': {
    en: 'Reflects creative vision. Shifting colors reveal infinite possibilities.',
    he: 'משקף חזון יצירתי. צבעים משתנים חושפים אפשרויות אינסופיות.',
  },
  'emerald-plasma': {
    en: 'Pure life force in motion. Radiates growth, healing, and renewal.',
    he: 'כוח חיים טהור בתנועה. מקרין צמיחה, ריפוי והתחדשות.',
  },
  'arctic-stone': {
    en: 'Quiet resilience carved from patience. Still surface, deep foundation.',
    he: 'חוסן שקט שנחצב מסבלנות. משטח שקט, יסוד עמוק.',
  },
  'neon-reactor': {
    en: 'Explosive energy and radical transformation. Nothing stays the same.',
    he: 'אנרגיה נפיצה ושינוי רדיקלי. שום דבר לא נשאר אותו דבר.',
  },
  'rose-quartz': {
    en: 'Gentle power of empathy and connection. Soft yet unbreakable.',
    he: 'כוח עדין של אמפתיה וחיבור. רך אך בלתי שביר.',
  },
  'obsidian-wire': {
    en: 'The skeleton of raw potential. Structure before surface, depth before shine.',
    he: 'השלד של פוטנציאל גולמי. מבנה לפני משטח, עומק לפני ברק.',
  },
  'aurora-skin': {
    en: 'Ever-shifting like the northern lights. Embraces change as identity.',
    he: 'משתנה תמיד כמו הזוהר הצפוני. מחבק שינוי כזהות.',
  },
  'sunset-marble': {
    en: 'Warmth of experience etched in stone. Wisdom earned through living.',
    he: 'חום הניסיון חרוט באבן. חוכמה שנרכשה מהחיים.',
  },
};

export default function OrbCollectionSection() {
  const { t, isRTL, language } = useTranslation();
  const lang = language === 'he' ? 'he' : 'en';

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 space-y-4"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            {lang === 'he' ? 'אוסף ה-Orbs' : 'The Orb Collection'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {lang === 'he' ? 'ה-Orb שלך. הזהות שלך.' : 'Your Orb. Your Identity.'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {lang === 'he'
              ? 'כל Orb נוצר מהפעילות, האישיות והמסע שלך. אין שני אותו דבר — כמוך.'
              : 'Each Orb is generated from your activity, personality, and journey. No two are alike — just like you.'}
          </p>
        </motion.div>

        {/* NFT Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {ORB_PRESETS.map((preset, index) => {
            const meta = ORB_META[preset.id];
            const name = ORB_NAMES[preset.id];
            const desc = ORB_DESCRIPTIONS[preset.id];
            if (!meta || !name) return null;

            const colors = preset.profile.gradientStops?.slice(0, 4) || [];

            return (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.07 }}
                whileHover={{ y: -8, scale: 1.03 }}
                className={cn(
                  'group relative flex flex-col items-center rounded-2xl overflow-hidden',
                  'bg-card/80 backdrop-blur-sm border border-border/40',
                  'shadow-lg hover:shadow-2xl hover:shadow-primary/10',
                  'transition-shadow duration-300 cursor-pointer'
                )}
              >
                {/* Orb container */}
                <div className="relative w-full aspect-square flex items-center justify-center p-4">
                  {/* Glow behind orb */}
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity blur-[40px]"
                    style={{
                      background: `radial-gradient(circle, hsl(${preset.profile.primaryColor}) 0%, transparent 70%)`,
                    }}
                  />
                  <Orb
                    profile={preset.profile}
                    size={120}
                    state="breathing"
                    renderer="css"
                    showGlow={false}
                  />
                </div>

                {/* Info */}
                <div className="w-full px-3 pb-3 space-y-2">
                  {/* Color swatches */}
                  <div className="flex gap-1 justify-center">
                    {colors.map((stop, j) => (
                      <div
                        key={j}
                        className="w-3 h-3 rounded-full border border-border/30"
                        style={{ backgroundColor: `hsl(${stop})` }}
                      />
                    ))}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-foreground text-center truncate">
                    {name[lang]}
                  </h3>

                  {/* Description - shown on hover via group */}
                  <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2 min-h-[24px]">
                    {desc?.[lang]}
                  </p>

                  {/* Trait pills */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(lang === 'he' ? meta.traitsHe : meta.traitsEn).map((trait) => (
                      <span
                        key={trait}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Rarity-style number */}
                <div className="absolute top-2 end-2 text-[10px] font-mono text-muted-foreground/50 tabular-nums">
                  #{String(index + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          {lang === 'he'
            ? '10 ארכיטיפים. מיליוני וריאציות. שלך ייחודי לגמרי.'
            : '10 archetypes. Millions of variations. Yours is completely unique.'}
        </motion.p>
      </div>
    </section>
  );
}
