/**
 * OrbCollectionSection - NFT-style gallery showcasing the 10 orb archetypes
 * that combine to form each user's unique Visual DNA orb.
 * Uses pure CSS gradient spheres for reliable rendering on homepage.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dna, Fingerprint, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Each archetype with its visual identity and what it represents */
const ARCHETYPES = [
  {
    id: 'abyss-glass',
    nameEn: 'Abyss Glass', nameHe: 'זכוכית התהום',
    descEn: 'Born from deep introspection. Transparent layers reveal inner clarity.',
    descHe: 'נולד מהתבוננות עמוקה. שכבות שקופות חושפות בהירות פנימית.',
    dnaEn: 'Influenced by: Mindfulness · Self-awareness scores',
    dnaHe: 'מושפע מ: מיינדפולנס · ציוני מודעות עצמית',
    traitsEn: ['Glass', 'Cellular', 'Deep Ocean'],
    traitsHe: ['זכוכית', 'תאי', 'אוקיינוס עמוק'],
    colors: ['#1a3a5c', '#2980b9', '#48c9b0', '#a3d9e8'],
    gradient: 'radial-gradient(ellipse at 30% 30%, #48c9b0 0%, #2980b9 40%, #1a3a5c 80%, #0d1b2a 100%)',
  },
  {
    id: 'solar-metal',
    nameEn: 'Solar Metal', nameHe: 'מתכת השמש',
    descEn: 'Forged by ambition and drive. A golden surface that commands attention.',
    descHe: 'מחושל על ידי שאיפה ודחף. משטח זהוב שמושך את העין.',
    dnaEn: 'Influenced by: Goal completion · Streak consistency',
    dnaHe: 'מושפע מ: השלמת מטרות · עקביות רצף',
    traitsEn: ['Metal', 'Shards', 'Golden Fire'],
    traitsHe: ['מתכת', 'רסיסים', 'אש זהובה'],
    colors: ['#d4a017', '#e8a730', '#c0392b', '#f5d76e'],
    gradient: 'radial-gradient(ellipse at 40% 35%, #f5d76e 0%, #d4a017 35%, #c0392b 75%, #6b2a14 100%)',
  },
  {
    id: 'violet-iridescence',
    nameEn: 'Violet Iridescence', nameHe: 'זוהר סגול',
    descEn: 'Reflects creative vision. Shifting colors reveal infinite possibilities.',
    descHe: 'משקף חזון יצירתי. צבעים משתנים חושפים אפשרויות אינסופיות.',
    dnaEn: 'Influenced by: Creativity assessments · Vision clarity',
    dnaHe: 'מושפע מ: הערכות יצירתיות · בהירות חזון',
    traitsEn: ['Iridescent', 'Voronoi', 'Cosmic'],
    traitsHe: ['אופלסנט', 'וורונוי', 'קוסמי'],
    colors: ['#6c3483', '#8e44ad', '#c39bd3', '#e8b4f8'],
    gradient: 'radial-gradient(ellipse at 35% 30%, #e8b4f8 0%, #8e44ad 40%, #6c3483 70%, #2c0a3e 100%)',
  },
  {
    id: 'emerald-plasma',
    nameEn: 'Emerald Plasma', nameHe: 'פלזמה אמרלד',
    descEn: 'Pure life force in motion. Radiates growth, healing, and renewal.',
    descHe: 'כוח חיים טהור בתנועה. מקרין צמיחה, ריפוי והתחדשות.',
    dnaEn: 'Influenced by: Health habits · Energy patterns',
    dnaHe: 'מושפע מ: הרגלי בריאות · דפוסי אנרגיה',
    traitsEn: ['Plasma', 'Swirl', 'Living Energy'],
    traitsHe: ['פלזמה', 'מערבולת', 'אנרגיה חיה'],
    colors: ['#1abc9c', '#27ae60', '#2ecc71', '#82e0aa'],
    gradient: 'radial-gradient(ellipse at 45% 40%, #82e0aa 0%, #27ae60 35%, #1abc9c 65%, #0a3d2e 100%)',
  },
  {
    id: 'arctic-stone',
    nameEn: 'Arctic Stone', nameHe: 'אבן ארקטית',
    descEn: 'Quiet resilience carved from patience. Still surface, deep foundation.',
    descHe: 'חוסן שקט שנחצב מסבלנות. משטח שקט, יסוד עמוק.',
    dnaEn: 'Influenced by: Emotional stability · Patience metrics',
    dnaHe: 'מושפע מ: יציבות רגשית · מדדי סבלנות',
    traitsEn: ['Stone', 'Strata', 'Calm Strength'],
    traitsHe: ['אבן', 'שכבות', 'כוח שקט'],
    colors: ['#7f8c8d', '#95a5a6', '#bdc3c7', '#d5dbdb'],
    gradient: 'radial-gradient(ellipse at 50% 45%, #d5dbdb 0%, #95a5a6 40%, #7f8c8d 70%, #4a5859 100%)',
  },
  {
    id: 'neon-reactor',
    nameEn: 'Neon Reactor', nameHe: 'כור ניאון',
    descEn: 'Explosive energy and radical transformation. Nothing stays the same.',
    descHe: 'אנרגיה נפיצה ושינוי רדיקלי. שום דבר לא נשאר אותו דבר.',
    dnaEn: 'Influenced by: Transformation rate · Challenge completion',
    dnaHe: 'מושפע מ: קצב טרנספורמציה · השלמת אתגרים',
    traitsEn: ['Plasma', 'Fractal', 'Electric'],
    traitsHe: ['פלזמה', 'פרקטלי', 'חשמלי'],
    colors: ['#2e86de', '#8854d0', '#a55eea', '#d980fa'],
    gradient: 'radial-gradient(ellipse at 35% 35%, #d980fa 0%, #8854d0 40%, #2e86de 70%, #1a1a4e 100%)',
  },
  {
    id: 'rose-quartz',
    nameEn: 'Rose Quartz', nameHe: 'קוורץ ורוד',
    descEn: 'Gentle power of empathy and connection. Soft yet unbreakable.',
    descHe: 'כוח עדין של אמפתיה וחיבור. רך אך בלתי שביר.',
    dnaEn: 'Influenced by: Relationship quality · Empathy depth',
    dnaHe: 'מושפע מ: איכות מערכות יחסים · עומק אמפתיה',
    traitsEn: ['Glass', 'Voronoi', 'Soft Power'],
    traitsHe: ['זכוכית', 'וורונוי', 'כוח רך'],
    colors: ['#e8a0bf', '#f5c6d0', '#fad7a0', '#fef0f0'],
    gradient: 'radial-gradient(ellipse at 40% 35%, #fef0f0 0%, #f5c6d0 35%, #e8a0bf 65%, #9b5978 100%)',
  },
  {
    id: 'obsidian-wire',
    nameEn: 'Obsidian Wire', nameHe: 'שלד אובסידיאן',
    descEn: 'The skeleton of raw potential. Structure before surface, depth before shine.',
    descHe: 'השלד של פוטנציאל גולמי. מבנה לפני משטח, עומק לפני ברק.',
    dnaEn: 'Influenced by: Analytical thinking · Strategic planning',
    dnaHe: 'מושפע מ: חשיבה אנליטית · תכנון אסטרטגי',
    traitsEn: ['Wireframe', 'Shards', 'Dark Core'],
    traitsHe: ['שלד', 'רסיסים', 'ליבה אפלה'],
    colors: ['#1a1a2e', '#3d2c6e', '#2d4a7a', '#0f0f1a'],
    gradient: 'radial-gradient(ellipse at 45% 40%, #3d2c6e 0%, #2d4a7a 40%, #1a1a2e 70%, #0f0f1a 100%)',
  },
  {
    id: 'aurora-skin',
    nameEn: 'Aurora Skin', nameHe: 'עור אורורה',
    descEn: 'Ever-shifting like the northern lights. Embraces change as identity.',
    descHe: 'משתנה תמיד כמו הזוהר הצפוני. מחבק שינוי כזהות.',
    dnaEn: 'Influenced by: Adaptability · Growth mindset score',
    dnaHe: 'מושפע מ: גמישות · ציון חשיבה צמיחתית',
    traitsEn: ['Iridescent', 'Cellular', 'Aurora'],
    traitsHe: ['אופלסנט', 'תאי', 'אורורה'],
    colors: ['#1abc9c', '#45b39d', '#f39c12', '#e74c8b'],
    gradient: 'radial-gradient(ellipse at 30% 30%, #f39c12 0%, #1abc9c 35%, #45b39d 60%, #e74c8b 90%)',
  },
  {
    id: 'sunset-marble',
    nameEn: 'Sunset Marble', nameHe: 'שיש שקיעה',
    descEn: 'Warmth of experience etched in stone. Wisdom earned through living.',
    descHe: 'חום הניסיון חרוט באבן. חוכמה שנרכשה מהחיים.',
    dnaEn: 'Influenced by: Life experience · Wisdom reflections',
    dnaHe: 'מושפע מ: ניסיון חיים · רפלקציות חוכמה',
    traitsEn: ['Metal', 'Strata', 'Warm Dusk'],
    traitsHe: ['מתכת', 'שכבות', 'שקיעה חמה'],
    colors: ['#6c3483', '#e67e22', '#f39c12', '#d4a017'],
    gradient: 'radial-gradient(ellipse at 40% 35%, #f39c12 0%, #e67e22 35%, #6c3483 70%, #2c0a3e 100%)',
  },
];

