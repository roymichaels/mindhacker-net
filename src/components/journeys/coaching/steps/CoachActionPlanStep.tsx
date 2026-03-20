import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const TIMELINE_OPTIONS = {
  he: [
    { id: 'this_week', label: 'השבוע הזה' },
    { id: 'this_month', label: 'החודש הזה' },
    { id: '3_months', label: 'תוך 3 חודשים' },
    { id: '6_months', label: 'תוך 6 חודשים' },
  ],
  en: [
    { id: 'this_week', label: 'This Week' },
    { id: 'this_month', label: 'This Month' },
    { id: '3_months', label: 'Within 3 Months' },
    { id: '6_months', label: 'Within 6 Months' },
  ],
};

export function CoachActionPlanStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [timeline, setTimeline] = useState<string>((savedData?.timeline as string) || '');
  const [firstActions, setFirstActions] = useState<string>((savedData?.firstActions as string) || '');
  const [goals30, setGoals30] = useState<string>((savedData?.goals30 as string) || '');
  const [goals90, setGoals90] = useState<string>((savedData?.goals90 as string) || '');
  const [commitment, setCommitment] = useState<string>((savedData?.commitment as string) || '');

  const options = language === 'he' ? TIMELINE_OPTIONS.he : TIMELINE_OPTIONS.en;
  const isValid = !!timeline && firstActions.trim().length > 5;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ timeline, firstActions, goals30, goals90, commitment }), 500);
      return () => clearTimeout(timer);
    }
  }, [timeline, firstActions, goals30, goals90, commitment, onAutoSave]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'תוכנית פעולה והשקה' : 'Action Plan & Launch'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'הצעדים הראשונים שלך כמאמן' : 'Your first steps as a coach'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'מתי אתה מתכנן להתחיל?' : 'When do you plan to start?'}</h3>
        <div className="space-y-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => setTimeline(option.id)}
              className={cn("w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                timeline === option.id ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
              <div className="flex items-center gap-2">
                {timeline === option.id && <Check className="w-4 h-4 text-orange-500" />}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? '3 הפעולות הראשונות שלך' : 'Your First 3 Actions'}</h3>
        <Textarea value={firstActions} onChange={(e) => setFirstActions(e.target.value)}
          placeholder={language === 'he' ? '1. ...\n2. ...\n3. ...' : '1. ...\n2. ...\n3. ...'} className="min-h-[100px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'יעדים ל-30 יום' : '30-Day Goals'}</h3>
        <Textarea value={goals30} onChange={(e) => setGoals30(e.target.value)}
          placeholder={language === 'he' ? 'מה אתה רוצה להשיג ב-30 הימים הקרובים?' : 'What do you want to achieve in the next 30 days?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'יעדים ל-90 יום' : '90-Day Goals'}</h3>
        <Textarea value={goals90} onChange={(e) => setGoals90(e.target.value)}
          placeholder={language === 'he' ? 'מה אתה רוצה להשיג ב-90 הימים הקרובים?' : 'What do you want to achieve in the next 90 days?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'ההתחייבות שלך' : 'Your Commitment'}</h3>
        <Textarea value={commitment} onChange={(e) => setCommitment(e.target.value)}
          placeholder={language === 'he' ? 'כתוב התחייבות לעצמך...' : 'Write a commitment to yourself...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Button onClick={() => onComplete({ timeline, firstActions, goals30, goals90, commitment })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 text-lg py-6" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'משיק...' : 'Launching...'}</>) : (
          <>🚀 {language === 'he' ? 'השק את קריירת האימון שלך!' : 'Launch Your Coaching Career!'}</>
        )}
      </Button>
    </div>
  );
}
