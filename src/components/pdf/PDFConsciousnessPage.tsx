import { Brain, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsciousnessAnalysis {
  current_state?: string;
  dominant_patterns?: string | string[];
  strengths?: string | string[];
  growth_edges?: string | string[];
  blind_spots?: string | string[];
}

interface PDFConsciousnessPageProps {
  analysis: ConsciousnessAnalysis;
  language: string;
}

// Helper to ensure we always have an array
const toArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(v => typeof v === 'string');
  if (typeof value === 'string') return [value];
  return [];
};

export function PDFConsciousnessPage({ analysis, language }: PDFConsciousnessPageProps) {
  const isRTL = language === 'he';

  const patterns = toArray(analysis.dominant_patterns);
  const strengths = toArray(analysis.strengths);
  const blindSpots = toArray(analysis.blind_spots);
  const growthEdges = toArray(analysis.growth_edges);

  const sections = [
    {
      icon: Sparkles,
      title: isRTL ? 'חוזקות' : 'Strengths',
      items: strengths,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: AlertCircle,
      title: isRTL ? 'נקודות עיוורות' : 'Blind Spots',
      items: blindSpots,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      title: isRTL ? 'קצוות צמיחה' : 'Growth Edges',
      items: growthEdges,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div 
      className="pdf-page bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#0f0f14]"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ width: '595px', height: '842px', padding: '40px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-violet-400" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
          {isRTL ? 'ניתוח תודעה' : 'Consciousness Analysis'}
        </h2>
      </div>

      {/* Current State */}
      {analysis.current_state && (
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-medium text-white/50 mb-2">
            {isRTL ? 'מצב נוכחי' : 'Current State'}
          </h3>
          <p className="text-white/80 leading-relaxed text-sm">{analysis.current_state}</p>
        </div>
      )}

      {/* Dominant Patterns */}
      {patterns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/50 mb-3">
            {isRTL ? 'דפוסים דומיננטיים' : 'Dominant Patterns'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {patterns.map((pattern, i) => (
              <span 
                key={i}
                className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm border border-violet-500/30"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sections Grid */}
      <div className="grid gap-4">
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
                {section.items.slice(0, 5).map((item, i) => (
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
    </div>
  );
}
