/**
 * MotivationalBanner - Rotating informational/motivational banners
 * Placed above the DailyPulseCard on the dashboard.
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Brain, Target, Flame, Compass, Zap, Heart, Star } from 'lucide-react';

interface Banner {
  icon: React.ReactNode;
  textHe: string;
  textEn: string;
  gradient: string;
}

const banners: Banner[] = [
  {
    icon: <Sparkles className="w-4 h-4" />,
    textHe: 'כל צעד קטן מקרב אותך לגרסה הטובה ביותר שלך ✨',
    textEn: 'Every small step brings you closer to your best self ✨',
    gradient: 'from-primary/20 via-primary/5 to-transparent',
  },
  {
    icon: <Brain className="w-4 h-4" />,
    textHe: 'נסה סשן היפנוזה יומי — 15 דקות שמשנות הכל',
    textEn: 'Try a daily hypnosis session — 15 minutes that change everything',
    gradient: 'from-chart-5/20 via-chart-5/5 to-transparent',
  },
  {
    icon: <Target className="w-4 h-4" />,
    textHe: 'הגדר יעדים בתוכנית 90 יום כדי לעקוב אחרי ההתקדמות שלך',
    textEn: 'Set goals in your 90-day plan to track your progress',
    gradient: 'from-chart-2/20 via-chart-2/5 to-transparent',
  },
  {
    icon: <Flame className="w-4 h-4" />,
    textHe: 'שמור על הרצף שלך — עקביות היא המפתח לשינוי אמיתי',
    textEn: 'Keep your streak going — consistency is the key to real change',
    gradient: 'from-destructive/20 via-destructive/5 to-transparent',
  },
  {
    icon: <Compass className="w-4 h-4" />,
    textHe: 'בדוק את הכיוון שלך — תמיד אפשר לכייל מחדש',
    textEn: 'Check your direction — you can always recalibrate',
    gradient: 'from-chart-1/20 via-chart-1/5 to-transparent',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    textHe: 'האנרגיה שלך היא המשאב הכי חשוב — השתמש בה בחוכמה',
    textEn: 'Your energy is your most important resource — use it wisely',
    gradient: 'from-accent/20 via-accent/5 to-transparent',
  },
  {
    icon: <Heart className="w-4 h-4" />,
    textHe: 'דבר עם אורורה — היא כאן בשבילך בכל רגע',
    textEn: 'Talk to Aurora — she\'s here for you at any moment',
    gradient: 'from-chart-4/20 via-chart-4/5 to-transparent',
  },
  {
    icon: <Star className="w-4 h-4" />,
    textHe: 'צבור XP ואנרגיה — כל פעולה מקדמת אותך',
    textEn: 'Earn XP and energy — every action moves you forward',
    gradient: 'from-primary/20 via-accent/5 to-transparent',
  },
];

export function MotivationalBanner() {
  const { language } = useTranslation();
  const isHebrew = language === 'he';
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % banners.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  const banner = banners[index];

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border/30 bg-gradient-to-r cursor-pointer select-none"
      onClick={next}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`flex items-center gap-2.5 px-3 py-2 bg-gradient-to-r ${banner.gradient}`}
        >
          <span className="text-primary shrink-0">{banner.icon}</span>
          <span className="text-xs font-medium text-foreground/80 leading-snug">
            {isHebrew ? banner.textHe : banner.textEn}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-1">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-muted-foreground/20'}`}
          />
        ))}
      </div>
    </div>
  );
}
