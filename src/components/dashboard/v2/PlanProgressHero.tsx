import { Target, Calendar, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { motion } from 'framer-motion';

export function PlanProgressHero() {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan-progress-hero', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: plan } = await supabase
        .from('life_plans')
        .select('id, duration_months, start_date, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) return null;

      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, title, week_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });

      const completedMilestones = milestones?.filter(m => m.is_completed) || [];
      const currentMilestone = milestones?.find(m => !m.is_completed);
      const totalWeeks = (plan.duration_months || 3) * 4;
      const currentWeek = currentMilestone?.week_number || completedMilestones.length + 1;
      const currentMonth = Math.min(3, Math.ceil(currentWeek / 4));

      return {
        plan,
        currentMilestone,
        completedCount: completedMilestones.length,
        totalCount: milestones?.length || totalWeeks,
        currentWeek,
        totalWeeks,
        currentMonth,
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // No active plan — prompt to create one
  if (!planData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardContent className="p-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Rocket className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {language === 'he' ? 'צור את תוכנית ה-90 יום שלך' : 'Create Your 90-Day Plan'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'he'
                  ? 'השלם את מסע התודעה כדי לקבל תוכנית טרנספורמציה אישית'
                  : 'Complete the Consciousness Journey to get your personalized transformation plan'}
              </p>
            </div>
            <Button onClick={() => navigate('/launchpad')} className="gap-2">
              <Rocket className="h-4 w-4" />
              {language === 'he' ? 'התחל עכשיו' : 'Start Now'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const progressPercent = Math.round((planData.completedCount / planData.totalCount) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/20">
        <CardContent className="p-5 sm:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Week indicator */}
            <div className="flex-shrink-0 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground font-medium">
                  {language === 'he' ? 'שבוע' : 'Week'}
                </span>
                <span className="text-2xl font-black text-primary">
                  {planData.currentWeek}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {language === 'he' ? `מתוך ${planData.totalWeeks}` : `of ${planData.totalWeeks}`}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-sm sm:text-base">
                    {language === 'he' ? 'תוכנית הטרנספורמציה שלך' : 'Your Transformation Plan'}
                  </h3>
                </div>
                <Badge variant="secondary" className="gap-1 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  {language === 'he' ? `חודש ${planData.currentMonth}` : `Month ${planData.currentMonth}`}
                </Badge>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {planData.completedCount}/{planData.totalCount} {language === 'he' ? 'אבני דרך' : 'milestones'}
                  </span>
                  <span className="font-semibold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2.5 [&>div]:bg-primary" />
              </div>

              {/* Current milestone */}
              {planData.currentMilestone && (
                <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                    {language === 'he' ? 'אבן הדרך הנוכחית' : 'Current Milestone'}
                  </p>
                  <p className="text-sm font-medium line-clamp-1">
                    {planData.currentMilestone.title}
                  </p>
                </div>
              )}
            </div>

            {/* Spacer for layout balance */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
