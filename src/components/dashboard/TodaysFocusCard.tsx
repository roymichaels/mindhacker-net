import { Target, Clock, Flame, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { useUnifiedDashboard } from '@/hooks/useUnifiedDashboard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TodaysFocusCardProps {
  pendingTasksCount?: number;
  onOpenHypnosis?: () => void;
  onOpenChat?: () => void;
}

export function TodaysFocusCard({ 
  pendingTasksCount = 0,
  onOpenHypnosis,
  onOpenChat,
}: TodaysFocusCardProps) {
  const { t, isRTL } = useTranslation();
  const navigate = useNavigate();
  const dashboard = useUnifiedDashboard();
  
  const { activeFocusPlan, streak } = dashboard;
  
  // Calculate focus progress
  const focusProgress = activeFocusPlan 
    ? Math.round(((activeFocusPlan.durationDays - activeFocusPlan.daysRemaining) / activeFocusPlan.durationDays) * 100)
    : 0;

  // Determine what to show based on user state
  const getFocusContent = () => {
    // Priority 1: Active focus plan
    if (activeFocusPlan) {
      return {
        icon: Target,
        iconColor: 'text-amber-500',
        bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        title: activeFocusPlan.title,
        subtitle: t('dashboard.todaysFocus.daysLeft').replace('{days}', String(activeFocusPlan.daysRemaining)),
        progress: focusProgress,
        action: () => navigate('/life-plan'),
        actionLabel: t('dashboard.todaysFocus.viewPlan'),
      };
    }

    // Priority 2: Pending tasks
    if (pendingTasksCount > 0) {
      return {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        bgGradient: 'from-green-500/10 via-emerald-500/5 to-transparent',
        title: t('dashboard.todaysFocus.tasksTitle').replace('{count}', String(pendingTasksCount)),
        subtitle: t('dashboard.todaysFocus.tasksSubtitle'),
        progress: null,
        action: null,
        actionLabel: null,
      };
    }

    // Priority 3: Active streak
    if (streak > 0) {
      return {
        icon: Flame,
        iconColor: 'text-orange-500',
        bgGradient: 'from-orange-500/10 via-red-500/5 to-transparent',
        title: t('dashboard.todaysFocus.streakTitle').replace('{days}', String(streak)),
        subtitle: t('dashboard.todaysFocus.streakSubtitle'),
        progress: null,
        action: onOpenHypnosis,
        actionLabel: t('dashboard.todaysFocus.continueStreak'),
      };
    }

    // Default: Idle state - suggest action
    return {
      icon: Sparkles,
      iconColor: 'text-primary',
      bgGradient: 'from-primary/10 via-accent/5 to-transparent',
      title: t('dashboard.todaysFocus.idleTitle'),
      subtitle: t('dashboard.todaysFocus.idleSubtitle'),
      progress: null,
      action: onOpenChat,
      actionLabel: t('dashboard.todaysFocus.startSession'),
    };
  };

  const content = getFocusContent();
  const Icon = content.icon;

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-primary/20",
        "bg-gradient-to-br",
        content.bgGradient
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative glow */}
      <div className="absolute top-0 end-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 p-2.5 rounded-xl",
            "bg-background/80 backdrop-blur-sm border border-border/50"
          )}>
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", content.iconColor)} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                  {t('dashboard.todaysFocus.title')}
                </p>
                <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                  {content.title}
                </h3>
              </div>
              
              {/* Streak badge */}
              {streak > 0 && !activeFocusPlan && (
                <Badge variant="secondary" className="gap-1 flex-shrink-0">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {streak}
                </Badge>
              )}
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              {content.subtitle}
            </p>
            
            {/* Progress bar for focus plan */}
            {content.progress !== null && (
              <div className="space-y-1">
                <Progress value={content.progress} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.progress}% {t('dashboard.todaysFocus.complete')}</span>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {activeFocusPlan?.daysRemaining} {t('common.days')}
                  </Badge>
                </div>
              </div>
            )}
            
            {/* Action button */}
            {content.action && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="gap-1 px-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent"
                onClick={content.action}
              >
                {content.actionLabel}
                <ArrowRight className={cn("h-3.5 w-3.5", isRTL && "rotate-180")} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
