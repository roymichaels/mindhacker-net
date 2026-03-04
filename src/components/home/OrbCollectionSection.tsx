/**
 * OrbCollectionSection - Auto-sliding carousel showcasing WebGL orb archetypes
 */
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Dna, Fingerprint, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Orb } from '@/components/orb/Orb';
import { ORB_PRESETS } from '@/lib/orbPresets';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { PresetOrbDNAModal } from './PresetOrbDNAModal';

interface ArchMeta {
  nameEn: string; nameHe: string;
  descEn: string; descHe: string;
  dnaEn: string; dnaHe: string;
  traitsEn: string[]; traitsHe: string[];
}

const ARCH_DATA: Record<string, ArchMeta> = {
  'abyss-glass': {
    nameEn: 'Abyss Glass', nameHe: 'זכוכית התהום',
    descEn: 'Born from deep introspection. Transparent layers reveal inner clarity.',
    descHe: 'נולד מהתבוננות עמוקה. שכבות שקופות חושפות בהירות פנימית.',
    dnaEn: 'Mindfulness · Self-awareness',
    dnaHe: 'מיינדפולנס · מודעות עצמית',
    traitsEn: ['Glass', 'Cellular', 'Deep Ocean'],
    traitsHe: ['זכוכית', 'תאי', 'אוקיינוס עמוק'],
  },
  'solar-metal': {
    nameEn: 'Solar Metal', nameHe: 'מתכת השמש',
    descEn: 'Forged by ambition and drive. A golden surface that commands attention.',
    descHe: 'מחושל על ידי שאיפה ודחף. משטח זהוב שמושך את העין.',
    dnaEn: 'Goal completion · Streak consistency',
    dnaHe: 'השלמת מטרות · עקביות רצף',
    traitsEn: ['Metal', 'Shards', 'Golden Fire'],
    traitsHe: ['מתכת', 'רסיסים', 'אש זהובה'],
  },
  'violet-iridescence': {
    nameEn: 'Violet Iridescence', nameHe: 'זוהר סגול',
    descEn: 'Reflects creative vision. Shifting colors reveal infinite possibilities.',
    descHe: 'משקף חזון יצירתי. צבעים משתנים חושפים אפשרויות אינסופיות.',
    dnaEn: 'Creativity · Vision clarity',
    dnaHe: 'יצירתיות · בהירות חזון',
    traitsEn: ['Iridescent', 'Voronoi', 'Cosmic'],
    traitsHe: ['אופלסנט', 'וורונוי', 'קוסמי'],
  },
  'jade-nexus': {
    nameEn: 'Jade Nexus', nameHe: 'נקודת הירקן',
    descEn: 'A crystalline core of growth and balance. Calm energy radiating outward.',
    descHe: 'ליבה קריסטלית של צמיחה ואיזון. אנרגיה רגועה שמקרינה החוצה.',
    dnaEn: 'Health habits · Energy patterns',
    dnaHe: 'הרגלי בריאות · דפוסי אנרגיה',
    traitsEn: ['Glass', 'Swirl', 'Growth Core'],
    traitsHe: ['זכוכית', 'מערבולת', 'ליבת צמיחה'],
  },
  'arctic-stone': {
    nameEn: 'Arctic Stone', nameHe: 'אבן ארקטית',
    descEn: 'Quiet resilience carved from patience. Still surface, deep foundation.',
    descHe: 'חוסן שקט שנחצב מסבלנות. משטח שקט, יסוד עמוק.',
    dnaEn: 'Emotional stability · Patience',
    dnaHe: 'יציבות רגשית · סבלנות',
    traitsEn: ['Stone', 'Strata', 'Calm Strength'],
    traitsHe: ['אבן', 'שכבות', 'כוח שקט'],
  },
  'midnight-prism': {
    nameEn: 'Midnight Prism', nameHe: 'פריזמת חצות',
    descEn: 'Refracts hidden dimensions of self. Deep colors that shift with perspective.',
    descHe: 'שובר ממדים נסתרים של העצמי. צבעים עמוקים שמשתנים עם הפרספקטיבה.',
    dnaEn: 'Transformation rate · Challenge completion',
    dnaHe: 'קצב טרנספורמציה · השלמת אתגרים',
    traitsEn: ['Iridescent', 'Fractal', 'Deep Shift'],
    traitsHe: ['אופלסנט', 'פרקטלי', 'שינוי עמוק'],
  },
  'rose-quartz': {
    nameEn: 'Rose Quartz', nameHe: 'קוורץ ורוד',
    descEn: 'Gentle power of empathy and connection. Soft yet unbreakable.',
    descHe: 'כוח עדין של אמפתיה וחיבור. רך אך בלתי שביר.',
    dnaEn: 'Relationship quality · Empathy',
    dnaHe: 'איכות מערכות יחסים · אמפתיה',
    traitsEn: ['Glass', 'Voronoi', 'Soft Power'],
    traitsHe: ['זכוכית', 'וורונוי', 'כוח רך'],
  },
  'obsidian-wire': {
    nameEn: 'Obsidian Wire', nameHe: 'שלד אובסידיאן',
    descEn: 'The skeleton of raw potential. Structure before surface, depth before shine.',
    descHe: 'השלד של פוטנציאל גולמי. מבנה לפני משטח, עומק לפני ברק.',
    dnaEn: 'Analytical thinking · Strategy',
    dnaHe: 'חשיבה אנליטית · אסטרטגיה',
    traitsEn: ['Wireframe', 'Shards', 'Dark Core'],
    traitsHe: ['שלד', 'רסיסים', 'ליבה אפלה'],
  },
  'aurora-skin': {
    nameEn: 'Aurora Skin', nameHe: 'עור אורורה',
    descEn: 'Ever-shifting like the northern lights. Embraces change as identity.',
    descHe: 'משתנה תמיד כמו הזוהר הצפוני. מחבק שינוי כזהות.',
    dnaEn: 'Adaptability · Growth mindset',
    dnaHe: 'גמישות · חשיבה צמיחתית',
    traitsEn: ['Iridescent', 'Cellular', 'Aurora'],
    traitsHe: ['אופלסנט', 'תאי', 'אורורה'],
  },
  'sunset-marble': {
    nameEn: 'Sunset Marble', nameHe: 'שיש שקיעה',
    descEn: 'Warmth of experience etched in stone. Wisdom earned through living.',
    descHe: 'חום הניסיון חרוט באבן. חוכמה שנרכשה מהחיים.',
    dnaEn: 'Life experience · Wisdom',
    dnaHe: 'ניסיון חיים · חוכמה',
    traitsEn: ['Metal', 'Strata', 'Warm Dusk'],
    traitsHe: ['מתכת', 'שכבות', 'שקיעה חמה'],
  },
};

