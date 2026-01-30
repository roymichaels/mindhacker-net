import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Activity, ArrowDown, ArrowUp, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BehavioralInsights {
  habits_to_transform: string[];
  habits_to_cultivate: string[];
  resistance_patterns: string[];
}

export function BehavioralInsightsCard({ className }: { className?: string }) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<BehavioralInsights | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchInsights() {
      try {
        const { data } = await supabase
          .from('launchpad_summaries')
          .select('summary_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.summary_data) {
          const summaryData = data.summary_data as any;
          setInsights(summaryData.behavioral_insights);
        }
      } catch (err) {
        console.error('Error fetching behavioral insights:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
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

  if (!insights) {
    return (
      <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            {language === 'he' ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Activity className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-2">
            {language === 'he' 
              ? 'עדיין אין תובנות התנהגותיות' 
              : 'No behavioral insights yet'}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {language === 'he' 
              ? 'השלם את ה-Launchpad כדי לזהות דפוסים'
              : 'Complete the Launchpad to identify patterns'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      icon: ArrowDown,
      title: language === 'he' ? 'הרגלים לשנות' : 'Habits to Transform',
      items: insights.habits_to_transform,
      color: 'text-red-500',
      badgeVariant: 'destructive' as const,
    },
    {
      icon: ArrowUp,
      title: language === 'he' ? 'הרגלים לפתח' : 'Habits to Cultivate',
      items: insights.habits_to_cultivate,
      color: 'text-emerald-500',
      badgeVariant: 'default' as const,
    },
    {
      icon: AlertTriangle,
      title: language === 'he' ? 'דפוסי התנגדות' : 'Resistance Patterns',
      items: insights.resistance_patterns,
      color: 'text-amber-500',
      badgeVariant: 'secondary' as const,
    },
  ];

  return (
    <Card className={cn("", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          {language === 'he' ? 'תובנות התנהגותיות' : 'Behavioral Insights'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section) => (
          section.items?.length > 0 && (
            <div key={section.title} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <section.icon className={cn("h-3.5 w-3.5", section.color)} />
                <span className="text-xs font-medium">{section.title}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {section.items.map((item, i) => (
                  <Badge key={i} variant={section.badgeVariant} className="text-xs font-normal">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )
        ))}
      </CardContent>
    </Card>
  );
}

export default BehavioralInsightsCard;
