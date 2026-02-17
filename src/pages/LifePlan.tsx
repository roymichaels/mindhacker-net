import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionGate } from '@/hooks/useSubscriptionGate';
import ProGateOverlay from '@/components/subscription/ProGateOverlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  Target, 
  Trophy, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

interface Milestone {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  tasks: string[];
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  tokens_reward: number;
}

interface LifePlanData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  milestones: Milestone[];
}

const LifePlan = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const { user } = useAuth();
  const { canAccessPlan, isLoading: subLoading } = useSubscriptionGate();
  const [plan, setPlan] = useState<LifePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [completingWeek, setCompletingWeek] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLifePlan();
    }
  }, [user]);

  const fetchLifePlan = async () => {
    if (!user) return;

    try {
      // Fetch the most recent active life plan
      const { data: planDataArray, error: planError } = await supabase
        .from('life_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      const planData = planDataArray?.[0] || null;

      if (planError) throw planError;

      if (!planData) {
        setPlan(null);
        setLoading(false);
        return;
      }

      // Fetch milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('life_plan_milestones')
        .select('*')
        .eq('plan_id', planData.id)
        .order('week_number', { ascending: true });

      if (milestonesError) throw milestonesError;

      const milestones: Milestone[] = (milestonesData || []).map(m => ({
        id: m.id,
        week_number: m.week_number,
        title: m.title,
        description: m.description,
        tasks: Array.isArray(m.tasks) ? (m.tasks as string[]) : [],
        is_completed: m.is_completed || false,
        completed_at: m.completed_at,
        xp_reward: m.xp_reward || 50,
        tokens_reward: m.tokens_reward || 10,
      }));

      // Extract title from plan_data if available
      const planDataJson = planData.plan_data as Record<string, unknown> | null;

      setPlan({
        id: planData.id,
        title: (planDataJson?.title as string) || (language === 'he' ? 'תוכנית 90 הימים שלך' : 'Your 90-Day Plan'),
        description: (planDataJson?.description as string) || null,
        status: planData.status,
        start_date: planData.start_date,
        end_date: planData.end_date,
        milestones,
      });

      // Auto-expand current week
      const currentWeek = getCurrentWeek(planData.start_date);
      if (currentWeek) {
        setExpandedWeeks(new Set([currentWeek]));
      }
    } catch (error) {
      console.error('Error fetching life plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentWeek = (startDate: string | null): number | null => {
    if (!startDate) return 1;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
    return Math.min(Math.max(diffWeeks, 1), 12);
  };

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const handleCompleteWeek = async (milestone: Milestone) => {
    if (!user || milestone.is_completed) return;

    setCompletingWeek(milestone.id);

    try {
      const { error } = await supabase
        .from('life_plan_milestones')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', milestone.id);

      if (error) throw error;

      // Update local state
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(m =>
            m.id === milestone.id
              ? { ...m, is_completed: true, completed_at: new Date().toISOString() }
              : m
          ),
        };
      });

      toast.success(
        language === 'he'
          ? `🎉 סיימת את שבוע ${milestone.week_number}! קיבלת ${milestone.xp_reward} XP ו-${milestone.tokens_reward} אסימונים`
          : `🎉 Week ${milestone.week_number} completed! You earned ${milestone.xp_reward} XP and ${milestone.tokens_reward} tokens`
      );
    } catch (error) {
      console.error('Error completing week:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירת ההתקדמות' : 'Error saving progress');
    } finally {
      setCompletingWeek(null);
    }
  };

  const getMonthForWeek = (weekNumber: number): number => {
    return Math.ceil(weekNumber / 4);
  };

  const getMonthName = (monthNumber: number): string => {
    const names = language === 'he'
      ? ['חודש 1: יסודות', 'חודש 2: בנייה', 'חודש 3: תנופה']
      : ['Month 1: Foundations', 'Month 2: Building', 'Month 3: Momentum'];
    return names[monthNumber - 1] || '';
  };

  const getMonthIcon = (monthNumber: number): string => {
    return ['🌱', '🔨', '🚀'][monthNumber - 1] || '📅';
  };

  const calculateProgress = (): number => {
    if (!plan || plan.milestones.length === 0) return 0;
    const completed = plan.milestones.filter(m => m.is_completed).length;
    return Math.round((completed / plan.milestones.length) * 100);
  };

  if (!subLoading && !canAccessPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <ProGateOverlay feature="plan" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="animate-pulse text-muted-foreground">
          {language === 'he' ? 'טוען תוכנית...' : 'Loading plan...'}
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <span className="text-6xl">📋</span>
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'אין תוכנית פעילה' : 'No Active Plan'}
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          {language === 'he'
            ? 'לא נמצאה תוכנית טרנספורמציה פעילה. השלם את ה-Launchpad ליצירת תוכנית אישית.'
            : 'No active transformation plan found. Complete the Launchpad to create your personalized plan.'}
        </p>
        <Button onClick={() => navigate('/launchpad')}>
          {language === 'he' ? 'התחל מסע טרנספורמציה' : 'Start Transformation Journey'}
        </Button>
      </div>
    );
  }

  const progress = calculateProgress();
  const currentWeek = getCurrentWeek(plan.start_date);

  // Group milestones by month
  const milestonesByMonth: Record<number, Milestone[]> = {};
  plan.milestones.forEach(m => {
    const month = getMonthForWeek(m.week_number);
    if (!milestonesByMonth[month]) milestonesByMonth[month] = [];
    milestonesByMonth[month].push(m);
  });

  return (
    <div className="min-h-screen bg-background pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-bold flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
                {language === 'he' ? 'תוכנית 90 הימים' : '90-Day Plan'}
              </h1>
            </div>
            <div className="w-9" />
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {language === 'he' 
                  ? `שבוע ${currentWeek}/12`
                  : `Week ${currentWeek}/12`}
              </span>
              <span>
                {plan.milestones.filter(m => m.is_completed).length}/{plan.milestones.length} {language === 'he' ? 'הושלמו' : 'completed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {[1, 2, 3].map(month => {
          const monthMilestones = milestonesByMonth[month] || [];
          if (monthMilestones.length === 0) return null;

          const monthCompleted = monthMilestones.filter(m => m.is_completed).length;
          const monthTotal = monthMilestones.length;

          return (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: month * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{getMonthIcon(month)}</span>
                      {getMonthName(month)}
                    </span>
                    <Badge variant={monthCompleted === monthTotal ? 'default' : 'secondary'}>
                      {monthCompleted}/{monthTotal}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {monthMilestones.map(milestone => {
                      const isExpanded = expandedWeeks.has(milestone.week_number);
                      const isCurrent = milestone.week_number === currentWeek;
                      const isCompleting = completingWeek === milestone.id;

                      return (
                        <div key={milestone.id} className="relative">
                          {/* Week header */}
                          <button
                            onClick={() => toggleWeek(milestone.week_number)}
                            className={`w-full p-4 flex items-center justify-between text-start hover:bg-muted/50 transition-colors ${
                              isCurrent ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                milestone.is_completed 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {milestone.is_completed ? '✓' : milestone.week_number}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {language === 'he' ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
                                  {isCurrent && !milestone.is_completed && (
                                    <Badge variant="outline" className="text-xs">
                                      {language === 'he' ? 'נוכחי' : 'Current'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {milestone.title}
                                </p>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-4 border-t bg-muted/30">
                                  {milestone.description && (
                                    <p className="text-sm text-muted-foreground pt-4">
                                      {milestone.description}
                                    </p>
                                  )}

                                  {/* Tasks */}
                                  {milestone.tasks.length > 0 && (
                                    <div className="space-y-2 pt-2">
                                      <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        {language === 'he' ? 'משימות' : 'Tasks'}
                                      </h4>
                                      <ul className="space-y-2">
                                        {milestone.tasks.map((task, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-sm">
                                            <Checkbox 
                                              checked={milestone.is_completed} 
                                              disabled 
                                              className="mt-0.5"
                                            />
                                            <span className={milestone.is_completed ? 'line-through text-muted-foreground' : ''}>
                                              {task}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Rewards */}
                                  <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-1 text-sm">
                                      <Zap className="w-4 h-4 text-amber-500" />
                                      <span>{milestone.xp_reward} XP</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Coins className="w-4 h-4 text-yellow-500" />
                                      <span>{milestone.tokens_reward}</span>
                                    </div>
                                  </div>

                                  {/* Complete button */}
                                  {!milestone.is_completed && (
                                    <Button
                                      onClick={() => handleCompleteWeek(milestone)}
                                      disabled={isCompleting}
                                      className="w-full mt-2"
                                    >
                                      {isCompleting ? (
                                        <span className="animate-pulse">
                                          {language === 'he' ? 'שומר...' : 'Saving...'}
                                        </span>
                                      ) : (
                                        <>
                                          <Trophy className="w-4 h-4 mr-2" />
                                          {language === 'he' ? 'סיימתי את השבוע!' : 'Complete Week!'}
                                        </>
                                      )}
                                    </Button>
                                  )}

                                  {milestone.is_completed && milestone.completed_at && (
                                    <div className="text-xs text-green-600 flex items-center gap-1 pt-2">
                                      <Calendar className="w-3 h-3" />
                                      {language === 'he' ? 'הושלם ב-' : 'Completed on '}
                                      {new Date(milestone.completed_at).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LifePlan;
