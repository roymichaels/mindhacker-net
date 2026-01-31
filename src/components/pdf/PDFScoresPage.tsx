import { Brain, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFScoresPageProps {
  scores: {
    consciousness: number;
    clarity: number;
    readiness: number;
  };
  language: string;
}

export function PDFScoresPage({ scores, language }: PDFScoresPageProps) {
  const isRTL = language === 'he';

  const scoreItems = [
    {
      icon: Brain,
      label: isRTL ? 'ציון תודעה' : 'Consciousness Score',
      desc: isRTL ? 'סולם הוקינס - רמת המודעות העצמית' : 'Hawkins Scale - Self-awareness level',
      value: scores.consciousness,
      gradient: 'from-violet-600 to-purple-600',
      bg: 'from-violet-500/20 to-purple-500/10',
    },
    {
      icon: Target,
      label: isRTL ? 'בהירות' : 'Clarity',
      desc: isRTL ? 'מידת הבהירות לגבי הכיוון שלך' : 'How clear you are about your direction',
      value: scores.clarity,
      gradient: 'from-blue-600 to-cyan-600',
      bg: 'from-blue-500/20 to-cyan-500/10',
    },
    {
      icon: Zap,
      label: isRTL ? 'מוכנות לשינוי' : 'Transformation Readiness',
      desc: isRTL ? 'מידת המוכנות לתהליך טרנספורמציה' : 'How ready you are for transformation',
      value: scores.readiness,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'from-amber-500/20 to-orange-500/10',
    },
  ];

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
        {isRTL ? 'ציוני התודעה שלך' : 'Your Consciousness Scores'}
      </h2>

      {/* Score Cards */}
      <div className="space-y-8">
        {scoreItems.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "relative p-6 rounded-2xl border border-white/10",
              `bg-gradient-to-r ${item.bg}`
            )}
          >
            <div className="flex items-center gap-6">
              {/* Score Circle */}
              <div className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center shrink-0",
                `bg-gradient-to-br ${item.gradient}`
              )}>
                <span className="text-2xl font-bold text-white">{item.value}</span>
                <div className="absolute inset-0 rounded-full bg-white/10 blur-sm" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-5 h-5 text-white/70" />
                  <h3 className="text-xl font-semibold text-white">{item.label}</h3>
                </div>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full", `bg-gradient-to-r ${item.gradient}`)}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Decorative */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-violet-600/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-purple-600/5 blur-3xl" />
    </div>
  );
}
