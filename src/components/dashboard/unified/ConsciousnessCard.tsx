import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Sparkles, AlertCircle, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ConsciousnessAnalysis {
  current_state: string;
  dominant_patterns: string[];
  blind_spots: string[];
  strengths: string[];
  growth_edges: string[];
}

export function ConsciousnessCard({ className }: { className?: string }) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<ConsciousnessAnalysis | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchAnalysis() {
      try {
        const { data } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.summary_data) {
          const summaryData = data.summary_data as any;
          setAnalysis(summaryData.consciousness_analysis);
        }
      } catch (err) {
        console.error('Error fetching consciousness analysis:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [user]);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Brain className="h-4 w-4 text-violet-500" />
            </div>
            {language === 'he' ? 'ניתוח תודעה' : 'Consciousness Analysis'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Brain className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'he' 
              ? 'עדיין אין ניתוח תודעה' 
              : 'No consciousness analysis yet'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {language === 'he' 
              ? 'השלם את ה-Launchpad כדי לקבל ניתוח מעמיק'
              : 'Complete the Launchpad to get deep analysis'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      icon: Sparkles,
      title: language === 'he' ? 'חוזקות' : 'Strengths',
      items: analysis.strengths,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: AlertCircle,
      title: language === 'he' ? 'נקודות עיוורות' : 'Blind Spots',
      items: analysis.blind_spots,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: TrendingUp,
      title: language === 'he' ? 'קצוות צמיחה' : 'Growth Edges',
      items: analysis.growth_edges,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
  ];

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          {language === 'he' ? 'ניתוח תודעה' : 'Consciousness Analysis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
          {analysis.current_state}
        </p>

        {/* Patterns */}
        {analysis.dominant_patterns?.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {language === 'he' ? 'דפוסים דומיננטיים' : 'Dominant Patterns'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analysis.dominant_patterns.map((pattern, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sections Grid */}
        <div className="grid gap-3">
          {sections.map((section) => (
            section.items?.length > 0 && (
              <div key={section.title} className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <section.icon className={cn("h-3.5 w-3.5", section.color)} />
                  <span className="text-xs font-medium">{section.title}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {section.items.slice(0, 3).map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsciousnessCard;
