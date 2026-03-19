/**
 * TodayHeroCard — A single, visually stunning card replacing the task grid.
 * Pure typography-driven design. No task logic, no buttons.
 */
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export function TodayHeroCard() {
  const { language } = useTranslation();
  const isHe = language === 'he';

  const now = new Date();
  const hour = now.getHours();
  const greeting = isHe
    ? hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב'
    : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const dayName = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { weekday: 'long' });
  const dateStr = now.toLocaleDateString(isHe ? 'he-IL' : 'en-US', { month: 'long', day: 'numeric' });

  const quote = isHe
    ? 'המסע של אלף מילין מתחיל בצעד אחד.'
    : 'The journey of a thousand miles begins with a single step.';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/40",
          "bg-card p-6 sm:p-8",
          isHe && "text-right"
        )}
        dir={isHe ? 'rtl' : 'ltr'}
      >
        {/* Subtle accent line at top */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        {/* Day & Date */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {dayName}
          </span>
          <span className="text-[10px] text-muted-foreground tracking-wide">
            {dateStr}
          </span>
        </div>

        {/* Greeting */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight mt-3">
          {greeting}
        </h2>

        {/* Divider */}
        <div className="my-5 h-px bg-border/30" />

        {/* Quote */}
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-medium italic">
          "{quote}"
        </p>
      </motion.div>
    </div>
  );
}
