/**
 * FeaturesSection - Core value props in a clean grid
 */

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Brain, 
  Headphones, 
  Target, 
  Sparkles,
  TrendingUp,
  Shield
} from 'lucide-react';

const features = [
  { 
    icon: Brain, 
    titleHe: 'מאמן AI אישי', 
    titleEn: 'Personal AI Coach',
    descHe: 'אורורה - מאמנת AI שמבינה אותך ומלווה אותך 24/7',
    descEn: 'Aurora - AI coach that understands you and guides you 24/7',
    color: 'text-primary'
  },
  { 
    icon: Headphones, 
    titleHe: 'היפנוזה מותאמת', 
    titleEn: 'Custom Hypnosis',
    descHe: 'חווית היפנוזה מותאמת אישית לצרכים שלך',
    descEn: 'Personalized hypnosis experience tailored to your needs',
    color: 'text-purple-500'
  },
  { 
    icon: Target, 
    titleHe: 'תוכנית 90 יום', 
    titleEn: '90-Day Plan',
    descHe: 'מסלול ברור עם אבני דרך ומשימות יומיות',
    descEn: 'Clear path with milestones and daily missions',
    color: 'text-emerald-500'
  },
  { 
    icon: Sparkles, 
    titleHe: 'גיימיפיקציה', 
    titleEn: 'Gamification',
    descHe: 'צבור XP, עלה רמות, והפוך את ההתפתחות למשחק',
    descEn: 'Earn XP, level up, and turn growth into a game',
    color: 'text-amber-500'
  },
  { 
    icon: TrendingUp, 
    titleHe: 'מעקב התקדמות', 
    titleEn: 'Progress Tracking',
    descHe: 'דאשבורד מלא עם סטטיסטיקות והישגים',
    descEn: 'Full dashboard with stats and achievements',
    color: 'text-blue-500'
  },
  { 
    icon: Shield, 
    titleHe: 'פרטיות מלאה', 
    titleEn: 'Full Privacy',
    descHe: 'המידע שלך מוגן ושייך רק לך',
    descEn: 'Your data is protected and belongs only to you',
    color: 'text-rose-500'
  },
];

export default function FeaturesSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4 bg-muted/30 dark:bg-gray-950/50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-black mb-4 text-foreground">
            {isRTL ? 'הכל במקום אחד' : 'Everything in One Place'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'מערכת מלאה להתפתחות אישית עם כל הכלים שאתה צריך'
              : 'A complete personal development system with all the tools you need'
            }
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 
                transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 
                group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">
                {isRTL ? feature.titleHe : feature.titleEn}
              </h3>
              <p className="text-muted-foreground text-sm">
                {isRTL ? feature.descHe : feature.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
