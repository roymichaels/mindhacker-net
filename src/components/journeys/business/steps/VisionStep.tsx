import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisionStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const WHY_OPTIONS = {
  he: [
    { id: 'financial_freedom', label: 'חופש כלכלי' },
    { id: 'independence', label: 'עצמאות' },
    { id: 'dream', label: 'מימוש חלום' },
    { id: 'help_others', label: 'עזרה לאחרים' },
    { id: 'escape_job', label: 'בריחה מעבודה שכירה' },
    { id: 'legacy', label: 'יצירת מורשת' },
  ],
  en: [
    { id: 'financial_freedom', label: 'Financial Freedom' },
    { id: 'independence', label: 'Independence' },
    { id: 'dream', label: 'Fulfill a Dream' },
    { id: 'help_others', label: 'Help Others' },
    { id: 'escape_job', label: 'Escape Corporate Job' },
    { id: 'legacy', label: 'Create a Legacy' },
  ],
};

const SUCCESS_OPTIONS = {
  he: [
    { id: 'high_income', label: 'הכנסה גבוהה' },
    { id: 'time_flexibility', label: 'גמישות בזמן' },
    { id: 'impact', label: 'השפעה על אחרים' },
    { id: 'growth', label: 'צמיחה אישית' },
    { id: 'reputation', label: 'מוניטין וכבוד' },
    { id: 'work_with_loved', label: 'עבודה עם אנשים שאני אוהב' },
  ],
  en: [
    { id: 'high_income', label: 'High Income' },
    { id: 'time_flexibility', label: 'Time Flexibility' },
    { id: 'impact', label: 'Impact on Others' },
    { id: 'growth', label: 'Personal Growth' },
    { id: 'reputation', label: 'Reputation & Respect' },
    { id: 'work_with_loved', label: 'Work with People I Love' },
  ],
};

const EXPERIENCE_OPTIONS = {
  he: [
    { id: 'first_time', label: 'ראשון בחיים' },
    { id: 'tried_failed', label: 'ניסיתי בעבר ונכשלתי' },
    { id: 'have_small', label: 'יש לי עסק קטן כיום' },
    { id: 'managed_before', label: 'ניהלתי עסק בעבר' },
    { id: 'multiple', label: 'יש לי מספר עסקים' },
  ],
  en: [
    { id: 'first_time', label: 'First Time Ever' },
    { id: 'tried_failed', label: 'Tried Before & Failed' },
    { id: 'have_small', label: 'I Have a Small Business Now' },
    { id: 'managed_before', label: 'Managed a Business Before' },
    { id: 'multiple', label: 'I Have Multiple Businesses' },
  ],
};

export function VisionStep({ onComplete, isCompleting, savedData, onAutoSave }: VisionStepProps) {
  const { language, isRTL } = useTranslation();
  const [selectedWhy, setSelectedWhy] = useState<string[]>((savedData?.why as string[]) || []);
  const [vision, setVision] = useState<string>((savedData?.vision as string) || '');
  const [selectedSuccess, setSelectedSuccess] = useState<string[]>((savedData?.success as string[]) || []);
  const [experience, setExperience] = useState<string>((savedData?.experience as string) || '');

  const whyOptions = language === 'he' ? WHY_OPTIONS.he : WHY_OPTIONS.en;
  const successOptions = language === 'he' ? SUCCESS_OPTIONS.he : SUCCESS_OPTIONS.en;
  const experienceOptions = language === 'he' ? EXPERIENCE_OPTIONS.he : EXPERIENCE_OPTIONS.en;

  const isValid = selectedWhy.length > 0 && vision.trim() && selectedSuccess.length > 0 && experience;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ why: selectedWhy, vision, success: selectedSuccess, experience });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedWhy, vision, selectedSuccess, experience, onAutoSave]);

  const toggleWhy = (id: string) => {
    setSelectedWhy(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSuccess = (id: string) => {
    setSelectedSuccess(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ why: selectedWhy, vision, success: selectedSuccess, experience });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
          <Target className="w-8 h-8 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'חזון ומטרה' : 'Vision & Goals'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'בוא נבין למה אתה רוצה להקים עסק' : "Let's understand why you want to start a business"}
        </p>
      </motion.div>

      {/* Why do you want a business? */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'למה אתה רוצה להקים עסק?' : 'Why do you want to start a business?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'בחר את כל מה שרלוונטי' : 'Select all that apply'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {whyOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleWhy(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  selectedWhy.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedWhy.includes(option.id) && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5-year vision */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה החזון שלך לעסק ב-5 שנים?' : 'What is your 5-year vision for the business?'}
          </h3>
          <Textarea
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            placeholder={language === 'he' ? 'תאר את החזון שלך...' : 'Describe your vision...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Success definition */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'איך נראית הצלחה בשבילך?' : 'What does success look like for you?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {successOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleSuccess(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  selectedSuccess.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {selectedSuccess.includes(option.id) && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Business experience */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה הניסיון העסקי שלך?' : 'What is your business experience?'}
          </h3>
          <div className="space-y-2">
            {experienceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExperience(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  experience === option.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {experience === option.id && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
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
          language === 'he' ? 'המשך' : 'Continue'
        )}
      </Button>
    </div>
  );
}

export default VisionStep;
