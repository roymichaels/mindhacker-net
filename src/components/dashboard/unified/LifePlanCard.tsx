import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones, useCompleteMilestone } from '@/hooks/useLifePlan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, Target, CheckCircle2, Circle, Rocket, 
  ChevronRight, Sparkles, Zap
} from 'lucide-react';

const LifePlanCard = () => {
  const { language, isRTL } = useTranslation();
  const { plan, currentMilestone, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const completeMilestone = useCompleteMilestone();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!hasLifePlan) {
    return null;
  }

  const handleCompleteMilestone = () => {
    if (currentMilestone && plan) {
      completeMilestone.mutate({
        milestoneId: currentMilestone.id,
        planId: plan.id,
      });
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            {language === 'he' ? 'תוכנית 90 ימים' : '90-Day Plan'}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {language === 'he' ? `שבוע ${currentWeek}` : `Week ${currentWeek}`}/12
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="text-muted-foreground">
              {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
            </span>
            <span className="font-medium">{plan?.progress_percentage || 0}%</span>
          </div>
          <Progress value={plan?.progress_percentage || 0} className="h-2" />
        </div>

        {/* Current Milestone */}
        {currentMilestone && (
          <div className="p-3 rounded-lg bg-background/50 border space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">{currentMilestone.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {currentMilestone.description}
                </p>
              </div>
              {currentMilestone.is_completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
            </div>

            {/* Goal */}
            {currentMilestone.goal && (
              <div className="flex items-center gap-2 text-xs">
                <Target className="h-3 w-3 text-primary" />
                <span>{currentMilestone.goal}</span>
              </div>
            )}

            {/* Tasks Preview */}
            {currentMilestone.tasks && Array.isArray(currentMilestone.tasks) && currentMilestone.tasks.length > 0 && (
              <div className="space-y-1">
                {currentMilestone.tasks.slice(0, 3).map((task: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Circle className="h-2 w-2" />
                    <span>{task}</span>
                  </div>
                ))}
                {currentMilestone.tasks.length > 3 && (
                  <p className="text-xs text-muted-foreground ps-4">
                    +{currentMilestone.tasks.length - 3} {language === 'he' ? 'נוספים' : 'more'}
                  </p>
                )}
              </div>
            )}

            {/* Complete Button */}
            {!currentMilestone.is_completed && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 gap-1"
                onClick={handleCompleteMilestone}
                disabled={completeMilestone.isPending}
              >
                <Sparkles className="h-3 w-3" />
                {language === 'he' ? 'סיימתי את השבוע!' : 'Complete Week!'}
                <Badge variant="secondary" className="ms-auto text-[10px]">
                  +50 XP
                </Badge>
              </Button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-between text-xs pt-2 border-t">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {plan?.start_date && new Date(plan.start_date).toLocaleDateString()} - 
              {plan?.end_date && new Date(plan.end_date).toLocaleDateString()}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1">
            {language === 'he' ? 'צפה בתוכנית' : 'View Plan'}
            <ChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LifePlanCard;
