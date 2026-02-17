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
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card id="habits-card" className="bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            {language === 'he' ? 'ההרגלים של היום' : "Today's Habits"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-3">
            {language === 'he' 
              ? 'עדיין אין לך הרגלים יומיים' 
              : "You don't have daily habits yet"}
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/aurora')}>
            {language === 'he' ? 'הוסף הרגלים' : 'Add Habits'}
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
        "rounded-2xl shadow-sm bg-gradient-to-br transition-colors",
        allCompleted 
          ? "from-emerald-500/10 to-transparent border-emerald-500/30" 
          : "from-muted/30 to-transparent"
      )}
    >
      <CardHeader className="pb-1 px-3 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className={cn(
              "h-4 w-4",
              allCompleted ? "text-emerald-500" : "text-muted-foreground"
            )} />
            {language === 'he' ? 'ההרגלים של היום' : "Today's Habits"}
          </CardTitle>
          <span className="text-sm text-muted-foreground font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-3 pb-3" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Habit list */}
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <motion.button
                key={habit.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => toggleHabit(habit.id, !habit.isCompleted)}
                disabled={isToggling}
                className={cn(
                  "w-full flex items-center gap-3 py-2 px-2.5 rounded-xl text-start",
                  "transition-all duration-200",
                  "hover:bg-muted/50",
                  habit.isCompleted 
                    ? "bg-emerald-500/10" 
                    : "bg-background/50 border border-border/50"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                  "transition-all duration-200",
                  habit.isCompleted 
                    ? "bg-emerald-500 text-white" 
                    : "border-2 border-muted-foreground/30"
                )}>
                  {habit.isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check className="h-3 w-3" />
                    </motion.div>
                  )}
                </div>
                
                {/* Title */}
                <span className={cn(
                  "flex-1 text-sm transition-all",
                  habit.isCompleted && "line-through text-muted-foreground"
                )}>
                  {habit.title}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Progress bar */}
        <div className="space-y-1.5 pt-1">
          <Progress 
            value={progress} 
            className={cn(
              "h-1.5",
              allCompleted && "[&>div]:bg-emerald-500"
            )} 
          />
          <p className="text-xs text-muted-foreground text-center">
            {allCompleted 
              ? (language === 'he' ? '🎉 כל הכבוד! סיימת את כל ההרגלים' : '🎉 Great job! All habits completed')
              : `${progress}% ${language === 'he' ? 'הושלמו' : 'complete'}`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
