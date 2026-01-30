import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

interface SummaryScoresProps {
  consciousnessScore: number;
  clarityScore: number;
  readinessScore: number;
}

export function SummaryScores({ consciousnessScore, clarityScore, readinessScore }: SummaryScoresProps) {
  const { language, isRTL } = useTranslation();

  const scores = [
    {
      value: consciousnessScore,
      label: language === 'he' ? 'מודעות' : 'Consciousness',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-purple-500/20',
    },
    {
      value: clarityScore,
      label: language === 'he' ? 'בהירות' : 'Clarity',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
    },
    {
      value: readinessScore,
      label: language === 'he' ? 'מוכנות' : 'Readiness',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {scores.map((score, index) => (
        <motion.div
          key={score.label}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.15, type: 'spring', bounce: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full ${score.bgColor} flex items-center justify-center`}>
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/30"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={`stroke-current bg-gradient-to-r ${score.color}`}
                style={{ stroke: `url(#gradient-${index})` }}
                initial={{ strokeDasharray: '0 264' }}
                animate={{ strokeDasharray: `${(score.value / 100) * 264} 264` }}
                transition={{ delay: 0.5 + index * 0.15, duration: 1.5, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className={score.color.split(' ')[0].replace('from-', 'text-')} style={{ stopColor: 'currentColor' }} />
                  <stop offset="100%" className={score.color.split(' ')[1].replace('to-', 'text-')} style={{ stopColor: 'currentColor' }} />
                </linearGradient>
              </defs>
            </svg>
            <motion.span
              className="text-xl sm:text-2xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + index * 0.15 }}
            >
              {score.value}%
            </motion.span>
          </div>
          <span className="text-sm font-medium text-muted-foreground mt-2">{score.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
