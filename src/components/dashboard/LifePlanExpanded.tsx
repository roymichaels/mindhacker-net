import { useTranslation } from '@/hooks/useTranslation';
import { useLifePlanWithMilestones, useCompleteMilestone } from '@/hooks/useLifePlan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Target, CheckCircle2, Circle, Rocket, 
  Sparkles, Clock, AlertCircle, ChevronDown, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const getDaysInfo = (endDate: string | null | undefined, isCompleted: boolean): { days: number; isOverdue: boolean } => {
  if (!endDate || isCompleted) return { days: 0, isOverdue: false };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    days: Math.abs(diffDays),
    isOverdue: diffDays < 0,
  };
};

export function LifePlanExpanded() {
  const { language, isRTL } = useTranslation();
  const { plan, milestones, currentMilestone, currentWeek, isLoading, hasLifePlan } = useLifePlanWithMilestones();
  const completeMilestone = useCompleteMilestone();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!hasLifePlan) {
    return (
      <div className="text-center py-8">
        <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'אין תוכנית עדיין. סיים את ה-Launchpad ליצירת תוכנית מותאמת אישית.' 
            : 'No plan yet. Complete the Launchpad to generate your personalized plan.'}
        </p>
      </div>
    );
  }

  const handleCompleteMilestone = (milestoneId: string) => {
    if (plan) {
      completeMilestone.mutate({
        milestoneId,
        planId: plan.id,
      });
    }
  };

  // Group milestones by month
  const groupedByMonth: Record<number, typeof milestones> = {};
  milestones.forEach(m => {
    const month = m.month_number || Math.ceil(m.week_number / 4);
    if (!groupedByMonth[month]) groupedByMonth[month] = [];
    groupedByMonth[month].push(m);
  });

  const monthNames = {
    he: ['חודש 1: יסודות', 'חודש 2: התרחבות', 'חודש 3: אינטגרציה'],
    en: ['Month 1: Foundations', 'Month 2: Expansion', 'Month 3: Integration'],
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Stats */}
      <div className="flex flex-wrap items-center gap-4">
        <Badge variant="outline" className="text-sm gap-1">
          <Rocket className="h-3 w-3" />
          {language === 'he' ? `שבוע ${currentWeek}` : `Week ${currentWeek}`}/12
        </Badge>
        <Badge variant="secondary" className="text-sm gap-1">
          <Calendar className="h-3 w-3" />
          {plan?.start_date && new Date(plan.start_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
          {' - '}
          {plan?.end_date && new Date(plan.end_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
        </Badge>
      </div>

      {/* Overall Progress */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">
            {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
          </span>
          <span className="text-lg font-bold text-primary">{plan?.progress_percentage || 0}%</span>
        </div>
        <Progress value={plan?.progress_percentage || 0} className="h-3" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{milestones.filter(m => m.is_completed).length}/{milestones.length} {language === 'he' ? 'שבועות הושלמו' : 'weeks completed'}</span>
        </div>
      </div>

      {/* Months Tabs */}
      <Tabs defaultValue="1" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          {[1, 2, 3].map(month => (
            <TabsTrigger key={month} value={String(month)} className="text-xs">
              {language === 'he' ? `חודש ${month}` : `Month ${month}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {[1, 2, 3].map(month => (
          <TabsContent key={month} value={String(month)} className="mt-4">
            <div className="space-y-4">
              {/* Month Focus */}
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">
                  {monthNames[language === 'he' ? 'he' : 'en'][month - 1]}
                </p>
              </div>

              {/* Weekly Milestones */}
              <Accordion type="single" collapsible className="w-full">
                {(groupedByMonth[month] || []).map((milestone) => {
                  const daysInfo = getDaysInfo(milestone.end_date, milestone.is_completed);
                  const isCurrent = milestone.week_number === currentWeek;

                  return (
                    <AccordionItem key={milestone.id} value={milestone.id}>
                      <AccordionTrigger className={cn(
                        "hover:no-underline py-3",
                        isCurrent && "bg-primary/5 rounded-t-lg px-3 -mx-3"
                      )}>
                        <div className="flex items-center gap-3 flex-1 text-start">
                          {milestone.is_completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : isCurrent ? (
                            <div className="relative">
                              <Circle className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium text-sm truncate",
                              milestone.is_completed && "text-muted-foreground"
                            )}>
                              {language === 'he' ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}: {milestone.title}
                            </p>
                            {isCurrent && !milestone.is_completed && (
                              <Badge variant="secondary" className="text-[10px] mt-1">
                                {language === 'he' ? 'שבוע נוכחי' : 'Current Week'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={cn(
                        "pb-4",
                        isCurrent && "bg-primary/5 rounded-b-lg px-3 -mx-3"
                      )}>
                        <div className="space-y-4 pt-2">
                          {/* Description */}
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                          )}

                          {/* Date & Status */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {milestone.start_date && milestone.end_date && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(milestone.start_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
                                {' - '}
                                {new Date(milestone.end_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
                              </Badge>
                            )}
                            
                            {daysInfo && !milestone.is_completed && daysInfo.isOverdue && (
                              <Badge variant="destructive" className="text-[10px] gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {language === 'he' ? `${daysInfo.days} ימים באיחור` : `${daysInfo.days} days overdue`}
                              </Badge>
                            )}
                          </div>

                          {/* Goal */}
                          {milestone.goal && (
                            <div className="p-3 rounded-lg bg-background border">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="h-4 w-4 text-primary" />
                                <span className="font-medium text-sm">
                                  {language === 'he' ? 'יעד השבוע' : 'Weekly Goal'}
                                </span>
                              </div>
                              <p className="text-sm">{milestone.goal}</p>
                            </div>
                          )}

                          {/* Tasks */}
                          {milestone.tasks && milestone.tasks.length > 0 && (
                            <div className="space-y-2">
                              <p className="font-medium text-sm">
                                {language === 'he' ? 'משימות' : 'Tasks'}
                              </p>
                              <ul className="space-y-1">
                                {milestone.tasks.map((task, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm">
                                    <Circle className="h-2 w-2 mt-2 flex-shrink-0 text-primary" />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Challenge */}
                          {milestone.challenge && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-sm">
                                  {language === 'he' ? 'אתגר השבוע' : 'Weekly Challenge'}
                                </span>
                              </div>
                              <p className="text-sm">{milestone.challenge}</p>
                            </div>
                          )}

                          {/* Hypnosis Recommendation */}
                          {milestone.hypnosis_recommendation && (
                            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-1">
                                <Brain className="h-4 w-4 text-purple-500" />
                                <span className="font-medium text-sm">
                                  {language === 'he' ? 'המלצת היפנוזה' : 'Hypnosis Recommendation'}
                                </span>
                              </div>
                              <p className="text-sm">{milestone.hypnosis_recommendation}</p>
                            </div>
                          )}

                          {/* Complete Button */}
                          {!milestone.is_completed && (
                            <Button
                              size="sm"
                              className="w-full gap-2"
                              onClick={() => handleCompleteMilestone(milestone.id)}
                              disabled={completeMilestone.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {language === 'he' ? 'סמן כהושלם' : 'Mark as Complete'}
                              <Badge variant="secondary" className="ms-auto">
                                +{milestone.xp_reward || 50} XP
                              </Badge>
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