const AUTO_SLIDE_INTERVAL = 3000;

export default function OrbCollectionSection() {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const lang = language === 'he' ? 'he' : 'en';
  const NextArrow = isRTL ? ArrowLeft : ArrowRight;
  const isMobile = useIsMobile();

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalPresetIdx, setModalPresetIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = ORB_PRESETS.length;

  const visibleCount = isMobile ? 3 : 5;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, AUTO_SLIDE_INTERVAL);
  }, [total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goTo = (idx: number) => {
    setActiveIndex(((idx % total) + total) % total);
    resetTimer();
  };

  // Build visible indices (wrapping)
  const visibleIndices: number[] = [];
  const half = Math.floor(visibleCount / 2);
  for (let i = -half; i <= half; i++) {
    visibleIndices.push(((activeIndex + i) % total + total) % total);
  }

  return (
    <section className="relative py-24 overflow-hidden">
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
            Visual DNA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {lang === 'he' ? 'ה-Orb שלך נבנה מה-DNA שלך' : 'Your Orb Is Built From Your DNA'}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
            {lang === 'he'
              ? 'כל ארכיטיפ מייצג ממד אחר של האישיות שלך. המערכת ממפה את התשובות, ההרגלים והפעילות שלך — ויוצרת Orb ייחודי שמשלב את כולם יחד.'
              : 'Each archetype represents a different dimension of your personality. The system maps your answers, habits, and activity — and creates a unique Orb that blends them all.'}
          </p>
        </motion.div>

        {/* DNA explanation pills */}
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
            <div key={textEn} className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border/40 text-sm text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              <span>{lang === 'he' ? textHe : textEn}</span>
            </div>
          ))}
        </motion.div>

        {/* Carousel row */}
        <div className="relative flex items-center justify-center gap-2 sm:gap-4 md:gap-6 min-h-[320px] sm:min-h-[360px]">
          {visibleIndices.map((presetIdx, slotIdx) => {
            const preset = ORB_PRESETS[presetIdx];
            const meta = ARCH_DATA[preset.id];
            if (!meta) return null;

            const distFromCenter = slotIdx - half;
            const isCenter = distFromCenter === 0;
            const scale = isCenter ? 1 : 0.78 - Math.abs(distFromCenter) * 0.05;
            const opacity = isCenter ? 1 : 0.55 - Math.abs(distFromCenter) * 0.08;
            const orbSize = isMobile ? (isCenter ? 120 : 90) : (isCenter ? 160 : 120);

            return (
              <motion.div
                key={preset.id}
                layout
                initial={false}
                animate={{
                  scale,
                  opacity,
                  zIndex: isCenter ? 10 : 5 - Math.abs(distFromCenter),
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={() => { goTo(presetIdx); setModalPresetIdx(presetIdx); }}
                className={cn(
                  'flex flex-col items-center cursor-pointer rounded-2xl overflow-hidden',
                  'bg-card/60 backdrop-blur-sm border border-border/30',
                  'transition-shadow duration-300',
                  isCenter ? 'shadow-2xl border-primary/30' : 'shadow-md',
                  isMobile ? 'w-[110px]' : 'w-[180px]',
                )}
              >
                {/* Orb */}
                <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                  <Orb
                    profile={preset.profile}
                    size={orbSize}
                    state="breathing"
                    renderer="webgl"
                    showGlow={false}
                  />
                </div>

                {/* Info — only shown for center */}
                <div className={cn(
                  'w-full px-2 pb-3 space-y-1 transition-all duration-300',
                  isCenter ? 'opacity-100 max-h-40' : 'opacity-0 max-h-0 overflow-hidden'
                )}>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground text-center truncate">
                    {lang === 'he' ? meta.nameHe : meta.nameEn}
                  </h3>
                  <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-2">
                    {lang === 'he' ? meta.descHe : meta.descEn}
                  </p>
                  <p className="text-[9px] text-primary/70 text-center italic">
                    {lang === 'he' ? meta.dnaHe : meta.dnaEn}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {(lang === 'he' ? meta.traitsHe : meta.traitsEn).map((trait) => (
                      <span key={trait} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground font-medium">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Number badge */}
                <div className={cn(
                  'absolute top-2 text-[10px] font-mono text-muted-foreground/40 tabular-nums',
                  isRTL ? 'left-2' : 'right-2'
                )}>
                  #{String(presetIdx + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {ORB_PRESETS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn(
                'rounded-full transition-all duration-300',
                idx === activeIndex
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
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
