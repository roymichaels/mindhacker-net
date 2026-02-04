import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Wrench, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourcesStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const SKILL_OPTIONS = {
  he: [
    { id: 'sales', label: 'מכירות' },
    { id: 'marketing', label: 'שיווק' },
    { id: 'tech', label: 'טכנולוגיה' },
    { id: 'finance', label: 'פיננסים' },
    { id: 'leadership', label: 'מנהיגות' },
    { id: 'communication', label: 'תקשורת' },
    { id: 'creativity', label: 'יצירתיות' },
    { id: 'operations', label: 'תפעול' },
  ],
  en: [
    { id: 'sales', label: 'Sales' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'tech', label: 'Technology' },
    { id: 'finance', label: 'Finance' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'communication', label: 'Communication' },
    { id: 'creativity', label: 'Creativity' },
    { id: 'operations', label: 'Operations' },
  ],
};

const TIME_OPTIONS = {
  he: [
    { id: 'less_10', label: 'פחות מ-10 שעות' },
    { id: '10_20', label: '10-20 שעות' },
    { id: '20_40', label: '20-40 שעות' },
    { id: 'full_time', label: 'משרה מלאה (40+)' },
  ],
  en: [
    { id: 'less_10', label: 'Less than 10 hours' },
    { id: '10_20', label: '10-20 hours' },
    { id: '20_40', label: '20-40 hours' },
    { id: 'full_time', label: 'Full time (40+)' },
  ],
};

const BUDGET_OPTIONS = {
  he: [
    { id: 'none', label: 'אין תקציב' },
    { id: 'up_to_5k', label: 'עד 5,000 ש"ח' },
    { id: '5k_20k', label: '5,000-20,000 ש"ח' },
    { id: '20k_50k', label: '20,000-50,000 ש"ח' },
    { id: 'above_50k', label: 'מעל 50,000 ש"ח' },
  ],
  en: [
    { id: 'none', label: 'No budget' },
    { id: 'up_to_5k', label: 'Up to $1,500' },
    { id: '5k_20k', label: '$1,500-$6,000' },
    { id: '20k_50k', label: '$6,000-$15,000' },
    { id: 'above_50k', label: 'Above $15,000' },
  ],
};

export function ResourcesStep({ onComplete, isCompleting, savedData, onAutoSave }: ResourcesStepProps) {
  const { language, isRTL } = useTranslation();
  const [existingSkills, setExistingSkills] = useState<string[]>((savedData?.existingSkills as string[]) || []);
  const [missingSkills, setMissingSkills] = useState<string[]>((savedData?.missingSkills as string[]) || []);
  const [timeAvailable, setTimeAvailable] = useState<string>((savedData?.timeAvailable as string) || '');
  const [budget, setBudget] = useState<string>((savedData?.budget as string) || '');
  const [connections, setConnections] = useState<string>((savedData?.connections as string) || '');
  const [relevantExperience, setRelevantExperience] = useState<string>((savedData?.relevantExperience as string) || '');

  const skillOptions = language === 'he' ? SKILL_OPTIONS.he : SKILL_OPTIONS.en;
  const timeOptions = language === 'he' ? TIME_OPTIONS.he : TIME_OPTIONS.en;
  const budgetOptions = language === 'he' ? BUDGET_OPTIONS.he : BUDGET_OPTIONS.en;

  const isValid = existingSkills.length > 0 && timeAvailable && budget;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ existingSkills, missingSkills, timeAvailable, budget, connections, relevantExperience });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [existingSkills, missingSkills, timeAvailable, budget, connections, relevantExperience, onAutoSave]);

  const toggleExistingSkill = (id: string) => {
    setExistingSkills(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleMissingSkill = (id: string) => {
    setMissingSkills(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ existingSkills, missingSkills, timeAvailable, budget, connections, relevantExperience });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 mb-4">
          <Wrench className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'משאבים ויכולות' : 'Resources & Capabilities'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'מה יש לך ומה חסר?' : 'What do you have and what is missing?'}
        </p>
      </motion.div>

      {/* Existing Skills */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'כישורים שיש לך' : 'Skills you have'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {skillOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleExistingSkill(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  existingSkills.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {existingSkills.includes(option.id) && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Skills */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'כישורים שחסרים' : 'Skills you need'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {skillOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleMissingSkill(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  missingSkills.includes(option.id)
                    ? "border-orange-500 bg-orange-500/10 text-orange-600"
                    : "border-border hover:border-orange-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {missingSkills.includes(option.id) && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Available */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'כמה זמן יש לך לעסק בשבוע?' : 'How many hours per week for the business?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {timeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTimeAvailable(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  timeAvailable === option.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {timeAvailable === option.id && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'תקציב התחלתי' : 'Starting budget'}
          </h3>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBudget(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  budget === option.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {budget === option.id && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'קשרים וקונטקטים' : 'Connections & Network'}
          </h3>
          <Textarea
            value={connections}
            onChange={(e) => setConnections(e.target.value)}
            placeholder={language === 'he' ? 'תאר את הקשרים העסקיים שיש לך...' : 'Describe your business connections...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Relevant Experience */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'ניסיון רלוונטי' : 'Relevant Experience'}
          </h3>
          <Textarea
            value={relevantExperience}
            onChange={(e) => setRelevantExperience(e.target.value)}
            placeholder={language === 'he' ? 'תאר ניסיון רלוונטי שיש לך...' : 'Describe your relevant experience...'}
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

export default ResourcesStep;
