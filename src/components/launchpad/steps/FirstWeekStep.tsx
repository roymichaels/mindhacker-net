import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Anchor, Check, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FirstWeekStepProps {
  onComplete: (data: { actions: string[]; anchor_habit: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

interface Suggestion {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
}

// Fallback suggestions if AI fails
const FALLBACK_ACTIONS: Suggestion[] = [
  { id: 'walk', icon: '🚶', label: 'הליכה של 20 דקות', labelEn: 'Walk for 20 minutes' },
  { id: 'water', icon: '💧', label: 'לשתות 8 כוסות מים', labelEn: 'Drink 8 glasses of water' },
  { id: 'sleep', icon: '😴', label: 'לישון לפני 23:00', labelEn: 'Sleep before 11 PM' },
  { id: 'stretch', icon: '🧘', label: 'מתיחות בוקר 5 דקות', labelEn: '5 min morning stretch' },
  { id: 'gratitude', icon: '🙏', label: 'לכתוב 3 דברים טובים', labelEn: 'Write 3 good things' },
  { id: 'breathe', icon: '🌬️', label: 'נשימות עמוקות 3 פעמים', labelEn: 'Deep breaths 3 times' },
  { id: 'noPhone', icon: '📵', label: 'שעה ללא טלפון', labelEn: 'One hour phone-free' },
  { id: 'read', icon: '📖', label: 'לקרוא 10 דקות', labelEn: 'Read for 10 minutes' },
];

const FALLBACK_ANCHORS: Suggestion[] = [
  { id: 'morning', icon: '☀️', label: 'נשימה עמוקה אחת אחרי שקמתי', labelEn: 'One deep breath after waking' },
  { id: 'coffee', icon: '☕', label: '10 שניות של שקט לפני קפה', labelEn: '10 sec silence before coffee' },
  { id: 'mirror', icon: '🪞', label: 'חיוך למראה בבוקר', labelEn: 'Smile in the mirror' },
  { id: 'thanks', icon: '💭', label: 'מחשבת תודה אחת ביום', labelEn: 'One grateful thought daily' },
  { id: 'water_first', icon: '💧', label: 'כוס מים ראשונה בבוקר', labelEn: 'First glass of water' },
];

export function FirstWeekStep({ onComplete, isCompleting, rewards }: FirstWeekStepProps) {
  const { language, isRTL } = useTranslation();
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedAnchor, setSelectedAnchor] = useState<string>('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [actionSuggestions, setActionSuggestions] = useState<Suggestion[]>(FALLBACK_ACTIONS);
  const [anchorSuggestions, setAnchorSuggestions] = useState<Suggestion[]>(FALLBACK_ANCHORS);

  // Load personalized suggestions from AI
  const loadSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session, using fallback suggestions');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-first-week-actions', {
        body: { language }
      });

      if (error) {
        console.error('Error loading suggestions:', error);
        if (error.message?.includes('429')) {
          toast.error(language === 'he' ? 'יותר מדי בקשות, נסה שוב עוד רגע' : 'Too many requests, try again shortly');
        }
        return;
      }

      if (data?.actions && data.actions.length > 0) {
        setActionSuggestions(data.actions);
      }
      if (data?.anchors && data.anchors.length > 0) {
        setAnchorSuggestions(data.anchors);
      }
    } catch (err) {
      console.error('Failed to load AI suggestions:', err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [language]);

  const toggleAction = (label: string) => {
    setSelectedActions(prev => {
      if (prev.includes(label)) {
        return prev.filter(a => a !== label);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), label];
      }
      return [...prev, label];
    });
  };

  const selectAnchor = (label: string) => {
    setSelectedAnchor(label);
  };

  const isValid = selectedActions.length === 3 && selectedAnchor.length > 0;

  const handleSubmit = () => {
    if (isValid) {
      onComplete({ 
        actions: selectedActions,
        anchor_habit: selectedAnchor
      });
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <span className="text-3xl">📅</span>
        </div>
        
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'תכנון השבוע הראשון' : 'Planning Your First Week'}
        </h1>
        
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          {language === 'he' 
            ? 'הנה הצעות מותאמות אישית בהתבסס על מה ששיתפת. בחר 3 פעולות והרגל עוגן אחד!'
            : 'Here are personalized suggestions based on what you shared. Choose 3 actions and one anchor habit!'
          }
        </p>

        {/* Personalized badge */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            {language === 'he' ? 'מותאם אישית עבורך' : 'Personalized for you'}
          </div>
          {!isLoadingSuggestions && (
            <button
              onClick={loadSuggestions}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              title={language === 'he' ? 'רענן הצעות' : 'Refresh suggestions'}
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoadingSuggestions && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">
              {language === 'he' ? 'מכין הצעות מותאמות אישית...' : 'Preparing personalized suggestions...'}
            </span>
          </div>
        </div>
      )}

      {/* 3 Actions Selection */}
      {!isLoadingSuggestions && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">
                {language === 'he' ? '3 פעולות לשבוע' : '3 Actions for the Week'}
              </h3>
            </div>
            <span className="text-xs font-medium text-primary">
              {selectedActions.length}/3
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {actionSuggestions.map((action, index) => {
              const label = language === 'he' ? action.label : action.labelEn;
              const isSelected = selectedActions.includes(label);
              const selectionIndex = selectedActions.indexOf(label);
              
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.03 * index }}
                  onClick={() => toggleAction(label)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-muted/50 hover:bg-muted border border-muted-foreground/20"
                  )}
                >
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold"
                    >
                      {selectionIndex + 1}
                    </motion.span>
                  )}
                  <span>{action.icon}</span>
                  <span className="text-xs">{label}</span>
                </motion.button>
              );
            })}
          </div>
          
          {/* Selected Actions Display */}
          <AnimatePresence>
            {selectedActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 rounded-lg p-3 space-y-1"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {language === 'he' ? 'הפעולות שבחרת:' : 'Your chosen actions:'}
                </p>
                {selectedActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-3 h-3 text-primary" />
                    <span>{action}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Anchor Habit Selection */}
      {!isLoadingSuggestions && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Anchor className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-sm">
              {language === 'he' ? 'הרגל עוגן (קטן במיוחד!)' : 'Anchor Habit (super tiny!)'}
            </h3>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {language === 'he' 
              ? 'פעולה כל כך קטנה שאי אפשר לא לעשות אותה. זה הבסיס!'
              : 'So tiny you can\'t NOT do it. This is your foundation!'
            }
          </p>
          
          <div className="flex flex-wrap gap-2">
            {anchorSuggestions.map((anchor, index) => {
              const label = language === 'he' ? anchor.label : anchor.labelEn;
              const isSelected = selectedAnchor === label;
              
              return (
                <motion.button
                  key={anchor.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => selectAnchor(label)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-all",
                    isSelected 
                      ? "bg-amber-500 text-white shadow-md" 
                      : "bg-muted/50 hover:bg-muted border border-muted-foreground/20"
                  )}
                >
                  <span>{anchor.icon}</span>
                  <span className="text-xs">{label}</span>
                </motion.button>
              );
            })}
          </div>
          
          {/* Selected Anchor Display */}
          <AnimatePresence>
            {selectedAnchor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-500/10 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Anchor className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">{selectedAnchor}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Submit */}
      {!isLoadingSuggestions && (
        <div className="text-center space-y-3 pt-2">
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
                ? `בחר ${3 - selectedActions.length > 0 ? `עוד ${3 - selectedActions.length} פעולות` : ''} ${!selectedAnchor ? 'והרגל עוגן' : ''}`
                : `Select ${3 - selectedActions.length > 0 ? `${3 - selectedActions.length} more actions` : ''} ${!selectedAnchor ? 'and an anchor habit' : ''}`
              }
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default FirstWeekStep;
