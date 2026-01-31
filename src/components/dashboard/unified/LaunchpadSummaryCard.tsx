import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, Brain, Target, Zap, ArrowRight, Rocket, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LaunchpadSummaryCardProps {
  className?: string;
}

interface SummaryScores {
  consciousness: number;
  clarity: number;
  readiness: number;
}

export function LaunchpadSummaryCard({ className }: LaunchpadSummaryCardProps) {
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<SummaryScores | null>(null);
  const [hasLifePlan, setHasLifePlan] = useState(false);
  const [checklistsCount, setChecklistsCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        // Fetch launchpad summary scores
        const { data: summary } = await supabase
          .from('launchpad_summaries')
          .select('consciousness_score, clarity_score, transformation_readiness')
          .eq('user_id', user.id)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();

        if (summary) {
          setScores({
            consciousness: summary.consciousness_score || 70,
            clarity: summary.clarity_score || 65,
            readiness: summary.transformation_readiness || 75,
          });
        }

        // Check for life plan
        const { data: plan } = await supabase
          .from('life_plans')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
        
        setHasLifePlan(!!plan);

        // Count active checklists
        const { count } = await supabase
          .from('aurora_checklists')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        setChecklistsCount(count || 0);
      } catch (err) {
        console.error('Error fetching launchpad data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!scores) {
    return null;
  }

  const scoreItems = [
    {
      icon: Brain,
      label: language === 'he' ? 'תודעה' : 'Consciousness',
      value: scores.consciousness,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Target,
      label: language === 'he' ? 'בהירות' : 'Clarity',
      value: scores.clarity,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Zap,
      label: language === 'he' ? 'מוכנות' : 'Readiness',
      value: scores.readiness,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" />
          {language === 'he' ? 'סיכום Launchpad' : 'Launchpad Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Bars */}
        <div className="space-y-3">
          {scoreItems.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1 rounded", item.bg)}>
                    <item.icon className={cn("h-3.5 w-3.5", item.color)} />
                  </div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
              <Progress value={item.value} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="flex gap-2 text-xs">
          {hasLifePlan && (
            <div className="flex-1 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-center">
              <Rocket className="h-4 w-4 mx-auto mb-1" />
              {language === 'he' ? 'תוכנית 90 ימים' : '90-Day Plan'}
            </div>
          )}
          {checklistsCount > 0 && (
            <div className="flex-1 p-2 rounded-lg bg-blue-500/10 text-blue-600 text-center">
              <ListChecks className="h-4 w-4 mx-auto mb-1" />
              {checklistsCount} {language === 'he' ? 'משימות' : 'Tasks'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate('/launchpad/complete')}
          >
            {language === 'he' ? 'סיכום מלא' : 'Full Summary'}
            <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
          </Button>
          {hasLifePlan && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate('/life-plan')}
            >
              {language === 'he' ? 'תוכנית חיים' : 'Life Plan'}
              <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default LaunchpadSummaryCard;
