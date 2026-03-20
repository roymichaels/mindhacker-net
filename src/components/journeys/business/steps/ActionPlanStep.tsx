import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActionPlanStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

export function ActionPlanStep({ onComplete, isCompleting, savedData, onAutoSave }: ActionPlanStepProps) {
  const { language, isRTL } = useTranslation();
  const [firstActions, setFirstActions] = useState<string>((savedData?.firstActions as string) || '');
  const [goals30Days, setGoals30Days] = useState<string>((savedData?.goals30Days as string) || '');
  const [goals90Days, setGoals90Days] = useState<string>((savedData?.goals90Days as string) || '');
  const [commitment, setCommitment] = useState<string>((savedData?.commitment as string) || '');

  const isValid = firstActions.trim() && goals30Days.trim() && goals90Days.trim() && commitment.trim();

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ firstActions, goals30Days, goals90Days, commitment });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [firstActions, goals30Days, goals90Days, commitment, onAutoSave]);

  const handleComplete = () => {
    if (!isValid) return;
    
    // Celebration confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#eab308', '#10b981', '#8b5cf6'],
    });
    
    onComplete({ firstActions, goals30Days, goals90Days, commitment });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
          <Rocket className="w-8 h-8 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'תוכנית פעולה' : 'Action Plan'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'הגיע הזמן לפעולה!' : "It's time for action!"}
        </p>
      </motion.div>

      {/* Celebration Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-400/20 border border-amber-500/30"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-amber-500/20">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="font-semibold text-amber-600">
              {language === 'he' ? 'כמעט סיימת!' : 'Almost done!'}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'he' 
                ? 'זה השלב האחרון - הגדר את הפעולות הראשונות שלך'
                : 'This is the final step - define your first actions'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* First 3 Actions */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">1️⃣</span>
            {language === 'he' ? '3 הפעולות הראשונות שלך' : 'Your first 3 actions'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' 
              ? 'מה תעשה מחר בבוקר? פרט 3 פעולות קונקרטיות.'
              : 'What will you do tomorrow morning? List 3 specific actions.'}
          </p>
          <Textarea
            value={firstActions}
            onChange={(e) => setFirstActions(e.target.value)}
            placeholder={language === 'he' 
              ? '1. ...\n2. ...\n3. ...'
              : '1. ...\n2. ...\n3. ...'}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* 30 Day Goals */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">📅</span>
            {language === 'he' ? 'יעדים ל-30 יום' : '30-day goals'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' 
              ? 'מה אתה רוצה להשיג בחודש הקרוב?'
              : 'What do you want to achieve in the next month?'}
          </p>
          <Textarea
            value={goals30Days}
            onChange={(e) => setGoals30Days(e.target.value)}
            placeholder={language === 'he' ? 'פרט את היעדים...' : 'Detail your goals...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* 90 Day Goals */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <span className="text-lg">🎯</span>
            {language === 'he' ? 'יעדים ל-90 יום' : '90-day goals'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' 
              ? 'איפה אתה רוצה להיות בעוד 3 חודשים?'
              : 'Where do you want to be in 3 months?'}
          </p>
          <Textarea
            value={goals90Days}
            onChange={(e) => setGoals90Days(e.target.value)}
            placeholder={language === 'he' ? 'פרט את היעדים...' : 'Detail your goals...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Commitment */}
      <Card className="border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-yellow-400/5">
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {language === 'he' ? 'התחייבות אישית' : 'Personal commitment'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' 
              ? 'כתוב לעצמך התחייבות אישית. מה אתה מבטיח לעצמך?'
              : 'Write yourself a personal commitment. What do you promise yourself?'}
          </p>
          <Textarea
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder={language === 'he' 
              ? 'אני מתחייב/ת...'
              : 'I commit to...'}
            className="min-h-[100px] border-amber-500/30"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleComplete}
        disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-purple-900 hover:from-amber-600 hover:to-yellow-500"
        size="lg"
      >
        {isCompleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin me-2" />
            {language === 'he' ? 'שומר...' : 'Saving...'}
          </>
        ) : (
          <>
            <Trophy className="w-4 h-4 me-2" />
            {language === 'he' ? 'סיים את המסע!' : 'Complete the Journey!'}
          </>
        )}
      </Button>
    </div>
  );
}

export default ActionPlanStep;
