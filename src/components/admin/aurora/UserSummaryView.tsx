import { useTranslation } from '@/hooks/useTranslation';
import { 
  useAdminUserSummary, 
  useAdminUserLifePlan, 
  useAdminPlanMilestones,
  useAdminUserChecklists,
  useAdminUserProfile
} from '@/hooks/useAdminAuroraInsights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Target, Lightbulb, TrendingUp, Heart, Briefcase,
  CheckCircle2, Circle, AlertTriangle, Sparkles, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

interface UserSummaryViewProps {
  userId: string | null;
}

const UserSummaryView = ({ userId }: UserSummaryViewProps) => {
  const { language, isRTL } = useTranslation();
  const dateLocale = isRTL ? he : enUS;

  const { data: summary, isLoading: summaryLoading } = useAdminUserSummary(userId);
  const { data: lifePlan, isLoading: planLoading } = useAdminUserLifePlan(userId);
  const { data: milestones, isLoading: milestonesLoading } = useAdminPlanMilestones(lifePlan?.id || null);
  const { data: checklists } = useAdminUserChecklists(userId);
  const { data: profile } = useAdminUserProfile(userId);

  if (!userId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {language === 'he' ? 'בחר משתמש לצפייה' : 'Select a user to view'}
      </div>
    );
  }

  if (summaryLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {language === 'he' ? 'אין סיכום למשתמש זה' : 'No summary for this user'}
      </div>
    );
  }

  const summaryData = summary.summary_data;

  return (
    <div className="space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{profile?.full_name || userId.slice(0, 8)}</h2>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'נוצר ב-' : 'Created '}
            {format(new Date(summary.generated_at), 'dd/MM/yyyy HH:mm', { locale: dateLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            {summary.consciousness_score}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {summary.transformation_readiness}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Lightbulb className="h-3 w-3" />
            {summary.clarity_score}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="consciousness" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consciousness">
            {language === 'he' ? 'תודעה' : 'Consciousness'}
          </TabsTrigger>
          <TabsTrigger value="plan">
            {language === 'he' ? 'תוכנית' : 'Plan'}
          </TabsTrigger>
          <TabsTrigger value="milestones">
            {language === 'he' ? 'אבני דרך' : 'Milestones'}
          </TabsTrigger>
          <TabsTrigger value="checklists">
            {language === 'he' ? 'צ׳קליסטים' : 'Checklists'}
          </TabsTrigger>
        </TabsList>

        {/* Consciousness Analysis Tab */}
        <TabsContent value="consciousness" className="space-y-4 mt-4">
          {/* Current State */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                {language === 'he' ? 'מצב נוכחי' : 'Current State'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {summaryData?.consciousness_analysis?.current_state || '-'}
              </p>
            </CardContent>
          </Card>

          {/* Patterns & Strengths Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dominant Patterns */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {language === 'he' ? 'דפוסים דומיננטיים' : 'Dominant Patterns'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summaryData?.consciousness_analysis?.dominant_patterns?.map((pattern: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {pattern}
                    </li>
                  )) || <li className="text-sm text-muted-foreground">-</li>}
                </ul>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-500" />
                  {language === 'he' ? 'חוזקות' : 'Strengths'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summaryData?.consciousness_analysis?.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      {strength}
                    </li>
                  )) || <li className="text-sm text-muted-foreground">-</li>}
                </ul>
              </CardContent>
            </Card>

            {/* Blind Spots */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Circle className="h-4 w-4 text-red-500" />
                  {language === 'he' ? 'נקודות עיוורות' : 'Blind Spots'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summaryData?.consciousness_analysis?.blind_spots?.map((spot: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {spot}
                    </li>
                  )) || <li className="text-sm text-muted-foreground">-</li>}
                </ul>
              </CardContent>
            </Card>

            {/* Growth Edges */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  {language === 'he' ? 'קצוות צמיחה' : 'Growth Edges'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {summaryData?.consciousness_analysis?.growth_edges?.map((edge: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {edge}
                    </li>
                  )) || <li className="text-sm text-muted-foreground">-</li>}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Life Direction */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                {language === 'he' ? 'כיוון חיים' : 'Life Direction'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'he' ? 'שאיפה מרכזית' : 'Core Aspiration'}
                </p>
                <p className="text-sm font-medium">
                  {summaryData?.life_direction?.core_aspiration || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'he' ? 'סיכום החזון' : 'Vision Summary'}
                </p>
                <p className="text-sm">{summaryData?.life_direction?.vision_summary || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {language === 'he' ? 'ציון בהירות' : 'Clarity Score'}
                </p>
                <div className="flex items-center gap-2">
                  <Progress value={summaryData?.life_direction?.clarity_score || 0} className="flex-1" />
                  <span className="text-sm font-medium">{summaryData?.life_direction?.clarity_score || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identity & Career */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  {language === 'he' ? 'פרופיל זהות' : 'Identity Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'תכונות דומיננטיות' : 'Dominant Traits'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summaryData?.identity_profile?.dominant_traits?.map((trait: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{trait}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'ערכים' : 'Values'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {summaryData?.identity_profile?.values_hierarchy?.map((value: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">{value}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'Ego State מומלץ' : 'Suggested Ego State'}
                  </p>
                  <Badge className="mt-1">{summaryData?.identity_profile?.suggested_ego_state || '-'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-orange-500" />
                  {language === 'he' ? 'מסלול קריירה' : 'Career Path'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'מצב נוכחי' : 'Current Status'}
                  </p>
                  <p className="text-sm">{summaryData?.career_path?.current_status || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'שאיפה' : 'Aspiration'}
                  </p>
                  <p className="text-sm">{summaryData?.career_path?.aspiration || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'he' ? 'צעדים מרכזיים' : 'Key Steps'}
                  </p>
                  <ul className="space-y-1 mt-1">
                    {summaryData?.career_path?.key_steps?.map((step: string, i: number) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-4 mt-4">
          {planLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !lifePlan ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'he' ? 'אין תוכנית פעילה' : 'No active plan'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Plan Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {language === 'he' ? 'תוכנית 90 ימים' : '90-Day Plan'}
                    </CardTitle>
                    <Badge variant={lifePlan.status === 'active' ? 'default' : 'secondary'}>
                      {lifePlan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(lifePlan.start_date), 'dd/MM/yy', { locale: dateLocale })}
                        {' - '}
                        {format(new Date(lifePlan.end_date), 'dd/MM/yy', { locale: dateLocale })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">
                        {language === 'he' ? 'התקדמות' : 'Progress'}
                      </span>
                      <span className="text-sm font-medium">{lifePlan.progress_percentage}%</span>
                    </div>
                    <Progress value={lifePlan.progress_percentage} />
                  </div>
                </CardContent>
              </Card>

              {/* Months Overview */}
              {lifePlan.plan_data?.months?.map((month: any) => (
                <Card key={month.number}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {month.number}
                      </span>
                      {language === 'he' ? month.title_he : month.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{month.focus}</p>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{month.milestone}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4 mt-4">
          {milestonesLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : !milestones?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'he' ? 'אין אבני דרך' : 'No milestones'}
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <Card key={milestone.id} className={milestone.is_completed ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        milestone.is_completed 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {milestone.is_completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{milestone.week_number}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {language === 'he' ? `חודש ${milestone.month_number}` : `Month ${milestone.month_number}`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        {milestone.goal && (
                          <div className="flex items-center gap-1 mt-2 text-xs">
                            <Target className="h-3 w-3" />
                            <span>{milestone.goal}</span>
                          </div>
                        )}
                        {milestone.tasks && Array.isArray(milestone.tasks) && milestone.tasks.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              {language === 'he' ? 'משימות:' : 'Tasks:'}
                            </p>
                            <ul className="text-xs space-y-0.5">
                              {milestone.tasks.slice(0, 3).map((task: string, i: number) => (
                                <li key={i} className="flex items-center gap-1">
                                  <Circle className="h-2 w-2" />
                                  {task}
                                </li>
                              ))}
                              {milestone.tasks.length > 3 && (
                                <li className="text-muted-foreground">
                                  +{milestone.tasks.length - 3} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-4 mt-4">
          {!checklists?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === 'he' ? 'אין צ׳קליסטים' : 'No checklists'}
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.map((checklist) => {
                const completedCount = checklist.items.filter(i => i.is_completed).length;
                const totalCount = checklist.items.length;
                const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <Card key={checklist.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{checklist.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {completedCount}/{totalCount}
                        </Badge>
                      </div>
                      <Progress value={progressPct} className="h-2 mb-3" />
                      <ul className="space-y-1">
                        {checklist.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-2 text-sm">
                            {item.is_completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                              {item.content}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSummaryView;
