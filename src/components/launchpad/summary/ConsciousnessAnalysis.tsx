import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Brain, Eye, Sparkles, AlertTriangle, TrendingUp } from 'lucide-react';

interface ConsciousnessAnalysisProps {
  analysis: {
    current_state: string;
    dominant_patterns: string[];
    blind_spots: string[];
    strengths: string[];
    growth_edges: string[];
  };
}

export function ConsciousnessAnalysis({ analysis }: ConsciousnessAnalysisProps) {
  const { language, isRTL } = useTranslation();

  const sections = [
    {
      icon: Brain,
      title: language === 'he' ? 'מצב נוכחי' : 'Current State',
      content: analysis.current_state,
      type: 'text' as const,
    },
    {
      icon: Sparkles,
      title: language === 'he' ? 'חוזקות' : 'Strengths',
      items: analysis.strengths,
      type: 'list' as const,
      color: 'text-green-500',
    },
    {
      icon: Eye,
      title: language === 'he' ? 'דפוסים דומיננטיים' : 'Dominant Patterns',
      items: analysis.dominant_patterns,
      type: 'list' as const,
      color: 'text-blue-500',
    },
    {
      icon: AlertTriangle,
      title: language === 'he' ? 'נקודות עיוורון' : 'Blind Spots',
      items: analysis.blind_spots,
      type: 'list' as const,
      color: 'text-amber-500',
    },
    {
      icon: TrendingUp,
      title: language === 'he' ? 'שולי צמיחה' : 'Growth Edges',
      items: analysis.growth_edges,
      type: 'list' as const,
      color: 'text-purple-500',
    },
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="space-y-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        {language === 'he' ? '📊 ניתוח מצב התודעה' : '📊 Consciousness Analysis'}
      </h3>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
            className="p-4 rounded-xl bg-card/50 border border-border/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <section.icon className={`w-4 h-4 ${section.type === 'list' ? section.color : 'text-primary'}`} />
              <span className="font-medium text-sm">{section.title}</span>
            </div>

            {section.type === 'text' ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {section.items?.map((item, i) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-full bg-background/50 border border-border/50 ${section.color}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
