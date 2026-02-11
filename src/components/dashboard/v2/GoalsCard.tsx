import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronDown, ChevronUp, Check, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Milestone {
  id: string;
  title: string;
  goal: string | null;
  focus_area: string | null;
  week_number: number;
  month_number: number;
  is_completed: boolean | null;
}

const monthLabels = {
  he: ['חודש 1', 'חודש 2', 'חודש 3'],
  en: ['Month 1', 'Month 2', 'Month 3'],
};

const monthColors = [
  'from-emerald-500/10 to-green-500/10 border-emerald-500/20',
  'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
  'from-purple-500/10 to-violet-500/10 border-purple-500/20',
];

export function GoalsCard() {
  const { user } = useAuth();
  const { isRTL, language } = useTranslation();

  // Determine current month (1-based) for default expansion
  const currentMonth = Math.min(Math.ceil((new Date().getMonth() % 3 + 1)), 3);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([currentMonth]));

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['goals-milestones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: plan, error: planError } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('[GoalsCard] plan query result:', { plan, planError, userId: user.id });
      if (!plan) return [];

      const { data, error: milestonesError } = await supabase
        .from('life_plan_milestones')
        .select('id, title, goal, focus_area, week_number, month_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });

      console.log('[GoalsCard] milestones query result:', { count: data?.length, milestonesError });
      return (data || []) as Milestone[];
    },
    enabled: !!user?.id,
  });

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-pulse md:col-span-2">
        <div className="h-6 bg-muted rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center md:col-span-2">
        <Target className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">
          {language === 'he' ? 'אין יעדים עדיין' : 'No goals yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'he'
            ? 'השלם את מסע התודעה כדי ליצור יעדים'
            : 'Complete the consciousness journey to create goals'}
        </p>
      </div>
    );
  }

  // Group by month
  const byMonth = milestones.reduce<Record<number, Milestone[]>>((acc, m) => {
    const month = m.month_number || 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(m);
    return acc;
  }, {});

  const totalCompleted = milestones.filter(m => m.is_completed).length;
  const overallProgress = Math.round((totalCompleted / milestones.length) * 100);

  return (
    <div
      className="rounded-xl border bg-card overflow-hidden md:col-span-2"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold">
                {language === 'he' ? '🎯 היעדים שלי' : '🎯 My Goals'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {totalCompleted}/{milestones.length} {language === 'he' ? 'הושלמו' : 'completed'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{overallProgress}%</span>
            <div className="w-20">
              <Progress value={overallProgress} className="h-2 [&>div]:bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Months */}
      <div className="divide-y">
        {[1, 2, 3].map(month => {
          const goals = byMonth[month] || [];
          if (goals.length === 0) return null;

          const completed = goals.filter(g => g.is_completed).length;
          const isExpanded = expandedMonths.has(month);
          const monthProgress = Math.round((completed / goals.length) * 100);
          const labels = language === 'he' ? monthLabels.he : monthLabels.en;

          return (
            <div key={month}>
              <button
                onClick={() => toggleMonth(month)}
                className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-start"
              >
                <Badge variant="secondary" className="text-xs">
                  {labels[month - 1]}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ({completed}/{goals.length})
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={monthProgress} className="h-1.5 [&>div]:bg-amber-500" />
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn('border-t bg-gradient-to-br', monthColors[month - 1])}
                  >
                    <div className="p-3 space-y-2">
                      {goals.map(goal => (
                        <div
                          key={goal.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-lg bg-background/80 backdrop-blur-sm',
                            'border border-border/50',
                            goal.is_completed && 'opacity-60'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                              goal.is_completed
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-muted-foreground/50'
                            )}
                          >
                            {goal.is_completed && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium',
                              goal.is_completed && 'line-through text-muted-foreground'
                            )}>
                              {goal.goal || goal.title}
                            </p>
                            {goal.focus_area && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {goal.focus_area}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {language === 'he' ? `שבוע ${goal.week_number}` : `Week ${goal.week_number}`}
                            </p>
                          </div>
                          {goal.is_completed && (
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
