import { useNavigate } from 'react-router-dom';
import { AlertCircle, Sparkles, Target, CheckCircle2, Brain, ArrowRight, Rocket, MessageCircle, FolderKanban, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { useLaunchpadProgress } from '@/hooks/useLaunchpadProgress';
import { useProactiveAurora } from '@/hooks/aurora/useProactiveAurora';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface NextActionBannerProps {
  onOpenHypnosis?: () => void;
  onOpenChat?: () => void;
}

export function NextActionBanner({ onOpenHypnosis, onOpenChat }: NextActionBannerProps) {
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboard = useUnifiedDashboard();
  const { isLaunchpadComplete, completionPercentage } = useLaunchpadProgress();
  const { habits, completedCount, totalCount } = useTodaysHabits();
  const { currentItem, hasPendingItems, dismissItem, markItemClicked } = useProactiveAurora();
  
  const today = format(new Date(), 'yyyy-MM-dd');

  // Check if user did hypnosis today
  const { data: didHypnosisToday } = useQuery({
    queryKey: ['hypnosis-today', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return false;
      const { count } = await supabase
        .from('hypnosis_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);
      return (count || 0) > 0;
    },
    enabled: !!user?.id,
  });

  // Check overdue tasks
  const { data: overdueTasks = 0 } = useQuery({
    queryKey: ['overdue-tasks', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count } = await supabase
        .from('aurora_checklist_items')
        .select('id, aurora_checklists!inner(user_id)', { count: 'exact', head: true })
        .eq('aurora_checklists.user_id', user.id)
        .eq('is_completed', false)
        .lt('due_date', today);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Check stalled projects (no update in 7+ days)
  const { data: stalledProjects = 0 } = useQuery({
    queryKey: ['stalled-projects', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('user_projects')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lt('updated_at', sevenDaysAgo);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Priority-based action determination
  const getNextAction = () => {
    // Priority 0: Consciousness journey not complete (required base)
    if (!isLaunchpadComplete) {
      return {
        id: 'consciousness_journey',
        icon: Rocket,
        iconColor: 'text-purple-500',
        bgGradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
        borderColor: 'border-purple-500/30',
        title: language === 'he' 
          ? 'השלם את מסע התודעה' 
          : 'Complete the Consciousness Journey',
        subtitle: language === 'he' 
          ? `${completionPercentage}% הושלמו - זה הבסיס להכל`
          : `${completionPercentage}% complete - this is the foundation for everything`,
        action: () => navigate('/launchpad'),
        actionLabel: language === 'he' ? 'המשך במסע' : 'Continue Journey',
      };
    }

    // Priority 1: Aurora has a proactive coaching message
    if (hasPendingItems && currentItem) {
      return {
        id: 'proactive_coaching',
        icon: MessageCircle,
        iconColor: 'text-primary',
        bgGradient: 'from-primary/20 via-primary/10 to-transparent',
        borderColor: 'border-primary/30',
        title: currentItem.title,
        subtitle: currentItem.body,
        action: () => {
          markItemClicked(currentItem.id);
          navigate('/aurora');
        },
        actionLabel: language === 'he' ? 'פתח את אורורה' : 'Open Aurora',
        dismissable: true,
        onDismiss: () => dismissItem(currentItem.id),
      };
    }

    // Priority 2: Overdue tasks
    if (overdueTasks > 0) {
      return {
        id: 'overdue',
        icon: AlertCircle,
        iconColor: 'text-red-500',
        bgGradient: 'from-red-500/20 via-red-500/10 to-transparent',
        borderColor: 'border-red-500/30',
        title: language === 'he' 
          ? `יש לך ${overdueTasks} משימות באיחור` 
          : `You have ${overdueTasks} overdue tasks`,
        subtitle: language === 'he' 
          ? 'עדיף לטפל בהן לפני שממשיכים הלאה'
          : 'Better handle these before moving forward',
        action: () => navigate('/missions'),
        actionLabel: language === 'he' ? 'צפה במשימות' : 'View Tasks',
      };
    }

    // Priority 3: Stalled projects
    if (stalledProjects > 0) {
      return {
        id: 'stalled_project',
        icon: FolderKanban,
        iconColor: 'text-amber-500',
        bgGradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
        borderColor: 'border-amber-500/30',
        title: language === 'he'
          ? `${stalledProjects} פרויקטים לא עודכנו מעל שבוע`
          : `${stalledProjects} projects stalled for 7+ days`,
        subtitle: language === 'he'
          ? 'עדכן את ההתקדמות שלך כדי להישאר על המסלול'
          : 'Update your progress to stay on track',
        action: () => navigate('/projects'),
        actionLabel: language === 'he' ? 'עדכן פרויקטים' : 'Update Projects',
      };
    }

    // Priority 4: Incomplete habits
    if (totalCount > 0 && completedCount < totalCount) {
      return {
        id: 'habits',
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        bgGradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
        borderColor: 'border-emerald-500/30',
        title: language === 'he'
          ? `השלם את ההרגלים היומיים (${completedCount}/${totalCount})`
          : `Complete your daily habits (${completedCount}/${totalCount})`,
        subtitle: language === 'he'
          ? 'כל הרגל קטן בונה עתיד גדול'
          : 'Every small habit builds a big future',
        action: null, // Handled inline
        actionLabel: language === 'he' ? 'השלם עכשיו' : 'Complete Now',
        scrollTo: 'habits-card',
      };
    }

    // Priority 3: No hypnosis today
    if (!didHypnosisToday) {
      return {
        id: 'hypnosis',
        icon: Brain,
        iconColor: 'text-purple-500',
        bgGradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
        borderColor: 'border-purple-500/30',
        title: language === 'he'
          ? 'היפנוזה יומית ממתינה לך'
          : 'Your daily hypnosis awaits',
        subtitle: language === 'he'
          ? 'שמור על הרצף ושפר את התת-מודע'
          : 'Maintain your streak and improve your subconscious',
        action: onOpenHypnosis,
        actionLabel: language === 'he' ? 'התחל היפנוזה' : 'Start Hypnosis',
      };
    }

    // Priority 4: Current milestone
    if (dashboard.activeFocusPlan) {
      return {
        id: 'milestone',
        icon: Target,
        iconColor: 'text-amber-500',
        bgGradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
        borderColor: 'border-amber-500/30',
        title: dashboard.activeFocusPlan.title,
        subtitle: language === 'he'
          ? `נותרו ${dashboard.activeFocusPlan.daysRemaining} ימים`
          : `${dashboard.activeFocusPlan.daysRemaining} days remaining`,
        action: () => navigate('/life-plan'),
        actionLabel: language === 'he' ? 'צפה בתוכנית' : 'View Plan',
      };
    }

    // Fallback: Chat with Aurora
    return {
      id: 'chat',
      icon: Sparkles,
      iconColor: 'text-primary',
      bgGradient: 'from-primary/20 via-primary/10 to-transparent',
      borderColor: 'border-primary/30',
      title: language === 'he'
        ? 'הכל מסודר! מה הלאה?'
        : "All set! What's next?",
      subtitle: language === 'he'
        ? 'שוחח עם אורורה לתכנון הצעד הבא'
        : 'Chat with Aurora to plan your next step',
      action: onOpenChat || (() => navigate('/aurora')),
      actionLabel: language === 'he' ? 'שוחח עם אורורה' : 'Chat with Aurora',
    };
  };

  const nextAction = getNextAction();
  const Icon = nextAction.icon;

  const handleClick = () => {
    if (nextAction.scrollTo) {
      document.getElementById(nextAction.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
    } else if (nextAction.action) {
      nextAction.action();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden border",
          nextAction.borderColor,
          "bg-gradient-to-br",
          nextAction.bgGradient
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Animated glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        
        <CardContent className="p-4 sm:p-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              {/* Icon */}
              <motion.div 
                className={cn(
                  "flex-shrink-0 p-2.5 sm:p-3 rounded-xl",
                  "bg-background/80 backdrop-blur-sm border border-border/50"
                )}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", nextAction.iconColor)} />
              </motion.div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                  {language === 'he' ? 'הפעולה הבאה שלך' : 'Your Next Action'}
                </p>
                <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 sm:line-clamp-1">
                  {nextAction.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {nextAction.subtitle}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              {(nextAction as any).dismissable && (nextAction as any).onDismiss && (
                <Button
                  onClick={(e) => { e.stopPropagation(); (nextAction as any).onDismiss(); }}
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button 
                onClick={handleClick}
                size="sm"
                className="flex-1 sm:flex-initial flex-shrink-0 gap-1.5"
              >
                {nextAction.actionLabel}
                <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
