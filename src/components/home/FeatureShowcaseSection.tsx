/**
 * FeatureShowcaseSection - 6-card grid highlighting key platform capabilities
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Bot, Headphones, Gamepad2, BarChart3, CircleDot, Swords } from 'lucide-react';

const features = [
  {
    icon: Bot,
    titleHe: 'אימון AI אישי',
    titleEn: 'Personal AI Coaching',
    descHe: 'Aurora מכירה את הסיפור שלך, זוכרת הכל ומתאימה את הגישה בזמן אמת.',
    descEn: 'Aurora knows your story, remembers everything, and adapts her approach in real time.',
  },
  {
    icon: Headphones,
    titleHe: 'היפנוזה מותאמת אישית',
    titleEn: 'Custom Hypnosis Sessions',
    descHe: 'סשנים שנבנים לפי המצב והצרכים שלך — ישירות מתוך השיחה.',
    descEn: 'Sessions built around your state and needs — generated directly from your conversations.',
  },
  {
    icon: Gamepad2,
    titleHe: 'גיימיפיקציה מלאה',
    titleEn: 'Full Gamification',
    descHe: 'XP, רמות, הישגים ותגמולים שהופכים כל יום לאתגר שכיף לנצח.',
    descEn: 'XP, levels, achievements and rewards that turn every day into a challenge worth winning.',
  },
  {
    icon: BarChart3,
    titleHe: 'דאשבורד התקדמות',
    titleEn: 'Progress Dashboard',
    descHe: 'ראה את ההתקדמות שלך בכל 11 התחומים במבט אחד.',
    descEn: 'See your progress across all 11 domains at a glance.',
  },
  {
    icon: CircleDot,
    titleHe: 'אווטאר Orb אישי',
    titleEn: 'Personalized Orb Avatar',
    descHe: 'כדור אנרגיה חי שמשתנה עם ההתקדמות שלך — מראה שלך הדיגיטלי.',
    descEn: 'A living energy orb that evolves with your progress — your digital reflection.',
  },
  {
    icon: Swords,
    titleHe: 'אימון לחימה',
    titleEn: 'Combat Training',
    descHe: 'תוכניות ספארינג, לחץ חי ופיתוח מיומנויות — לא רק כושר.',
    descEn: 'Sparring programs, live pressure drills, and skill development — not just fitness.',
  },
];

export default function FeatureShowcaseSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {isRTL ? 'הכלים שלך לטרנספורמציה' : 'Your Transformation Toolkit'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'כל מה שצריך כדי להפוך את החיים שלך — במערכת אחת.'
              : 'Everything you need to transform your life — in one system.'}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {isRTL ? feature.titleHe : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL ? feature.descHe : feature.descEn}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
