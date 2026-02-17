import { Check, Circle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { useTodaysHabits } from '@/hooks/useTodaysHabits';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function TodaysHabitsCard() {
  const { isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const { habits, isLoading, toggleHabit, isToggling, completedCount, totalCount, progress } = useTodaysHabits();

  if (isLoading) {
    return <Card><CardContent className="p-3 space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></CardContent></Card>;
  }

  if (habits.length === 0) {
    return (
      <Card id="habits-card" className="bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-muted-foreground mb-2">{language === 'he' ? 'אין הרגלים עדיין' : 'No habits yet'}</p>
          <Button size="sm" variant="outline" onClick={() => navigate('/aurora')} className="h-7 text-[11px]">
            {language === 'he' ? 'הוסף' : 'Add'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allCompleted = completedCount === totalCount;

  return (
    <Card 
      id="habits-card"
      className={cn(
        "rounded-xl shadow-sm bg-gradient-to-br transition-colors",
        allCompleted ? "from-emerald-500/10 to-transparent border-emerald-500/30" : "from-muted/30 to-transparent"
      )}
    >
      <CardHeader className="pb-0.5 px-2.5 pt-2.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className={cn("h-3.5 w-3.5", allCompleted ? "text-emerald-500" : "text-muted-foreground")} />
            {language === 'he' ? 'הרגלים' : 'Habits'}
          </CardTitle>
          <span className="text-[10px] text-muted-foreground font-medium">{completedCount}/{totalCount}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 px-2.5 pb-2.5" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <motion.button
                key={habit.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => toggleHabit(habit.id, !habit.isCompleted)}
                disabled={isToggling}
                className={cn(
                  "w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-start transition-all",
                  "hover:bg-muted/50",
                  habit.isCompleted ? "bg-emerald-500/10" : "bg-background/50 border border-border/50"
                )}
              >
                <div className={cn(
                  "shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all",
                  habit.isCompleted ? "bg-emerald-500 text-white" : "border-2 border-muted-foreground/30"
                )}>
                  {habit.isCompleted && <Check className="h-2.5 w-2.5" />}
                </div>
                <span className={cn("flex-1 text-xs", habit.isCompleted && "line-through text-muted-foreground")}>
                  {habit.title}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        <Progress value={progress} className={cn("h-1", allCompleted && "[&>div]:bg-emerald-500")} />
      </CardContent>
    </Card>
  );
}
