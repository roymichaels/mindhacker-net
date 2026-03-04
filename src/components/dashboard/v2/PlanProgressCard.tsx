import { Target, ChevronRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export function PlanProgressCard() {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch active plan and milestone
  const { data: planData, isLoading } = useQuery({
    queryKey: ['active-plan-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get active plan
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id, duration_months, start_date, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (!plan) return null;

      // Get milestones
      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, title, week_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });

      const completedMilestones = milestones?.filter(m => m.is_completed) || [];
      const currentMilestone = milestones?.find(m => !m.is_completed);
      const totalWeeks = (plan.duration_months || 3) * 4;

      return {
        plan,
        currentMilestone,
        completedCount: completedMilestones.length,
        totalCount: milestones?.length || totalWeeks,
        currentWeek: currentMilestone?.week_number || completedMilestones.length + 1,
        totalWeeks,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!planData) {
    return (
      <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            {t('planProgress.ninetyDayPlan')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">
            {t('planProgress.noActivePlan')}
          </p>
          <Button size="sm" onClick={() => navigate('/onboarding')}>
            {t('planProgress.createPlan')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progressPercent = Math.round((planData.completedCount / planData.totalCount) * 100);

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-500" />
            {t('planProgress.ninetyDayPlan')}
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {t('planProgress.week')} {planData.currentWeek}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {planData.completedCount}/{planData.totalCount} {t('planProgress.milestones')}
            </span>
            <span className="font-medium text-amber-600">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 [&>div]:bg-amber-500" />
        </div>

        {/* Current milestone */}
        {planData.currentMilestone && (
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground mb-0.5">
              {t('planProgress.currentMilestone')}
            </p>
            <p className="text-sm font-medium line-clamp-2">
              {planData.currentMilestone.title}
            </p>
          </div>
        )}

        {/* View plan button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full gap-1"
          onClick={() => navigate('/life-plan')}
        >
          {t('planProgress.viewFullPlan')}
          <ChevronRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
        </Button>
      </CardContent>
    </Card>
  );
}
