/**
 * ProblemSection — "The Problem" — Why MindOS exists
 * Maps to whitepaper §2: cognitive fragmentation, digital overload
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { AlertTriangle, Layers, BrainCircuit, Unplug } from 'lucide-react';
import { cn } from '@/lib/utils';

const painPoints = [
  {
    icon: Layers,
    titleEn: '80+ apps, zero connection',
    titleHe: '80+ אפליקציות, אפס חיבור',
    descEn: 'Health, finance, habits, relationships — all in silos. No app sees the full picture.',
    descHe: 'בריאות, כסף, הרגלים, מערכות יחסים — הכל במגירות נפרדות. אף אפליקציה לא רואה את התמונה המלאה.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: BrainCircuit,
    titleEn: 'No cross-domain patterns',
    titleHe: 'אין זיהוי דפוסים חוצי-תחומים',
    descEn: 'Your sleep affects your productivity. Your finances affect your stress. But nothing connects the dots.',
    descHe: 'השינה שלך משפיעה על הפרודוקטיביות. הכספים משפיעים על הלחץ. אבל שום דבר לא מחבר את הנקודות.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    icon: Unplug,
    titleEn: 'Wasted personal data',
    titleHe: 'בזבוז נתונים אישיים',
    descEn: 'You generate immensely valuable behavioral data every day — and get zero return.',
    descHe: 'אתה מייצר נתונים התנהגותיים בעלי ערך אדיר כל יום — ומקבל אפס תמורה.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: AlertTriangle,
    titleEn: 'Motivation dies without reward',
    titleHe: 'מוטיבציה מתה ללא תגמול',
    descEn: 'No systemic reward for growth. No gamification. No economy. Just willpower — and it runs out.',
    descHe: 'אין תגמול מערכתי על צמיחה. אין גיימיפיקציה. אין כלכלה. רק כוח רצון — והוא נגמר.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
];

export default function ProblemSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-destructive/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-4xl relative z-10" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-6">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-bold text-destructive">
              {isRTL ? 'הבעיה' : 'The Problem'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
            <span className="text-foreground">
              {isRTL ? 'החיים שלך מפוצלים' : 'Your Life Is Fragmented'}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'האדם המודרני מנהל את חייו דרך עשרות כלים מנותקים. כל אפליקציה פותרת פריסה צרה — אף אחת לא רואה את התמונה המלאה.'
              : 'Modern humans manage their lives through dozens of disconnected tools. Each app solves a narrow slice — none sees the full picture.'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {painPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={cn(
                  'p-5 rounded-2xl bg-card/60 backdrop-blur border',
                  point.border
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', point.bg)}>
                  <Icon className={cn('h-5 w-5', point.color)} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {isRTL ? point.titleHe : point.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRTL ? point.descHe : point.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
