import { useState } from 'react';
import { Target, Check, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

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

export function GoalsPanel() {
  const { user } = useAuth();
  const { language } = useTranslation();
  const currentMonth = Math.min(Math.ceil((new Date().getMonth() % 3 + 1)), 3);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([currentMonth]));

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['goals-panel', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: plan } = await supabase
        .from('life_plans')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!plan) return [];
      const { data } = await supabase
        .from('life_plan_milestones')
        .select('id, title, goal, focus_area, week_number, month_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });
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

  const byMonth = (milestones || []).reduce<Record<number, Milestone[]>>((acc, m) => {
    const month = m.month_number || 1;
    if (!acc[month]) acc[month] = [];
    acc[month].push(m);
    return acc;
  }, {});

  const totalCompleted = (milestones || []).filter(m => m.is_completed).length;
  const total = (milestones || []).length;
  const overallProgress = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!milestones || milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">
          {language === 'he' ? 'אין יעדים עדיין' : 'No goals yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">
              {language === 'he' ? 'התקדמות כללית' : 'Overall Progress'}
            </span>
            <span className="text-xs text-muted-foreground">{totalCompleted}/{total}</span>
          </div>
          <Progress value={overallProgress} className="h-1.5 [&>div]:bg-amber-500" />
        </div>
      </div>

      {/* Months */}
      <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
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
                className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-start"
              >
                <Badge variant="secondary" className="text-xs shrink-0">{labels[month - 1]}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{completed}/{goals.length}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <Progress value={monthProgress} className="h-1 mt-1 [&>div]:bg-amber-500" />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden bg-muted/20"
                  >
                    <div className="px-3 py-2 space-y-1">
                      {goals.map(goal => (
                        <div
                          key={goal.id}
                          className={cn(
                            'flex items-start gap-3 p-2.5 rounded-lg',
                            goal.is_completed && 'opacity-60'
                          )}
                        >
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                              goal.is_completed ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/40'
                            )}
                          >
                            {goal.is_completed && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={cn(
                              'text-sm block break-words',
                              goal.is_completed && 'line-through text-muted-foreground'
                            )}>
                              {goal.goal || goal.title}
                            </span>
                            {goal.focus_area && (
                              <span className="text-xs text-muted-foreground">{goal.focus_area}</span>
                            )}
                          </div>
                          {goal.is_completed && <Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
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
