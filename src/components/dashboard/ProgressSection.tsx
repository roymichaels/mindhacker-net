import { Flame, Trophy, Calendar, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function ProgressSection() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboard = useUnifiedDashboard();
  
  // Fetch current milestone from life_plan_milestones
  const { data: currentMilestone } = useQuery({
    queryKey: ['current-milestone', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('life_plan_milestones')
        .select('id, title, description, week_number, is_completed, life_plans!inner(user_id, status)')
        .eq('life_plans.user_id', user.id)
        .eq('life_plans.status', 'active')
        .eq('is_completed', false)
        .order('week_number', { ascending: true })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch completed weeks count
  const { data: progressData } = useQuery({
    queryKey: ['plan-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return { completed: 0, total: 12 };
      
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id, duration_months')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!plan) return { completed: 0, total: 12 };
      
      // Calculate total weeks from duration_months (4 weeks per month)
      const totalWeeks = (plan.duration_months || 3) * 4;
      
      const { count } = await supabase
        .from('life_plan_milestones')
        .select('id', { count: 'exact', head: true })
        .eq('plan_id', plan.id)
        .eq('is_completed', true);
      
      return { 
        completed: count || 0, 
        total: totalWeeks
      };
    },
    enabled: !!user?.id,
  });

  const completedWeeks = progressData?.completed || 0;
  const totalWeeks = progressData?.total || 12;
  const progressPercent = Math.round((completedWeeks / totalWeeks) * 100);

  const streakMilestones = [3, 7, 14, 30];
  const nextStreakMilestone = streakMilestones.find(m => m > dashboard.streak) || 30;
  const daysToNextMilestone = nextStreakMilestone - dashboard.streak;

  return (
    <div 
      className="grid gap-4 md:grid-cols-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Left Column: Progress */}
      <Card className="bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t('dashboard.progress.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 90-Day Plan Progress */}
          {currentMilestone ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.progress.week')} {currentMilestone.week_number}/{totalWeeks}
                </span>
                <Badge variant="secondary">{progressPercent}%</Badge>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium line-clamp-1">
                  {currentMilestone.title}
                </p>
                {currentMilestone.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {currentMilestone.description}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full gap-1"
                onClick={() => navigate('/life-plan')}
              >
                {t('dashboard.progress.viewPlan')}
                <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('dashboard.progress.noPlan')}
              </p>
              <Button 
                size="sm"
                onClick={() => navigate('/launchpad')}
              >
                {t('dashboard.progress.startPlan')}
              </Button>
            </div>
          )}

          {/* Streak */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold text-sm">
                  {dashboard.streak} {t('dashboard.progress.dayStreak')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daysToNextMilestone > 0 
                    ? t('dashboard.progress.toNextMilestone').replace('{days}', String(daysToNextMilestone))
                    : t('dashboard.progress.maxStreak')
                  }
                </p>
              </div>
            </div>
            <Trophy className={cn(
              "h-5 w-5",
              dashboard.streak >= 7 ? "text-yellow-500" : "text-muted-foreground/30"
            )} />
          </div>
        </CardContent>
      </Card>

      {/* Right Column: Upcoming / Tips */}
      <Card className="bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent" />
            {t('dashboard.upcoming.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Focus Plan Status */}
          {dashboard.activeFocusPlan ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {dashboard.activeFocusPlan.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboard.activeFocusPlan.daysRemaining} {t('common.days')} {t('dashboard.upcoming.remaining')}
                </p>
              </div>
              <Badge variant="outline" className="flex-shrink-0">
                {t('common.active')}
              </Badge>
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <Target className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">
                {t('dashboard.upcoming.noFocus')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.upcoming.suggestion')}
              </p>
            </div>
          )}

          {/* Quick Tip */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground">
              💡 {t('dashboard.upcoming.tip')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
