import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Compass, Target, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LifeDirectionSectionProps {
  lifeDirection?: {
    central_aspiration?: string;
    vision_summary?: string;
    clarity_score?: number;
  };
}

export function LifeDirectionSection({ lifeDirection }: LifeDirectionSectionProps) {
  const { language, isRTL } = useTranslation();

  if (!lifeDirection) return null;

  const { central_aspiration, vision_summary, clarity_score } = lifeDirection;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Compass className="w-5 h-5 text-primary" />
        {language === 'he' ? '🧭 כיוון החיים שלך' : '🧭 Your Life Direction'}
      </h3>

      <div className="space-y-4">
        {/* Central Aspiration */}
        {central_aspiration && (
          <motion.div
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-primary">
                {language === 'he' ? 'שאיפה מרכזית' : 'Central Aspiration'}
              </span>
            </div>
            <p className="text-base leading-relaxed">
              {central_aspiration}
            </p>
          </motion.div>
        )}

        {/* Vision Summary */}
        {vision_summary && (
          <motion.div
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-card/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm">
                {language === 'he' ? 'סיכום החזון' : 'Vision Summary'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {vision_summary}
            </p>
          </motion.div>
        )}

        {/* Clarity Score */}
        {clarity_score !== undefined && (
          <motion.div
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-card/50 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-sm">
                {language === 'he' ? 'מדד בהירות הכיוון' : 'Direction Clarity Score'}
              </span>
              <span className="text-lg font-bold text-primary">{clarity_score}%</span>
            </div>
            <Progress value={clarity_score} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {clarity_score >= 80 
                ? (language === 'he' ? 'יש לך כיוון ברור מאוד!' : 'You have a very clear direction!')
                : clarity_score >= 60
                ? (language === 'he' ? 'כיוון טוב, יש מקום לחידוד' : 'Good direction, room for refinement')
                : (language === 'he' ? 'בואנו נעבוד על הבהרת הכיוון' : "Let's work on clarifying your direction")
              }
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
