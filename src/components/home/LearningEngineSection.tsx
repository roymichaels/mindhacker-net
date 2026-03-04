/**
 * LearningEngineSection — AI-powered personalized learning engine
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { GraduationCap, BookOpen, Brain, Lightbulb, Layers, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const learningFeatures = [
  {
    icon: Brain,
    he: 'קורסים מותאמים אישית ב-AI',
    en: 'AI-Personalized Courses',
    descHe: 'Aurora בונה לך קוריקולום מותאם על סמך האבחון שלך',
    descEn: 'Aurora builds a tailored curriculum based on your assessment',
  },
  {
    icon: BookOpen,
    he: 'שיעורים אינטראקטיביים',
    en: 'Interactive Lessons',
    descHe: 'שיעורים עם תרגילים, שאלות ותוכן מותאם',
    descEn: 'Lessons with exercises, quizzes, and adaptive content',
  },
  {
    icon: Layers,
    he: 'מודולים לפי עמוד',
    en: 'Pillar-Based Modules',
    descHe: 'כל קורס מחובר לתחום חיים ומזין את התוכנית שלך',
    descEn: 'Every course ties to a life domain and feeds your plan',
  },
  {
    icon: Target,
    he: 'תרגילי יישום',
    en: 'Application Exercises',
    descHe: 'תרגילים שהופכים ללמידה שנכנסת ישירות לתוכנית היומית',
    descEn: 'Exercises that integrate directly into your daily plan',
  },
];

export default function LearningEngineSection() {
  const { isRTL } = useTranslation();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-500">
                {isRTL ? 'מנוע לימוד' : 'Learning Engine'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {isRTL ? 'למידה ' : 'Learning '}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                {isRTL ? 'שנבנית בשבילך' : 'Built for You'}
              </span>
            </h2>

            <p className="text-lg text-muted-foreground">
              {isRTL
                ? 'מערכת לימוד שמייצרת קורסים מותאמים אישית על סמך הנתונים שלך — כל שיעור קשור ישירות לתחום חיים ומזין את התוכנית שלך.'
                : 'A learning system that generates personalized courses from your data — every lesson ties to a life domain and feeds your plan.'}
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {learningFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="p-5 rounded-2xl bg-card/60 border border-border/50 hover:border-indigo-500/30 transition-all space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{isRTL ? f.he : f.en}</h3>
                  <p className="text-xs text-muted-foreground">{isRTL ? f.descHe : f.descEn}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
