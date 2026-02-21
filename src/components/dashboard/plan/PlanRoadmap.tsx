import { useState, useEffect } from 'react';
import { Sprout, Hammer, Rocket, ChevronDown, Check, Sparkles, Coins, Trophy, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { SchedulePreview } from './SchedulePreview';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  focus_area: string | null;
  week_number: number;
  month_number: number;
  is_completed: boolean;
  completed_at: string | null;
  xp_reward: number;
  tokens_reward: number;
  tasks: string[];
}

const monthConfig = [
  {
    icon: Sprout,
    labelHe: 'יסודות',
    labelEn: 'Foundations',
    gradient: 'from-emerald-500/10 to-green-500/5',
    border: 'border-emerald-500/20',
    accent: 'text-emerald-600 dark:text-emerald-400',
    progressColor: '[&>div]:bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  {
    icon: Hammer,
    labelHe: 'בנייה',
    labelEn: 'Building',
    gradient: 'from-blue-500/10 to-indigo-500/5',
    border: 'border-blue-500/20',
    accent: 'text-blue-600 dark:text-blue-400',
    progressColor: '[&>div]:bg-blue-500',
    badgeBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  {
    icon: Rocket,
    labelHe: 'מומנטום',
    labelEn: 'Momentum',
    gradient: 'from-purple-500/10 to-violet-500/5',
    border: 'border-purple-500/20',
    accent: 'text-purple-600 dark:text-purple-400',
    progressColor: '[&>div]:bg-purple-500',
    badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
  },
];

export function PlanRoadmap() {
  const { user } = useAuth();
  const { language, isRTL } = useTranslation();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['plan-roadmap', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: plan } = await supabase
        .from('life_plans')
        .select('id, start_date, duration_months, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!plan) return null;

      const { data: milestones } = await supabase
        .from('life_plan_milestones')
        .select('id, title, description, goal, focus_area, week_number, month_number, is_completed, completed_at, xp_reward, tokens_reward, tasks')
        .eq('plan_id', plan.id)
        .order('week_number', { ascending: true });

      const parsed: Milestone[] = (milestones || []).map(m => ({
        ...m,
        is_completed: m.is_completed || false,
        xp_reward: m.xp_reward || 50,
        tokens_reward: m.tokens_reward || 10,
        tasks: Array.isArray(m.tasks) ? (m.tasks as string[]) : [],
      }));

      // Determine current week based on start_date
      let currentWeek = 1;
      if (plan.start_date) {
        const start = new Date(plan.start_date);
        const now = new Date();
        const diffWeeks = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1;
        currentWeek = Math.min(Math.max(diffWeeks, 1), 12);
      }

      return { plan, milestones: parsed, currentWeek };
    },
    enabled: !!user?.id,
  });

  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [completingWeek, setCompletingWeek] = useState<string | null>(null);

  // Auto-expand current week
  useEffect(() => {
    if (data?.currentWeek) {
      setExpandedWeeks(new Set([data.currentWeek]));
    }
  }, [data?.currentWeek]);

  const toggleWeek = (week: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });
  };

  const handleCompleteWeek = async (milestone: Milestone) => {
    if (!user || milestone.is_completed) return;
    setCompletingWeek(milestone.id);

    try {
      const { error } = await supabase
        .from('life_plan_milestones')
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq('id', milestone.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['plan-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['plan-progress-hero'] });

      toast.success(
        language === 'he'
          ? `🎉 שבוע ${milestone.week_number} הושלם! +${milestone.xp_reward} XP +${milestone.tokens_reward} אסימונים`
          : `🎉 Week ${milestone.week_number} complete! +${milestone.xp_reward} XP +${milestone.tokens_reward} tokens`
      );
    } catch {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving progress');
    } finally {
      setCompletingWeek(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    );
  }

  if (!data || data.milestones.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'אין תוכנית פעילה עדיין' : 'No active plan yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group milestones by month
  const byMonth: Record<number, Milestone[]> = {};
  data.milestones.forEach(m => {
    const month = m.month_number || Math.ceil(m.week_number / 4);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(m);
  });

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Schedule Preview (Plus/Apex) - auto-hides for Free */}
      <SchedulePreview />

      {/* Month sections */}
      {[1, 2, 3].map(month => {
        const weeks = byMonth[month] || [];
        if (weeks.length === 0) return null;

        const config = monthConfig[month - 1];
        const Icon = config.icon;
        const completed = weeks.filter(w => w.is_completed).length;
        const monthProgress = Math.round((completed / weeks.length) * 100);

        return (
          <Card key={month} className={cn('overflow-hidden border', config.border)}>
            {/* Month header */}
            <div className={cn('p-4 bg-gradient-to-r', config.gradient)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-xl', config.badgeBg)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {language === 'he'
                        ? `חודש ${month}: ${config.labelHe}`
                        : `Month ${month}: ${config.labelEn}`}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {completed}/{weeks.length} {language === 'he' ? 'שבועות' : 'weeks'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-semibold', config.accent)}>{monthProgress}%</span>
                  <div className="w-16">
                    <Progress value={monthProgress} className={cn('h-1.5', config.progressColor)} />
                  </div>
                </div>
              </div>
            </div>

            {/* Week rows */}
            <div className="divide-y divide-border">
              {weeks.map(milestone => {
                const isCurrent = milestone.week_number === data.currentWeek && !milestone.is_completed;
                const isExpanded = expandedWeeks.has(milestone.week_number);

                return (
                  <div key={milestone.id}>
                    {/* Week trigger */}
                    <button
                      onClick={() => toggleWeek(milestone.week_number)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 transition-colors text-start',
                        'hover:bg-muted/40',
                        isCurrent && 'bg-primary/5'
                      )}
                    >
                      {/* Status indicator */}
                      <div className={cn(
                        'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0',
                        milestone.is_completed
                          ? 'bg-primary border-primary'
                          : isCurrent
                            ? 'border-primary'
                            : 'border-muted-foreground/30'
                      )}>
                        {milestone.is_completed ? (
                          <Check className="w-4 h-4 text-primary-foreground" />
                        ) : (
                          <span className={cn(
                            'text-xs font-bold',
                            isCurrent ? 'text-primary' : 'text-muted-foreground/60'
                          )}>
                            {milestone.week_number}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-sm font-medium truncate',
                            milestone.is_completed && 'text-muted-foreground line-through'
                          )}>
                            {milestone.goal || milestone.title}
                          </span>
                          {isCurrent && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                              {language === 'he' ? 'נוכחי' : 'Current'}
                            </Badge>
                          )}
                        </div>
                        {milestone.focus_area && (
                          <span className="text-xs text-muted-foreground">{milestone.focus_area}</span>
                        )}
                      </div>

                      {/* Rewards preview */}
                      <div className="flex items-center gap-2 shrink-0">
                        {milestone.is_completed && <Trophy className="w-4 h-4 text-amber-500" />}
                        <ChevronDown className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )} />
                      </div>
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
                          <div className="px-4 pb-4 space-y-3">
                            {/* Description */}
                            {(milestone.description || milestone.goal) && (
                              <p className="text-sm text-muted-foreground ps-10">
                                {milestone.description || milestone.goal}
                              </p>
                            )}

                            {/* Tasks */}
                            {milestone.tasks.length > 0 && (
                              <div className="ps-10 space-y-1.5">
                                {milestone.tasks.map((task, idx) => (
                                  <div
                                    key={idx}
                                    className={cn(
                                      'flex items-start gap-2.5 p-2.5 rounded-lg',
                                      'bg-muted/30 border border-border/50'
                                    )}
                                  >
                                    <div className={cn(
                                      'w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center',
                                      milestone.is_completed
                                        ? 'bg-primary border-primary'
                                        : 'border-muted-foreground/30'
                                    )}>
                                      {milestone.is_completed && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    <span className={cn(
                                      'text-sm leading-relaxed',
                                      milestone.is_completed && 'line-through text-muted-foreground'
                                    )}>
                                      {task}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Rewards + Complete button */}
                            <div className="ps-10 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  {milestone.xp_reward} XP
                                </span>
                                <span className="flex items-center gap-1">
                                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                                  {milestone.tokens_reward}
                                </span>
                              </div>

                              {!milestone.is_completed && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCompleteWeek(milestone);
                                  }}
                                  disabled={completingWeek === milestone.id}
                                  className="gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {completingWeek === milestone.id
                                    ? (language === 'he' ? 'שומר...' : 'Saving...')
                                    : (language === 'he' ? 'סמן כהושלם' : 'Mark Complete')}
                                </Button>
                              )}

                              {milestone.is_completed && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Check className="w-3 h-3" />
                                  {language === 'he' ? 'הושלם' : 'Completed'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
