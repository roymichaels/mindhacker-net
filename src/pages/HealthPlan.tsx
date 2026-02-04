import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { 
  Heart, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Trophy,
  Calendar,
  Rocket,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface HealthMilestone {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  focus_area: string | null;
  tasks: any;
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number | null;
}

interface HealthPlan {
  id: string;
  title: string;
  description: string | null;
  status: string;
  current_week: number | null;
  total_weeks: number | null;
  start_date: string | null;
  end_date: string | null;
  milestones: HealthMilestone[];
}

const HealthPlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useTranslation();
  const [plan, setPlan] = useState<HealthPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(1);

  useSEO({
    title: language === 'he' ? 'תוכנית בריאות 90 יום | MindOS' : '90-Day Health Plan | MindOS',
    description: language === 'he' 
      ? 'התוכנית האישית שלך לבריאות מיטבית'
      : 'Your personal plan for optimal health',
    url: `${window.location.origin}/health/plan`,
  });

  useEffect(() => {
    const fetchHealthPlan = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch health plans (focus_area = 'health' or from health journey)
        const { data: plans, error: planError } = await supabase
          .from('life_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (planError) throw planError;

        if (plans && plans.length > 0) {
          const currentPlan = plans[0];
          
          // Fetch milestones for this plan
          const { data: milestones, error: milestoneError } = await supabase
            .from('life_plan_milestones')
            .select('*')
            .eq('plan_id', currentPlan.id)
            .order('week_number', { ascending: true });

          if (milestoneError) throw milestoneError;

          // Filter for health-related milestones
          const healthMilestones = (milestones || []).filter(m => 
            m.focus_area === 'health' || 
            m.focus_area === 'physical' || 
            m.focus_area === 'nutrition' || 
            m.focus_area === 'sleep' ||
            m.focus_area === 'stress'
          );

          // Cast plan_data to get title/description if stored there
          const planData = currentPlan.plan_data as Record<string, any> || {};
          
          setPlan({
            id: currentPlan.id,
            title: planData.title || (language === 'he' ? 'תוכנית בריאות 90 יום' : '90-Day Health Plan'),
            description: planData.description || null,
            status: currentPlan.status || 'active',
            current_week: planData.current_week || 1,
            total_weeks: planData.total_weeks || 12,
            start_date: currentPlan.start_date,
            end_date: currentPlan.end_date,
            milestones: healthMilestones.length > 0 ? healthMilestones : milestones || []
          });
        }
      } catch (error) {
        console.error('Error fetching health plan:', error);
        toast.error(language === 'he' ? 'שגיאה בטעינת התוכנית' : 'Error loading plan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthPlan();
  }, [user, language]);

  const completedMilestones = plan?.milestones.filter(m => m.is_completed).length || 0;
  const totalMilestones = plan?.milestones.length || 12;
  const progressPercentage = (completedMilestones / totalMilestones) * 100;

  const getMonthMilestones = (month: number) => {
    const startWeek = (month - 1) * 4 + 1;
    const endWeek = month * 4;
    return plan?.milestones.filter(m => m.week_number >= startWeek && m.week_number <= endWeek) || [];
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('life_plan_milestones')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', milestoneId);

      if (error) throw error;

      // Update local state
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map(m => 
            m.id === milestoneId 
              ? { ...m, is_completed: true, completed_at: new Date().toISOString() }
              : m
          )
        };
      });

      toast.success(language === 'he' ? 'כל הכבוד! השלמת את השבוע' : 'Great job! Week completed');
    } catch (error) {
      console.error('Error completing milestone:', error);
      toast.error(language === 'he' ? 'שגיאה בעדכון' : 'Error updating');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!plan) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8" dir={isRTL ? "rtl" : "ltr"}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center py-16"
          >
            <div className="p-4 bg-red-600/20 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">
              {language === 'he' ? 'עדיין אין לך תוכנית בריאות' : 'You don\'t have a health plan yet'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'he' 
                ? 'התחל את מסע הבריאות כדי ליצור תוכנית מותאמת אישית ל-90 יום'
                : 'Start the health journey to create a personalized 90-day plan'}
            </p>
            <Button
              onClick={() => navigate('/health/journey')}
              className="bg-gradient-to-r from-red-600 to-red-500"
            >
              <Rocket className="w-4 h-4 me-2" />
              {language === 'he' ? 'התחל מסע בריאות' : 'Start Health Journey'}
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideRightPanel>
      <div className="p-4 md:p-8 space-y-6 pb-24" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/health')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <Heart className="w-6 h-6 fill-red-400" />
                {language === 'he' ? 'תוכנית 90 יום' : '90-Day Health Plan'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {plan.title}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-red-950/50 to-gray-900/50 border-red-800/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {language === 'he' ? 'ההתקדמות שלך' : 'Your Progress'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {completedMilestones}/{totalMilestones} {language === 'he' ? 'שבועות הושלמו' : 'weeks completed'}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-3xl font-bold text-red-400">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-red-950 [&>div]:bg-gradient-to-r [&>div]:from-red-600 [&>div]:to-red-400" 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Month Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2"
        >
          {[1, 2, 3].map((month) => (
            <Button
              key={month}
              variant={activeMonth === month ? "default" : "outline"}
              onClick={() => setActiveMonth(month)}
              className={activeMonth === month 
                ? "bg-red-600 hover:bg-red-500 flex-1" 
                : "border-red-800/50 hover:bg-red-900/30 flex-1"}
            >
              <Calendar className="w-4 h-4 me-2" />
              {language === 'he' ? `חודש ${month}` : `Month ${month}`}
            </Button>
          ))}
        </motion.div>

        {/* Milestones Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-4"
        >
          {getMonthMilestones(activeMonth).length > 0 ? (
            getMonthMilestones(activeMonth).map((milestone, idx) => (
              <Card 
                key={milestone.id}
                className={`border transition-all ${
                  milestone.is_completed 
                    ? 'bg-green-950/20 border-green-800/30' 
                    : 'bg-gray-900/50 border-red-800/30 hover:border-red-600/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      milestone.is_completed 
                        ? 'bg-green-600/20' 
                        : 'bg-red-600/20'
                    }`}>
                      {milestone.is_completed 
                        ? <CheckCircle2 className="w-6 h-6 text-green-400" />
                        : <Circle className="w-6 h-6 text-red-400" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {language === 'he' ? `שבוע ${milestone.week_number}` : `Week ${milestone.week_number}`}
                        </h4>
                        {milestone.xp_reward && (
                          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">
                            +{milestone.xp_reward} XP
                          </span>
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-foreground mb-1">
                        {milestone.title}
                      </h5>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      )}
                      {milestone.focus_area && (
                        <span className="inline-block mt-2 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {milestone.focus_area}
                        </span>
                      )}
                      {!milestone.is_completed && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteMilestone(milestone.id)}
                          className="mt-3 bg-red-600 hover:bg-red-500"
                        >
                          <CheckCircle2 className="w-4 h-4 me-2" />
                          {language === 'he' ? 'סמן כהושלם' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-red-400" />
              <p>
                {language === 'he' 
                  ? 'אין אבני דרך לחודש זה עדיין' 
                  : 'No milestones for this month yet'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default HealthPlan;
