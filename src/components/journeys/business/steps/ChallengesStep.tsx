import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChallengesStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const FEAR_OPTIONS = {
  he: [
    { id: 'failure', label: 'פחד מכישלון' },
    { id: 'money', label: 'פחד להפסיד כסף' },
    { id: 'judgment', label: 'פחד משיפוט אחרים' },
    { id: 'not_good_enough', label: 'חוסר ביטחון ביכולות' },
    { id: 'rejection', label: 'פחד מדחייה' },
    { id: 'success', label: 'פחד מהצלחה' },
    { id: 'unknown', label: 'פחד מהלא נודע' },
  ],
  en: [
    { id: 'failure', label: 'Fear of Failure' },
    { id: 'money', label: 'Fear of Losing Money' },
    { id: 'judgment', label: 'Fear of Judgment' },
    { id: 'not_good_enough', label: 'Self-Doubt' },
    { id: 'rejection', label: 'Fear of Rejection' },
    { id: 'success', label: 'Fear of Success' },
    { id: 'unknown', label: 'Fear of the Unknown' },
  ],
};

const BLOCKER_OPTIONS = {
  he: [
    { id: 'time', label: 'חוסר זמן' },
    { id: 'money', label: 'חוסר כסף' },
    { id: 'knowledge', label: 'חוסר ידע' },
    { id: 'support', label: 'חוסר תמיכה מהסביבה' },
    { id: 'clarity', label: 'חוסר בהירות' },
    { id: 'focus', label: 'קושי בריכוז' },
    { id: 'procrastination', label: 'דחיינות' },
  ],
  en: [
    { id: 'time', label: 'Lack of Time' },
    { id: 'money', label: 'Lack of Money' },
    { id: 'knowledge', label: 'Lack of Knowledge' },
    { id: 'support', label: 'Lack of Support' },
    { id: 'clarity', label: 'Lack of Clarity' },
    { id: 'focus', label: 'Difficulty Focusing' },
    { id: 'procrastination', label: 'Procrastination' },
  ],
};

export function ChallengesStep({ onComplete, isCompleting, savedData, onAutoSave }: ChallengesStepProps) {
  const { language, isRTL } = useTranslation();
  const [fears, setFears] = useState<string[]>((savedData?.fears as string[]) || []);
  const [blockers, setBlockers] = useState<string[]>((savedData?.blockers as string[]) || []);
  const [whatStoppedYou, setWhatStoppedYou] = useState<string>((savedData?.whatStoppedYou as string) || '');
  const [whatCouldGoWrong, setWhatCouldGoWrong] = useState<string>((savedData?.whatCouldGoWrong as string) || '');

  const fearOptions = language === 'he' ? FEAR_OPTIONS.he : FEAR_OPTIONS.en;
  const blockerOptions = language === 'he' ? BLOCKER_OPTIONS.he : BLOCKER_OPTIONS.en;

  const isValid = fears.length > 0 || blockers.length > 0 || whatStoppedYou.trim();

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ fears, blockers, whatStoppedYou, whatCouldGoWrong });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [fears, blockers, whatStoppedYou, whatCouldGoWrong, onAutoSave]);

  const toggleFear = (id: string) => {
    setFears(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleBlocker = (id: string) => {
    setBlockers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ fears, blockers, whatStoppedYou, whatCouldGoWrong });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
          <AlertTriangle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'אתגרים ומכשולים' : 'Challenges & Obstacles'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'בוא נזהה את מה שעוצר אותך' : "Let's identify what's holding you back"}
        </p>
      </motion.div>

      {/* Fears */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה הפחדים והחששות שלך?' : 'What are your fears and concerns?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {fearOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleFear(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  fears.includes(option.id)
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-border hover:border-orange-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {fears.includes(option.id) && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What stopped you */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה עצר אותך עד עכשיו?' : 'What has stopped you until now?'}
          </h3>
          <Textarea
            value={whatStoppedYou}
            onChange={(e) => setWhatStoppedYou(e.target.value)}
            placeholder={language === 'he' ? 'תאר מה מנע ממך להתחיל או להתקדם...' : 'Describe what prevented you from starting or progressing...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Blockers */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה החסמים והמגבלות?' : 'What are the blockers and limitations?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {blockerOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleBlocker(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  blockers.includes(option.id)
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-border hover:border-orange-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {blockers.includes(option.id) && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What could go wrong */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה יכול להשתבש?' : 'What could go wrong?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'אופציונלי - התמודדות מראש עם תרחישים' : 'Optional - addressing scenarios in advance'}
          </p>
          <Textarea
            value={whatCouldGoWrong}
            onChange={(e) => setWhatCouldGoWrong(e.target.value)}
            placeholder={language === 'he' ? 'תאר תרחישים אפשריים...' : 'Describe possible scenarios...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleComplete}
        disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
        size="lg"
      >
        {isCompleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin me-2" />
            {language === 'he' ? 'שומר...' : 'Saving...'}
          </>
        ) : (
          language === 'he' ? 'המשך' : 'Continue'
        )}
      </Button>
    </div>
  );
}

export default ChallengesStep;
