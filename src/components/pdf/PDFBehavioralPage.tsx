import { Activity, ArrowDown, ArrowUp, AlertTriangle, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BehavioralInsights {
  habits_to_break?: string[];
  habits_to_develop?: string[];
  resistance_patterns?: string[];
}

interface CareerPath {
  current_status?: string;
  aspirations?: string[];
  next_steps?: string[];
}

interface PDFBehavioralPageProps {
  insights?: BehavioralInsights;
  career?: CareerPath;
  language: string;
}

export function PDFBehavioralPage({ insights, career, language }: PDFBehavioralPageProps) {
  const isRTL = language === 'he';

  const sections = [
    {
      icon: ArrowDown,
      title: isRTL ? 'הרגלים לשנות' : 'Habits to Transform',
      items: insights?.habits_to_break || [],
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      icon: ArrowUp,
      title: isRTL ? 'הרגלים לפתח' : 'Habits to Cultivate',
      items: insights?.habits_to_develop || [],
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: AlertTriangle,
      title: isRTL ? 'דפוסי התנגדות' : 'Resistance Patterns',
      items: insights?.resistance_patterns || [],
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Activity className="w-6 h-6 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
          {isRTL ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
        </h2>
      </div>

      {/* Behavioral Sections */}
      <div className="grid gap-4 mb-8">
        {sections.map((section) => (
          section.items.length > 0 && (
            <div 
              key={section.title}
              className={cn("p-4 rounded-xl border", section.bgColor, section.borderColor)}
            >
              <div className="flex items-center gap-2 mb-3">
                <section.icon className={cn("w-4 h-4", section.color)} />
                <h3 className={cn("font-medium text-sm", section.color)}>{section.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.items.map((item, i) => (
                  <span 
                    key={i}
                    className="px-2 py-1 rounded-lg bg-white/5 text-white/70 text-xs border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Career Path */}
      {career && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-blue-300">
              {isRTL ? 'נתיב קריירה' : 'Career Path'}
            </h2>
          </div>

          {career.current_status && (
            <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-white/50 mb-1">
                {isRTL ? 'סטטוס נוכחי' : 'Current Status'}
              </p>
              <p className="text-white/80 text-sm">{career.current_status}</p>
            </div>
          )}

          {career.aspirations && career.aspirations.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-white/50 mb-2">
                {isRTL ? 'שאיפות' : 'Aspirations'}
              </h4>
              <div className="space-y-1">
                {career.aspirations.map((asp, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-blue-400">•</span>
                    <span>{asp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {career.next_steps && career.next_steps.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-white/50 mb-2">
                {isRTL ? 'צעדים הבאים' : 'Next Steps'}
              </h4>
              <div className="space-y-1">
                {career.next_steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
