import { useState } from 'react';
import { Target, Check, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
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

export function GoalsPopover() {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentMonth = Math.min(Math.ceil((new Date().getMonth() % 3 + 1)), 3);
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set([currentMonth]));

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['goals-popover', user?.id],
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
      console.log('[GoalsPopover] plan query result:', { plan, planError, userId: user.id });
      if (!plan) return [];
      const { data, error: milestonesError } = await supabase
        .from('life_plan_milestones')
        .select('id, title, goal, focus_area, week_number, month_number, is_completed')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });
      console.log('[GoalsPopover] milestones query result:', { count: data?.length, milestonesError });
      return (data || []) as Milestone[];
    },
    enabled: !!user?.id && open,
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
          title={language === 'he' ? 'יעדים' : 'Goals'}
        >
          <Target className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 bg-popover border shadow-lg z-[100]"
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
      >
        <div dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="p-3 border-b bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-sm">
                  {language === 'he' ? '🎯 היעדים שלי' : '🎯 My Goals'}
                </span>
              </div>
              {total > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {totalCompleted}/{total}
                  </span>
                  <div className="w-12">
                    <Progress value={overallProgress} className="h-1.5 [&>div]:bg-amber-500" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="h-4 bg-muted rounded animate-pulse" />
            </div>
          ) : !milestones || milestones.length === 0 ? (
            <div className="p-6 text-center">
              <Target className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {language === 'he' ? 'אין יעדים עדיין' : 'No goals yet'}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[350px]">
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
                        className="w-full p-3 flex items-center gap-2 hover:bg-muted/50 transition-colors text-start"
                      >
                        <Badge variant="secondary" className="text-xs">{labels[month - 1]}</Badge>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground">({completed}/{goals.length})</span>
                          <Progress value={monthProgress} className="h-1 mt-1 [&>div]:bg-amber-500" />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="overflow-hidden bg-muted/30"
                          >
                            <div className="px-3 py-2 space-y-1">
                              {goals.map(goal => (
                                <div
                                  key={goal.id}
                                  className={cn(
                                    'flex items-start gap-2 p-2 rounded-md',
                                    goal.is_completed && 'opacity-60'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                                      goal.is_completed ? 'bg-amber-500 border-amber-500' : 'border-muted-foreground/50'
                                    )}
                                  >
                                    {goal.is_completed && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={cn(
                                      'text-xs block break-words',
                                      goal.is_completed && 'line-through text-muted-foreground'
                                    )}>
                                      {goal.goal || goal.title}
                                    </span>
                                    {goal.focus_area && (
                                      <span className="text-[10px] text-muted-foreground">{goal.focus_area}</span>
                                    )}
                                  </div>
                                  {goal.is_completed && <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
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
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
