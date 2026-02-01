import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  Loader2, 
  ArrowLeft, 
  ArrowRight,
  User,
  Brain,
  Target,
  Sparkles,
  CheckCircle2,
  Zap,
  Heart,
  Star,
  Compass,
  Anchor,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LifePlanMilestone {
  id: string;
  week_number: number;
  title: string;
  description: string;
  tasks: any;
  is_completed: boolean;
}

const UserDashboardView = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { hasRole } = useUserRoles();
  const isHebrew = language === 'he';
  const isAdmin = hasRole('admin');

  // Fetch comprehensive user data
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-dashboard', userId],
    queryFn: async () => {
      if (!userId || !isAdmin) throw new Error('Unauthorized');

      // Split queries to avoid TypeScript depth issues
      const [profileRes, emailRes, launchpadSummaryRes, launchpadProgressRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.functions.invoke('get-user-data', { body: { userId } }),
        supabase.from('launchpad_summaries').select('*').eq('user_id', userId).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('launchpad_progress').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const lifePlanRes = await supabase.from('life_plans').select('*').eq('user_id', userId).maybeSingle();
      
      const [identityRes, directionsRes] = await Promise.all([
        supabase.from('aurora_identity_elements').select('*').eq('user_id', userId),
        supabase.from('aurora_life_direction').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const [checklistsRes, commitmentsRes, focusPlansRes] = await Promise.all([
        supabase.from('aurora_checklists').select('*, aurora_checklist_items(*)').eq('user_id', userId),
        supabase.from('aurora_commitments').select('*').eq('user_id', userId),
        supabase.from('aurora_focus_plans').select('*').eq('user_id', userId),
      ]);

      const [energyPatternsRes, behavioralPatternsRes, communityRes] = await Promise.all([
        supabase.from('aurora_energy_patterns').select('*').eq('user_id', userId),
        supabase.from('aurora_behavioral_patterns').select('*').eq('user_id', userId),
        supabase.from('community_members').select('*, community_levels(*)').eq('user_id', userId).maybeSingle(),
      ]);

      // Parse summary_data from launchpad_summaries
      const summaryData = launchpadSummaryRes.data?.summary_data as any || null;

      return {
        profile: profileRes.data,
        email: emailRes.data?.user?.email || 'Unknown',
        launchpadSummary: summaryData,
        launchpadScores: launchpadSummaryRes.data ? {
          clarity_score: launchpadSummaryRes.data.clarity_score,
          consciousness_score: launchpadSummaryRes.data.consciousness_score,
          transformation_readiness: launchpadSummaryRes.data.transformation_readiness,
        } : null,
        launchpadProgress: launchpadProgressRes.data,
        lifePlan: lifePlanRes.data,
        milestones: [] as LifePlanMilestone[],
        identityElements: identityRes.data || [],
        lifeDirection: directionsRes.data,
        checklists: checklistsRes.data || [],
        commitments: commitmentsRes.data || [],
        focusPlans: focusPlansRes.data || [],
        energyPatterns: energyPatternsRes.data || [],
        behavioralPatterns: behavioralPatternsRes.data || [],
        community: communityRes.data,
      };
    },
    enabled: !!userId && isAdmin,
  });

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Unauthorized</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">{isHebrew ? 'שגיאה בטעינת נתונים' : 'Error loading data'}</p>
      </div>
    );
  }

  const summary = data.launchpadSummary;
  const profile = data.profile;
  const completedMilestones = data.milestones.filter(m => m.is_completed).length;
  const totalMilestones = data.milestones.length;
  const planProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with User Info */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/30">
              <AvatarImage src={data.community?.avatar_url} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{profile?.full_name || 'Unknown User'}</h1>
              <p className="text-sm text-muted-foreground">{data.email}</p>
            </div>
          </div>
        </div>

        {/* Gamification Stats from Profile */}
        {profile && (
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Star className="h-4 w-4 text-amber-500" />
              {isHebrew ? `שלב ${profile.level || 1}` : `Level ${profile.level || 1}`}
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Zap className="h-4 w-4 text-purple-500" />
              {profile.experience || 0} XP
            </Badge>
            <Badge variant="outline" className="gap-1 px-3 py-1">
              <Sparkles className="h-4 w-4 text-primary" />
              {profile.tokens || 0} {isHebrew ? 'טוקנים' : 'Tokens'}
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-1">
            <User className="h-4 w-4" />
            {isHebrew ? 'סקירה' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1">
            <Brain className="h-4 w-4" />
            {isHebrew ? 'ניתוח AI' : 'AI Analysis'}
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-1">
            <Target className="h-4 w-4" />
            {isHebrew ? 'תוכנית 90 יום' : '90-Day Plan'}
          </TabsTrigger>
          <TabsTrigger value="identity" className="gap-1">
            <Sparkles className="h-4 w-4" />
            {isHebrew ? 'זהות' : 'Identity'}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            {isHebrew ? 'משימות' : 'Tasks'}
          </TabsTrigger>
          <TabsTrigger value="patterns" className="gap-1">
            <Activity className="h-4 w-4" />
            {isHebrew ? 'דפוסים' : 'Patterns'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Journey Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  {isHebrew ? 'סטטוס מסע' : 'Journey Status'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isHebrew ? 'השאלון הושלם' : 'Questionnaire Complete'}</span>
                    <Badge variant={data.launchpadProgress?.launchpad_complete ? 'default' : 'secondary'}>
                      {data.launchpadProgress?.launchpad_complete ? (isHebrew ? 'כן' : 'Yes') : (isHebrew ? 'לא' : 'No')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isHebrew ? 'שלב נוכחי' : 'Current Step'}</span>
                    <span className="font-medium">{data.launchpadProgress?.current_step || 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 90-Day Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {isHebrew ? 'תוכנית 90 יום' : '90-Day Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isHebrew ? 'אבני דרך' : 'Milestones'}</span>
                    <span className="font-medium">{completedMilestones} / {totalMilestones}</span>
                  </div>
                  <Progress value={planProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isHebrew ? 'משימות' : 'Tasks'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{isHebrew ? 'צ\'קליסטים' : 'Checklists'}</span>
                    <span className="font-medium">{data.checklists.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{isHebrew ? 'התחייבויות' : 'Commitments'}</span>
                    <span className="font-medium">{data.commitments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Life Direction */}
          {data.lifeDirection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  {isHebrew ? 'כיוון חיים' : 'Life Direction'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.lifeDirection.content}</p>
                {data.lifeDirection.clarity_score && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{isHebrew ? 'ציון בהירות:' : 'Clarity Score:'}</span>
                    <Badge variant="outline">{data.lifeDirection.clarity_score}%</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4 mt-4">
          {summary ? (
            <>
              {/* AI Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    {isHebrew ? 'סיכום AI' : 'AI Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {summary.ai_summary || summary.summary || JSON.stringify(summary, null, 2)}
                  </p>
                </CardContent>
              </Card>

              {/* Consciousness Scores */}
              {data.launchpadScores && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      {isHebrew ? 'ציוני תודעה' : 'Consciousness Scores'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{data.launchpadScores.consciousness_score || 0}</p>
                        <p className="text-xs text-muted-foreground">{isHebrew ? 'ציון תודעה' : 'Consciousness'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-blue-500">{data.launchpadScores.clarity_score || 0}</p>
                        <p className="text-xs text-muted-foreground">{isHebrew ? 'בהירות' : 'Clarity'}</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold text-green-500">{data.launchpadScores.transformation_readiness || 0}</p>
                        <p className="text-xs text-muted-foreground">{isHebrew ? 'מוכנות לשינוי' : 'Readiness'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Consciousness Analysis from summary_data */}
              {summary.consciousness_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      {isHebrew ? 'ניתוח תודעה' : 'Consciousness Analysis'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summary.consciousness_analysis.score !== undefined && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm">{isHebrew ? 'ציון תודעה:' : 'Consciousness Score:'}</span>
                          <Badge className="text-lg px-3 py-1">{summary.consciousness_analysis.score}</Badge>
                        </div>
                      )}
                      {summary.consciousness_analysis.level && (
                        <div>
                          <span className="text-sm font-medium">{isHebrew ? 'רמה:' : 'Level:'}</span>
                          <p className="text-sm mt-1">{summary.consciousness_analysis.level}</p>
                        </div>
                      )}
                      {summary.consciousness_analysis.analysis && (
                        <div>
                          <span className="text-sm font-medium">{isHebrew ? 'ניתוח:' : 'Analysis:'}</span>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{summary.consciousness_analysis.analysis}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Challenges */}
              {summary.challenges && summary.challenges.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      {isHebrew ? 'אתגרים שזוהו' : 'Identified Challenges'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {summary.challenges.map((challenge, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isHebrew ? 'אין ניתוח AI עדיין' : 'No AI analysis yet'}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 90-Day Plan Tab */}
        <TabsContent value="plan" className="space-y-4 mt-4">
          {data.milestones.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {data.milestones.map((milestone) => (
                <Card key={milestone.id} className={cn(milestone.is_completed && 'border-green-500/50 bg-green-500/5')}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {isHebrew ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
                      </CardTitle>
                      {milestone.is_completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium text-sm mb-1">{milestone.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{milestone.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isHebrew ? 'אין תוכנית 90 יום עדיין' : 'No 90-day plan yet'}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-4 mt-4">
          {summary?.identity_profile ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  {isHebrew ? 'פרופיל זהות' : 'Identity Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(summary.identity_profile).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="text-sm font-medium capitalize mb-1">{key.replace(/_/g, ' ')}</h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof value === 'string' ? value : JSON.stringify(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isHebrew ? 'אין פרופיל זהות עדיין' : 'No identity profile yet'}
              </CardContent>
            </Card>
          )}

          {/* Identity Elements */}
          {data.identityElements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-blue-500" />
                  {isHebrew ? 'אלמנטי זהות' : 'Identity Elements'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.identityElements.map((el) => (
                    <Badge key={el.id} variant="outline" className="text-xs">
                      {el.element_type}: {el.content}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          {/* Checklists */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                {isHebrew ? 'צ\'קליסטים' : 'Checklists'} ({data.checklists.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.checklists.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {data.checklists.map((checklist: any) => (
                      <div key={checklist.id} className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{checklist.title}</h4>
                          <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
                            {checklist.status}
                          </Badge>
                        </div>
                        {checklist.aurora_checklist_items && (
                          <div className="space-y-1">
                            {checklist.aurora_checklist_items.slice(0, 5).map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2 text-xs">
                                <div className={cn(
                                  'w-3 h-3 rounded-full border',
                                  item.is_completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                                )} />
                                <span className={item.is_completed ? 'line-through text-muted-foreground' : ''}>
                                  {item.content}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isHebrew ? 'אין צ\'קליסטים' : 'No checklists'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Commitments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                {isHebrew ? 'התחייבויות' : 'Commitments'} ({data.commitments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.commitments.length > 0 ? (
                <div className="space-y-2">
                  {data.commitments.map((commitment: any) => (
                    <div key={commitment.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="text-sm">{commitment.title}</span>
                      <Badge variant="outline">{commitment.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isHebrew ? 'אין התחייבויות' : 'No commitments'}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Energy Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {isHebrew ? 'דפוסי אנרגיה' : 'Energy Patterns'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.energyPatterns.length > 0 ? (
                  <div className="space-y-2">
                    {data.energyPatterns.map((pattern: any) => (
                      <div key={pattern.id} className="p-2 rounded bg-muted/50">
                        <Badge variant="outline" className="mb-1">{pattern.pattern_type}</Badge>
                        <p className="text-xs">{pattern.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {isHebrew ? 'אין דפוסים' : 'No patterns'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Behavioral Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  {isHebrew ? 'דפוסי התנהגות' : 'Behavioral Patterns'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.behavioralPatterns.length > 0 ? (
                  <div className="space-y-2">
                    {data.behavioralPatterns.map((pattern: any) => (
                      <div key={pattern.id} className="p-2 rounded bg-muted/50">
                        <Badge variant="outline" className="mb-1">{pattern.pattern_type}</Badge>
                        <p className="text-xs">{pattern.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {isHebrew ? 'אין דפוסים' : 'No patterns'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboardView;
