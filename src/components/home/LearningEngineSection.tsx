/**
 * LearningEngineSection — AI-powered personalized learning engine
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { GraduationCap, BookOpen, Brain, Lightbulb, Layers, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LearningEngineSection() {
  const { t, isRTL } = useTranslation();

  const learningFeatures = [
    { icon: Brain, title: t('home.learningEngine.aiCourses'), desc: t('home.learningEngine.aiCoursesDesc') },
    { icon: BookOpen, title: t('home.learningEngine.interactive'), desc: t('home.learningEngine.interactiveDesc') },
    { icon: Layers, title: t('home.learningEngine.pillarModules'), desc: t('home.learningEngine.pillarModulesDesc') },
    { icon: Target, title: t('home.learningEngine.exercises'), desc: t('home.learningEngine.exercisesDesc') },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-500">
                {t('home.learningEngine.badge')}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              {t('home.learningEngine.title')}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                {t('home.learningEngine.titleHighlight')}
              </span>
            </h2>

            <p className="text-lg text-muted-foreground">
              {t('home.learningEngine.subtitle')}
            </p>
          </motion.div>

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
                  <h3 className="font-bold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
