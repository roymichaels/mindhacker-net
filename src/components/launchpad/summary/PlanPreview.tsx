import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar, Target, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Month {
  number: number;
  title: string;
  title_he?: string;
  focus: string;
  milestone: string;
}

interface PlanPreviewProps {
  months: Month[];
  onViewFullPlan?: () => void;
}

const MONTH_ICONS = ['🌱', '🔨', '🚀'];
const MONTH_COLORS = [
  'from-green-500/20 to-emerald-500/20 border-green-500/30',
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'from-purple-500/20 to-violet-500/20 border-purple-500/30',
];

export function PlanPreview({ months, onViewFullPlan }: PlanPreviewProps) {
  const { language, isRTL } = useTranslation();

  // Default months if not provided
  const displayMonths = months?.length > 0 ? months : [
    { number: 1, title: 'Foundations', title_he: 'יסודות', focus: 'Building core habits', milestone: 'Establish daily routine' },
    { number: 2, title: 'Building', title_he: 'בנייה', focus: 'Skill development', milestone: 'Master key skills' },
    { number: 3, title: 'Momentum', title_he: 'תנופה', focus: 'Acceleration', milestone: 'Full transformation' },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="space-y-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        {language === 'he' ? '📅 תוכנית 90 הימים שלך' : '📅 Your 90-Day Plan'}
      </h3>

      <div className="space-y-3">
        {displayMonths.slice(0, 3).map((month, index) => (
          <motion.div
            key={month.number}
            initial={{ x: isRTL ? 30 : -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.15 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${MONTH_COLORS[index]} border`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{MONTH_ICONS[index]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {language === 'he' ? `חודש ${month.number}:` : `Month ${month.number}:`}{' '}
                    {language === 'he' && month.title_he ? month.title_he : month.title}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {language === 'he' ? `שבועות ${(index * 4) + 1}-${(index + 1) * 4}` : `Weeks ${(index * 4) + 1}-${(index + 1) * 4}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{month.focus}</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-primary">{month.milestone}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {onViewFullPlan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onViewFullPlan}
            className="w-full gap-2"
          >
            {language === 'he' ? '📋 צפה בתוכנית המלאה' : '📋 View Full Plan'}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
