import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, MessageSquare, SkipForward, ArrowRight } from 'lucide-react';

interface FinalNotesStepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  isCompleting?: boolean;
  rewards?: { xp: number; tokens: number; unlock: string };
  savedData?: { notes?: string };
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const STORAGE_KEY = 'launchpad_final_notes';

const PROMPTS = {
  he: [
    '💡 מגבלות בריאותיות שחשוב לנו לדעת',
    '🏠 מצבים מיוחדים בחיים (מעבר דירה, לידה, גירושין...)',
    '⏰ הגבלות זמן או לוח זמנים מיוחד',
    '🎯 דברים שחשוב ש-Aurora תדע עליך',
    '💬 כל הערה או בקשה נוספת',
  ],
  en: [
    '💡 Health limitations we should know about',
    '🏠 Special life situations (moving, birth, divorce...)',
    '⏰ Time constraints or special schedule',
    '🎯 Things Aurora should know about you',
    '💬 Any other notes or requests',
  ],
};

export function FinalNotesStep({ 
  onComplete, 
  isCompleting, 
  rewards,
  savedData,
  onAutoSave 
}: FinalNotesStepProps) {
  const { language, isRTL } = useTranslation();
  
  const [notes, setNotes] = useState(() => {
    // First try savedData from DB, then localStorage
    if (savedData?.notes) {
      return savedData.notes;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.notes || '';
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return '';
  });

  // Auto-save on changes
  useEffect(() => {
    if (notes) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ notes }));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      onAutoSave?.({ notes });
    }
  }, [notes, onAutoSave]);

  const handleSubmit = () => {
    onComplete({ final_notes: notes.trim() || null });
  };

  const handleSkip = () => {
    onComplete({ final_notes: null });
  };

  const prompts = PROMPTS[language === 'he' ? 'he' : 'en'];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">📝</div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'יש משהו נוסף?' : 'Anything else?'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' 
            ? 'זה המקום לכל מה שלא נשאלת - או שתרצה ש-Aurora תדע' 
            : 'This is the place for anything we didn\'t ask - or that you want Aurora to know'}
        </p>
      </div>

      {/* Prompts */}
      <Card className="p-4 bg-muted/50">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {language === 'he' ? 'רעיונות למה לכתוב:' : 'Ideas for what to write:'}
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {prompts.map((prompt, idx) => (
            <li key={idx}>{prompt}</li>
          ))}
        </ul>
      </Card>

      {/* Textarea */}
      <div className="space-y-2">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={language === 'he' 
            ? 'כתוב כאן כל מה שחשוב לך שנדע...' 
            : 'Write here anything important for us to know...'}
          className="min-h-[180px] resize-none"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
        <p className="text-xs text-muted-foreground text-center">
          {language === 'he' 
            ? 'אופציונלי - אפשר לדלג אם אין לך מה להוסיף' 
            : 'Optional - you can skip if you have nothing to add'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={isCompleting}
          className={cn(
            "gap-2 h-14 text-lg font-bold transition-all duration-300",
            "bg-gradient-to-r from-primary via-accent to-primary",
            "hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
          )}
          size="lg"
        >
          <ArrowRight className="w-5 h-5" />
          {isCompleting 
            ? (language === 'he' ? 'שומר...' : 'Saving...') 
            : (language === 'he' ? '🚀 המשך לסיכום' : '🚀 Continue to Summary')}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isCompleting}
          className="gap-2 text-muted-foreground border-muted-foreground/30 hover:bg-muted"
        >
          <SkipForward className="w-4 h-4" />
          {language === 'he' ? 'דלג' : 'Skip'}
        </Button>
      </div>

      {/* Rewards preview */}
      {rewards && (
        <div className="text-center text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
            <Sparkles className="w-3 h-3 text-primary" />
            +{rewards.xp} XP
            {rewards.tokens > 0 && ` • +${rewards.tokens} ${language === 'he' ? 'טוקנים' : 'Tokens'}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default FinalNotesStep;
