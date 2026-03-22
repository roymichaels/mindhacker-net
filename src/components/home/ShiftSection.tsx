/**
 * ShiftSection — "What if your life was a game?"
 * The paradigm shift moment between Problem and System.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOOP_STEPS = [
  { en: 'Play', he: 'שחק', emoji: '🎮', color: 'text-primary' },
  { en: 'Grow', he: 'צמח', emoji: '🌱', color: 'text-emerald-400' },
  { en: 'Earn', he: 'הרווח', emoji: '💰', color: 'text-amber-400' },
  { en: 'Evolve', he: 'התפתח', emoji: '🧬', color: 'text-violet-400' },
];

export default function ShiftSection() {
  const { isRTL } = useTranslation();
  const isHe = isRTL;

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto max-w-3xl relative z-10 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25"
          >
            <Gamepad2 className="w-8 h-8 text-primary" />
          </motion.div>

          {/* Main question */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
            <span className="text-muted-foreground">
              {isHe ? 'מה אם החיים שלך' : 'What if your life'}
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {isHe ? 'היו משחק?' : 'was a game?'}
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {isHe
              ? 'לא אפליקציית פרודוקטיביות. לא עוזר AI. לא מערכת הפעלה. המשחק של החיים שלך — מופעל על ידי AI.'
              : 'Not a productivity app. Not an AI assistant. Not an operating system. The game of your life — powered by AI.'}
          </p>

          {/* Core Loop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap"
          >
            {LOOP_STEPS.map((step, i) => (
              <div key={step.en} className="flex items-center gap-2 sm:gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span className="text-2xl">{step.emoji}</span>
                  <span className={cn('text-sm sm:text-base font-black uppercase tracking-wider', step.color)}>
                    {isHe ? step.he : step.en}
                  </span>
                </motion.div>
                {i < LOOP_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 flex-shrink-0" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-3 max-w-md mx-auto text-start"
          >
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
              <p className="text-xs font-bold text-destructive/70 uppercase tracking-wider mb-2">
                {isHe ? 'חיים רגילים' : 'Traditional'}
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>{isHe ? 'משימות → שכחה' : 'Tasks → Forgotten'}</li>
                <li>{isHe ? 'הרגלים → נטושים' : 'Habits → Abandoned'}</li>
                <li>{isHe ? 'מאמץ → ללא תגמול' : 'Effort → Unrewarded'}</li>
                <li>{isHe ? 'אפליקציות → מנותקות' : 'Apps → Disconnected'}</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">MindOS</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>{isHe ? 'משימות → קווסטים' : 'Tasks → Quests'}</li>
                <li>{isHe ? 'הרגלים → מערכות' : 'Habits → Systems'}</li>
                <li>{isHe ? 'התקדמות → XP' : 'Progress → XP'}</li>
                <li>{isHe ? 'מאמץ → מטבע' : 'Effort → Currency'}</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
