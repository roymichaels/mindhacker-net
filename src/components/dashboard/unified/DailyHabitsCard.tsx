import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, ChevronDown, ChevronUp, Sparkles, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDailyHabits } from '@/hooks/aurora/useDailyHabits';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export function DailyHabitsCard() {
  const { user } = useAuth();
  const { habits, loading, todayStats, weeklyStats, completeHabit, uncompleteHabit } = useDailyHabits(user);
  const { isRTL, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleHabit = async (habitId: string, isCurrentlyCompleted: boolean) => {
    if (isCurrentlyCompleted) {
      const result = await uncompleteHabit(habitId);
      if (result) {
        toast.info(language === 'he' ? 'ההרגל בוטל' : 'Habit unchecked');
      }
    } else {
      const result = await completeHabit(habitId, 'manual');
      if (result) {
        toast.success(language === 'he' ? 'כל הכבוד! +15 XP 🔥' : 'Great job! +15 XP 🔥', {
          icon: '✅',
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-muted rounded" />
          <div className="h-12 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold mb-1">
          {language === 'he' ? 'אין הרגלים יומיים' : 'No daily habits'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? 'הרגלים יומיים יופיעו כאן לאחר שאורורה תזהה אותם מתוכנית הטרנספורמציה שלך'
            : 'Daily habits will appear here after Aurora identifies them from your transformation plan'
          }
        </p>
      </div>
    );
  }

  // Get today's date formatted
  const todayFormatted = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Days of week for weekly view
  const daysOfWeek = language === 'he' 
    ? ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div 
      className="rounded-xl border bg-card overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold">
                {language === 'he' ? '🔄 מעקב יומי' : '🔄 Daily Tracking'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {todayFormatted}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-end">
              <div className="text-lg font-bold">
                {todayStats.completed}/{todayStats.total}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'he' ? 'היום' : 'today'}
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Today's Progress Bar */}
        <div className="mt-3">
          <Progress value={todayStats.percentage} className="h-2" />
        </div>
      </div>

      {/* Habits List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 space-y-2">
              {habits.map((habit, index) => {
                const isCompleted = habit.todayLog?.is_completed || false;
                const streakEmoji = habit.streak >= 7 ? '🔥🔥' : habit.streak >= 3 ? '🔥' : '';

                return (
                  <motion.div
                    key={habit.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleToggleHabit(habit.id, isCompleted)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      "border hover:border-primary/30",
                      isCompleted 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-background border-border/50 hover:bg-muted/50"
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        isCompleted
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/50 hover:border-primary"
                      )}
                    >
                      {isCompleted && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <span
                        className={cn(
                          "text-sm font-medium block",
                          isCompleted && "text-green-700 dark:text-green-400"
                        )}
                      >
                        {habit.content}
                      </span>

                      {/* Weekly dots */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {habit.weeklyHistory.map((day, i) => (
                          <div
                            key={day.date}
                            className={cn(
                              "w-3 h-3 rounded-full",
                              day.completed 
                                ? "bg-green-500" 
                                : i === 6 
                                  ? "bg-muted-foreground/30 ring-2 ring-primary/50" 
                                  : "bg-muted-foreground/20"
                            )}
                            title={`${daysOfWeek[new Date(day.date).getDay()]}: ${day.completed ? '✓' : '✗'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Streak Badge */}
                    {habit.streak > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "shrink-0 gap-1",
                          habit.streak >= 7 
                            ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                            : habit.streak >= 3
                              ? "bg-amber-500/20 text-amber-600 border-amber-500/30"
                              : "bg-muted"
                        )}
                      >
                        {streakEmoji} {habit.streak} {language === 'he' ? 'ימים' : 'days'}
                      </Badge>
                    )}

                    {/* Aurora completed indicator */}
                    {habit.todayLog?.completed_by === 'aurora' && (
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Weekly Summary */}
            <div className="p-3 bg-muted/30 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'he' ? 'סיכום שבועי:' : 'Weekly summary:'}
                </span>
                <span className="font-medium">
                  {weeklyStats.completed}/{weeklyStats.total} ({weeklyStats.percentage}%)
                </span>
              </div>
              <Progress value={weeklyStats.percentage} className="h-1.5 mt-2" />
            </div>

            {/* XP Reminder */}
            <div className="p-2 bg-primary/5 border-t">
              <p className="text-xs text-center text-muted-foreground">
                <Sparkles className="w-3 h-3 inline-block me-1" />
                {language === 'he' 
                  ? 'כל הרגל יומי = +15 XP | אורורה יכולה לסמן בשיחה!' 
                  : 'Each daily habit = +15 XP | Aurora can mark via chat!'
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DailyHabitsCard;