/** Animated CSS sphere with gradient + glow */
function OrbSphere({ gradient, colors, size = 140 }: { gradient: string; colors: string[]; size?: number }) {
  return (
    <motion.div
      className="relative rounded-full"
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.03, 1],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-[-20%] rounded-full blur-[30px] opacity-40"
        style={{ background: `radial-gradient(circle, ${colors[0]}80 0%, transparent 70%)` }}
      />
      {/* Main sphere */}
      <div
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          background: gradient,
          boxShadow: `inset -${size * 0.1}px -${size * 0.1}px ${size * 0.3}px rgba(0,0,0,0.4), inset ${size * 0.05}px ${size * 0.05}px ${size * 0.15}px rgba(255,255,255,0.15)`,
        }}
      />
      {/* Specular highlight */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.35,
          height: size * 0.2,
          top: size * 0.12,
          left: size * 0.18,
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, transparent 70%)',
          filter: 'blur(3px)',
        }}
      />
    </motion.div>
  );
}

export default function OrbCollectionSection() {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const lang = language === 'he' ? 'he' : 'en';
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 container mx-auto max-w-7xl px-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-8 space-y-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            <Dna className="w-3.5 h-3.5" />
            {lang === 'he' ? 'Visual DNA' : 'Visual DNA'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {lang === 'he' ? 'ה-Orb שלך נבנה מה-DNA שלך' : 'Your Orb Is Built From Your DNA'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            {lang === 'he'
              ? 'כל ארכיטיפ מייצג ממד אחר של האישיות שלך. המערכת ממפה את התשובות, ההרגלים והפעילות שלך — ויוצרת Orb ייחודי שמשלב את כולם יחד. שלך שונה מכל אחד אחר.'
              : 'Each archetype represents a different dimension of your personality. The system maps your answers, habits, and activity — and creates a unique Orb that blends them all together. Yours is different from everyone else\'s.'}
          </p>
        </motion.div>

        {/* DNA explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {[
            { icon: Fingerprint, textEn: 'Unique to you', textHe: 'ייחודי לך' },
            { icon: Dna, textEn: 'Built from behavior', textHe: 'נבנה מהתנהגות' },
            { icon: Sparkles, textEn: 'Evolves with you', textHe: 'מתפתח איתך' },
          ].map(({ icon: Icon, textEn, textHe }) => (
            <div
              key={textEn}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/40 text-sm text-muted-foreground"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span>{lang === 'he' ? textHe : textEn}</span>
            </div>
          ))}
        </motion.div>

        {/* NFT Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {ARCHETYPES.map((arch, index) => (
            <motion.div
              key={arch.id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={cn(
                'group relative flex flex-col items-center rounded-2xl overflow-hidden',
                'bg-card/60 backdrop-blur-sm border border-border/30',
                'shadow-lg hover:shadow-xl hover:border-primary/20',
                'transition-all duration-300'
              )}
            >
              {/* Orb */}
              <div className="relative w-full aspect-square flex items-center justify-center">
                <OrbSphere gradient={arch.gradient} colors={arch.colors} size={100} />
              </div>

              {/* Info */}
              <div className="w-full px-3 pb-3 space-y-1.5">
                {/* Color swatches */}
                <div className="flex gap-1 justify-center">
                  {arch.colors.map((c, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full border border-border/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-foreground text-center truncate">
                  {lang === 'he' ? arch.nameHe : arch.nameEn}
                </h3>

                {/* Description */}
                <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2 min-h-[24px]">
                  {lang === 'he' ? arch.descHe : arch.descEn}
                </p>

                {/* DNA influence tag */}
                <p className="text-[9px] text-primary/70 text-center leading-tight italic">
                  {lang === 'he' ? arch.dnaHe : arch.dnaEn}
                </p>

                {/* Trait pills */}
                <div className="flex flex-wrap gap-1 justify-center pt-0.5">
                  {(lang === 'he' ? arch.traitsHe : arch.traitsEn).map((trait) => (
                    <span
                      key={trait}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Number badge */}
              <div className="absolute top-2 end-2 text-[10px] font-mono text-muted-foreground/40 tabular-nums">
                #{String(index + 1).padStart(2, '0')}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-14 space-y-4"
        >
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            {lang === 'he'
              ? '10 ארכיטיפים × מיליוני וריאציות = ה-Orb שלך. התחל את האבחון וגלה איזה שילוב מייצג אותך.'
              : '10 archetypes × millions of variations = your Orb. Start the assessment and discover which blend represents you.'}
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/onboarding')}
            className="rounded-xl px-8 py-6 text-base font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Fingerprint className={cn('w-5 h-5', isRTL ? 'ml-2' : 'mr-2')} />
            {lang === 'he' ? 'גלה את ה-Orb שלך' : 'Discover Your Orb'}
            <NextArrow className={cn('w-4 h-4', isRTL ? 'mr-2' : 'ml-2')} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
