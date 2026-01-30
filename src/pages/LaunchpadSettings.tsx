import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useLaunchpadData } from '@/hooks/useLaunchpadData';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, ArrowLeft, Save, RefreshCw, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { translateProfileValue, translateFieldLabel } from '@/utils/profileTranslations';
import { AIAnalysisDisplay } from '@/components/launchpad/AIAnalysisDisplay';

// Import step components
import { WelcomeStep } from '@/components/launchpad/steps/WelcomeStep';
import { PersonalProfileStep } from '@/components/launchpad/steps/PersonalProfileStep';
import { FocusAreasStep } from '@/components/launchpad/steps/FocusAreasStep';
import { FirstWeekStep } from '@/components/launchpad/steps/FirstWeekStep';

const TABS = [
  { id: 'welcome', label: 'שאלון התחלתי', labelEn: 'Welcome Quiz', icon: '🎯' },
  { id: 'profile', label: 'פרופיל אישי', labelEn: 'Personal Profile', icon: '👤' },
  { id: 'focus', label: 'תחומי פוקוס', labelEn: 'Focus Areas', icon: '🎪' },
  { id: 'transformation', label: 'תוכנית טרנספורמציה', labelEn: 'Transformation Plan', icon: '🚀' },
  { id: 'analysis', label: 'ניתוח AI', labelEn: 'AI Analysis', icon: '🧠' },
];

