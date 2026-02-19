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
      return { plan, currentMilestone, completedCount: completedMilestones.length, totalCount: milestones?.length || totalWeeks, currentWeek, totalWeeks, currentMonth };
    },
    enabled: !!user?.id,
  });

  if (isLoading) return <Card className="overflow-hidden"><CardContent className="p-3"><Skeleton className="h-16 w-full" /></CardContent></Card>;

  if (!planData) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold">{language === 'he' ? 'צור תוכנית 90 יום' : 'Create 90-Day Plan'}</h3>
              <p className="text-[10px] text-muted-foreground">{language === 'he' ? 'השלם את מסע התודעה' : 'Complete the journey first'}</p>
            </div>
            <Button size="sm" onClick={() => navigate('/onboarding')} className="gap-1 h-7 text-[11px] shrink-0">
              <Rocket className="h-3 w-3" />{language === 'he' ? 'התחל' : 'Start'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const progressPercent = Math.round((planData.completedCount / planData.totalCount) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-2.5" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex items-center gap-2.5">
            {/* Week indicator */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-[8px] text-muted-foreground">{language === 'he' ? 'שבוע' : 'Wk'}</span>
              <span className="text-lg font-black text-primary leading-none">{planData.currentWeek}</span>
              <span className="text-[8px] text-muted-foreground">/{planData.totalWeeks}</span>
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-xs flex items-center gap-1 truncate">
                  <Target className="h-3 w-3 text-primary shrink-0" />
                  {language === 'he' ? 'תוכנית טרנספורמציה' : 'Transformation Plan'}
                </h3>
                <Badge variant="secondary" className="gap-0.5 text-[10px] h-5 shrink-0">
                  <Calendar className="h-2.5 w-2.5" />M{planData.currentMonth}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{planData.completedCount}/{planData.totalCount}</span>
                  <span className="font-semibold text-primary">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5 [&>div]:bg-primary" />
              </div>
              {planData.currentMilestone && (
                <p className="text-[10px] text-muted-foreground truncate">→ {planData.currentMilestone.title}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
