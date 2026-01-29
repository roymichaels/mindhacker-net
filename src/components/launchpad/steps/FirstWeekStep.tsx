import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Plus, X, Target, Anchor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstWeekStepProps {
  onComplete: (data: { actions: string[]; anchor_habit: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

export function FirstWeekStep({ onComplete, isCompleting, rewards }: FirstWeekStepProps) {
  const { language, isRTL } = useTranslation();
  const [actions, setActions] = useState<string[]>(['', '', '']);
  const [anchorHabit, setAnchorHabit] = useState('');

  const filledActions = actions.filter(a => a.trim().length >= 5);
  const isValid = filledActions.length >= 3 && anchorHabit.trim().length >= 5;

  const updateAction = (index: number, value: string) => {
    setActions(prev => {
      const newActions = [...prev];
      newActions[index] = value;
      return newActions;
    });
  };

  const handleSubmit = () => {
    if (isValid) {
      onComplete({ 
        actions: filledActions,
        anchor_habit: anchorHabit.trim()
      });
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <span className="text-4xl">📅</span>
        </div>
        
        <h1 className="text-3xl font-bold">
          {language === 'he' ? 'תכנון השבוע הראשון' : 'Planning Your First Week'}
        </h1>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'he' 
            ? 'הגדר 3 פעולות קטנות והרגל עוגן אחד שתתחיל כבר השבוע.'
            : 'Set 3 small actions and one anchor habit you\'ll start this week.'
          }
        </p>
      </div>

      {/* 3 Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">
            {language === 'he' ? '3 פעולות לשבוע' : '3 Actions for the Week'}
          </h3>
        </div>
        
        <div className="space-y-3">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-3"
            >
              <span className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                action.trim().length >= 5 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <Input
                value={action}
                onChange={(e) => updateAction(index, e.target.value)}
                placeholder={language === 'he' 
                  ? `פעולה ${index + 1} (למשל: ללכת 30 דקות)` 
                  : `Action ${index + 1} (e.g., Walk 30 minutes)`
                }
                className="flex-1"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Anchor Habit */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">
            {language === 'he' ? 'הרגל עוגן' : 'Anchor Habit'}
          </h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? 'הרגל עוגן הוא פעולה קטנה שתעשה כל יום, ללא יוצא מן הכלל. הוא יהפוך לבסיס של כל ההרגלים האחרים.'
            : 'An anchor habit is a small action you\'ll do every day, no exceptions. It will become the foundation for all other habits.'
          }
        </p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <Input
            value={anchorHabit}
            onChange={(e) => setAnchorHabit(e.target.value)}
            placeholder={language === 'he' 
              ? 'למשל: 5 דקות מדיטציה כל בוקר' 
              : 'e.g., 5 minutes of meditation every morning'
            }
            className="pr-10"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          {anchorHabit.trim().length >= 5 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-primary"
            >
              ✓
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Tips */}
      <div className="bg-muted/30 rounded-xl p-4 text-sm space-y-2">
        <p className="font-medium">
          {language === 'he' ? '💡 טיפים:' : '💡 Tips:'}
        </p>
        <ul className="space-y-1 text-muted-foreground">
          <li>
            {language === 'he' 
              ? '• הפעולות צריכות להיות קטנות וברות ביצוע'
              : '• Actions should be small and achievable'
            }
          </li>
          <li>
            {language === 'he' 
              ? '• הרגל העוגן צריך להיות כל כך קטן שאי אפשר לא לעשות אותו'
              : '• The anchor habit should be so small you can\'t not do it'
            }
          </li>
          <li>
            {language === 'he' 
              ? '• חבר את ההרגל לפעולה שכבר עושה (אחרי קפה הבוקר...)'
              : '• Connect the habit to something you already do (after morning coffee...)'
            }
          </li>
        </ul>
      </div>

      {/* Submit */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>+{rewards.xp} XP</span>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={handleSubmit}
          disabled={!isValid || isCompleting}
          className="min-w-[200px]"
        >
          {isCompleting 
            ? (language === 'he' ? 'שומר...' : 'Saving...') 
            : (language === 'he' ? 'המשך' : 'Continue')
          }
        </Button>
        
        {!isValid && (
          <p className="text-xs text-muted-foreground">
            {language === 'he' 
              ? 'מלא את 3 הפעולות והרגל העוגן (לפחות 5 תווים בכל אחד)'
              : 'Fill all 3 actions and the anchor habit (at least 5 characters each)'
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default FirstWeekStep;