export default function LaunchpadSettings() {
  const { language, isRTL } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: launchpadData, isLoading, updateData, isUpdating } = useLaunchpadData();
  
  const [activeTab, setActiveTab] = useState('welcome');
  const [hasChanges, setHasChanges] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [analysisRefreshKey, setAnalysisRefreshKey] = useState(0);

  // Track changes
  const [localData, setLocalData] = useState<{
    welcomeQuiz?: Record<string, string | string[]>;
    personalProfile?: Record<string, unknown>;
    focusAreas?: string[];
    firstWeek?: Record<string, unknown>;
  }>({});

  // Initialize local data when launchpad data loads
  useEffect(() => {
    if (launchpadData) {
      setLocalData({
        welcomeQuiz: launchpadData.welcomeQuiz,
        personalProfile: launchpadData.personalProfile,
        focusAreas: launchpadData.focusAreas,
        firstWeek: launchpadData.firstWeek,
      });
    }
  }, [launchpadData]);

  const handleSave = async () => {
    updateData(localData);
    setHasChanges(false);
    toast.success(language === 'he' ? 'השינויים נשמרו בהצלחה' : 'Changes saved successfully');
  };

  const handleRegenerate = async () => {
    if (!user?.id) return;
    
    setIsRegenerating(true);
    try {
      // Call the edge function to regenerate the summary
      const { error } = await supabase.functions.invoke('generate-launchpad-summary', {
        body: { userId: user.id, regenerate: true },
      });

      if (error) throw error;

      // Force immediate refetch so UI doesn't rely on realtime latency
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['launchpad-data', user.id],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['launchpad-summary', user.id],
          refetchType: 'active',
        }),
        queryClient.invalidateQueries({
          queryKey: ['life-plan', user.id],
          refetchType: 'active',
        }),
      ]);

      // Also refresh local non-react-query summary component
      setAnalysisRefreshKey((k) => k + 1);

      toast.success(
        language === 'he' 
          ? 'הסיכום וההמלצות חושבו מחדש!' 
          : 'Summary and recommendations regenerated!'
      );
    } catch (error) {
      console.error('Error regenerating summary:', error);
      toast.error(
        language === 'he' 
          ? 'שגיאה בחישוב מחדש' 
          : 'Error regenerating summary'
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <BackArrow className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">
                {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === 'he' ? 'צפה ועדכן את המידע שלך' : 'View and update your information'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
                ) : (
                  <Save className="h-4 w-4 me-2" />
                )}
                {language === 'he' ? 'שמור' : 'Save'}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                <RefreshCw className="h-4 w-4 me-2" />
              )}
              {language === 'he' ? 'חשב מחדש' : 'Regenerate'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-4xl mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 px-2">
                <span className="hidden sm:inline">{tab.icon}</span>
                <span className="text-[10px] sm:text-xs">
                  {language === 'he' ? tab.label : tab.labelEn}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Welcome Quiz Tab */}
          <TabsContent value="welcome">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎯</span>
                  {language === 'he' ? 'שאלון התחלתי' : 'Welcome Quiz'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <WelcomeQuizDisplay 
                    data={localData.welcomeQuiz || {}}
                    onChange={(data) => {
                      setLocalData(prev => ({ ...prev, welcomeQuiz: data }));
                      setHasChanges(true);
                    }}
                    language={language}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>👤</span>
                  {language === 'he' ? 'פרופיל אישי' : 'Personal Profile'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <PersonalProfileDisplay 
                    data={localData.personalProfile || {}}
                    onChange={(data) => {
                      setLocalData(prev => ({ ...prev, personalProfile: data }));
                      setHasChanges(true);
                    }}
                    language={language}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Focus Areas Tab */}
          <TabsContent value="focus">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🎪</span>
                  {language === 'he' ? 'תחומי פוקוס' : 'Focus Areas'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FocusAreasDisplay 
                  data={localData.focusAreas || []}
                  onChange={(areas) => {
                    setLocalData(prev => ({ ...prev, focusAreas: areas }));
                    setHasChanges(true);
                  }}
                  language={language}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transformation Plan Tab */}
          <TabsContent value="transformation">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🚀</span>
                  {language === 'he' ? 'תוכנית טרנספורמציה' : 'Transformation Plan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <TransformationPlanDisplay 
                    milestones={launchpadData?.milestones || []}
                    language={language}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🧠</span>
                  {language === 'he' ? 'ניתוח AI' : 'AI Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <AIAnalysisDisplay language={language} refreshKey={analysisRefreshKey} />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Display components for each section

interface WelcomeQuizDisplayProps {
  data: Record<string, string | string[]>;
  onChange: (data: Record<string, string | string[]>) => void;
  language: string;
}

function WelcomeQuizDisplay({ data, onChange, language }: WelcomeQuizDisplayProps) {
  const entries = Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '');
  
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <span className="text-5xl">🎯</span>
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'השאלון ההתחלתי לא הושלם או לא נשמר בנפרד. הנתונים שלך נשמרים בפרופיל האישי.' 
            : 'The welcome quiz was not saved separately. Your data is stored in the personal profile.'}
        </p>
      </div>
    );
  }

  // If there's just an intention (plain text), display it nicely
  if (entries.length === 1 && entries[0][0] === 'intention' && typeof entries[0][1] === 'string') {
    return (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            ✨ {language === 'he' ? 'הכוונה שלי למסע הזה' : 'My Intention for This Journey'}
          </p>
          <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">{entries[0][1]}</p>
        </div>
      </div>
    );
  }

  // Map field keys to Hebrew labels
  const fieldLabels: Record<string, string> = {
    life_areas: language === 'he' ? 'תחומי חיים' : 'Life Areas',
    career_situation: language === 'he' ? 'מצב קריירה' : 'Career Situation',
    relationship_status: language === 'he' ? 'מצב זוגי' : 'Relationship Status',
    health_focus: language === 'he' ? 'מיקוד בריאותי' : 'Health Focus',
    financial_situation: language === 'he' ? 'מצב פיננסי' : 'Financial Situation',
    emotional_state: language === 'he' ? 'מצב רגשי' : 'Emotional State',
    biggest_challenge: language === 'he' ? 'האתגר הגדול ביותר' : 'Biggest Challenge',
    desired_outcome: language === 'he' ? 'התוצאה הרצויה' : 'Desired Outcome',
    intention: language === 'he' ? 'הכוונה שלי' : 'My Intention',
  };

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key} className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {fieldLabels[key] || key}
          </p>
          {Array.isArray(value) ? (
            <div className="flex flex-wrap gap-2">
              {value.map((v, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {v}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-foreground whitespace-pre-wrap">{value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

interface PersonalProfileDisplayProps {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  language: string;
}

function PersonalProfileDisplay({ data, onChange, language }: PersonalProfileDisplayProps) {
  const entries = Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== '');
  
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        {language === 'he' ? 'אין נתונים עדיין' : 'No data yet'}
      </p>
    );
  }

  // Group by categories
  const categories: Record<string, [string, unknown][]> = {
    basics: [],
    lifestyle: [],
    behavior: [],
    other: [],
  };

  entries.forEach(([key, value]) => {
    if (['age', 'gender', 'name', 'relationship_status', 'living_situation'].includes(key)) {
      categories.basics.push([key, value]);
    } else if (['sleep_hours', 'exercise_frequency', 'diet_type', 'hobbies'].includes(key)) {
      categories.lifestyle.push([key, value]);
    } else if (['stress_level', 'decision_making', 'conflict_handling', 'problem_solving'].includes(key)) {
      categories.behavior.push([key, value]);
    } else {
      categories.other.push([key, value]);
    }
  });

  const renderCategory = (title: string, items: [string, unknown][]) => {
    if (items.length === 0) return null;
    
    return (
      <div key={title} className="space-y-3">
        <h4 className="font-medium text-muted-foreground">{title}</h4>
        <div className="grid gap-3">
          {items.map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs font-medium text-muted-foreground mb-1">
                {translateFieldLabel(key, language)}
              </p>
              {Array.isArray(value) ? (
                <div className="flex flex-wrap gap-1">
                  {value.map((v, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm">
                      {translateProfileValue(String(v), language)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-foreground">
                  {translateProfileValue(String(value), language)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderCategory(language === 'he' ? 'פרטים בסיסיים' : 'Basic Info', categories.basics)}
      {renderCategory(language === 'he' ? 'אורח חיים' : 'Lifestyle', categories.lifestyle)}
      {renderCategory(language === 'he' ? 'דפוסי התנהגות' : 'Behavior Patterns', categories.behavior)}
      {renderCategory(language === 'he' ? 'אחר' : 'Other', categories.other)}
    </div>
  );
}

interface FocusAreasDisplayProps {
  data: string[];
  onChange: (areas: string[]) => void;
  language: string;
}

const FOCUS_AREAS = [
  { id: 'health', icon: '💪', label: 'בריאות וגוף', labelEn: 'Health & Body' },
  { id: 'money', icon: '💰', label: 'כסף ושפע', labelEn: 'Money & Abundance' },
  { id: 'mind', icon: '🧠', label: 'תודעה ומיינד', labelEn: 'Mind & Consciousness' },
  { id: 'relationships', icon: '❤️', label: 'זוגיות ומערכות יחסים', labelEn: 'Relationships' },
  { id: 'career', icon: '💼', label: 'קריירה ועבודה', labelEn: 'Career & Work' },
  { id: 'creativity', icon: '🎨', label: 'יצירה והבעה', labelEn: 'Creativity & Expression' },
  { id: 'social', icon: '👥', label: 'חברה וקהילה', labelEn: 'Social & Community' },
  { id: 'spirituality', icon: '✨', label: 'רוחניות ומשמעות', labelEn: 'Spirituality & Meaning' },
];

function FocusAreasDisplay({ data, onChange, language }: FocusAreasDisplayProps) {
  const toggleArea = (id: string) => {
    const newAreas = data.includes(id)
      ? data.filter(a => a !== id)
      : data.length >= 3
        ? [...data.slice(1), id]
        : [...data, id];
    onChange(newAreas);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {language === 'he' 
          ? `${data.length}/3 תחומים נבחרו. לחץ כדי לשנות.`
          : `${data.length}/3 areas selected. Click to change.`
        }
      </p>
      <div className="grid grid-cols-2 gap-3">
        {FOCUS_AREAS.map((area) => {
          const isSelected = data.includes(area.id);
          const selectionIndex = data.indexOf(area.id);
          
          return (
            <button
              key={area.id}
              onClick={() => toggleArea(area.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all text-start",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-muted-foreground/20 hover:border-muted-foreground/40"
              )}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {selectionIndex + 1}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <span className="text-2xl">{area.icon}</span>
                <span className={cn(
                  "font-medium text-sm",
                  isSelected && "text-primary"
                )}>
                  {language === 'he' ? area.label : area.labelEn}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TransformationPlanDisplayProps {
  milestones: Array<{
    id: string;
    week_number: number;
    month_number: number;
    title: string;
    description: string;
    goal: string;
    tasks: string[];
    challenge: string;
    focus_area: string;
    is_completed: boolean;
    xp_reward: number;
    tokens_reward: number;
  }>;
  language: string;
}

function TransformationPlanDisplay({ milestones, language }: TransformationPlanDisplayProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <span className="text-5xl">🚀</span>
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'אין תוכנית טרנספורמציה עדיין. לחץ על "חשב מחדש" למעלה ליצירת תוכנית.' 
            : 'No transformation plan yet. Click "Regenerate" above to create a plan.'}
        </p>
      </div>
    );
  }

  // Group by month
  const monthsMap = milestones.reduce((acc, m) => {
    const month = m.month_number || 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(m);
    return acc;
  }, {} as Record<number, typeof milestones>);

  const months = Object.keys(monthsMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {months.map((monthNum) => (
        <div key={monthNum} className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {monthNum}
            </span>
            {language === 'he' ? `חודש ${monthNum}` : `Month ${monthNum}`}
          </h3>
          
          <div className="space-y-3">
            {monthsMap[monthNum].map((milestone) => (
              <div 
                key={milestone.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  milestone.is_completed 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-muted/50 border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {language === 'he' ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
                      </span>
                      {milestone.is_completed && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">
                          ✓ {language === 'he' ? 'הושלם' : 'Completed'}
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-base">{milestone.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      +{milestone.xp_reward} XP
                    </div>
                    <div className="text-xs text-amber-500">
                      +{milestone.tokens_reward} 🪙
                    </div>
                  </div>
                </div>

                {milestone.goal && (
                  <div className="mt-3 p-2 rounded-lg bg-background/50">
                    <span className="text-xs text-muted-foreground">{language === 'he' ? 'יעד:' : 'Goal:'}</span>
                    <span className="text-sm ms-2 font-medium">{milestone.goal}</span>
                  </div>
                )}

                {milestone.tasks && milestone.tasks.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">{language === 'he' ? 'משימות:' : 'Tasks:'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {milestone.tasks.map((task, i) => (
                        <span 
                          key={i}
                          className="text-xs px-2 py-1 rounded-md bg-muted border border-border"
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {milestone.challenge && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs text-amber-600">⚡ {language === 'he' ? 'אתגר:' : 'Challenge:'}</span>
                    <span className="text-sm ms-2">{milestone.challenge}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
