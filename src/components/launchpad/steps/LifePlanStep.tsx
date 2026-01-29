import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Gift, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LifePlanStepProps {
  onComplete: (data: { form_submission_id?: string }) => void;
  isCompleting: boolean;
  rewards: { xp: number; tokens: number; unlock: string };
}

interface Section {
  id: string;
  title: string;
  titleEn: string;
  question: string;
  questionEn: string;
  placeholder: string;
  placeholderEn: string;
}

const SECTIONS: Section[] = [
  {
    id: 'vision_3y',
    title: 'חזון 3 שנים',
    titleEn: '3-Year Vision',
    question: 'איך נראים החיים שלך בעוד 3 שנים?',
    questionEn: 'What does your life look like in 3 years?',
    placeholder: 'תאר את החיים שאתה רוצה - עבודה, מערכות יחסים, בריאות, מקום מגורים...',
    placeholderEn: 'Describe the life you want - work, relationships, health, living situation...',
  },
  {
    id: 'goals_12m',
    title: '12 חודשים',
    titleEn: '12 Months',
    question: 'מה חייב לקרות השנה כדי שתרגיש שהתקדמת?',
    questionEn: 'What must happen this year for you to feel you\'ve progressed?',
    placeholder: 'רשום 2-3 דברים קונקרטיים שאתה רוצה להשיג בשנה הקרובה...',
    placeholderEn: 'List 2-3 concrete things you want to achieve in the next year...',
  },
  {
    id: 'goals_90d',
    title: '90 ימים',
    titleEn: '90 Days',
    question: 'מה היעדים המדידים שלך ל-90 הימים הקרובים?',
    questionEn: 'What are your measurable goals for the next 90 days?',
    placeholder: 'יעדים ספציפיים ומדידים שתוכל לבדוק אם השגת...',
    placeholderEn: 'Specific, measurable goals you can check if achieved...',
  },
  {
    id: 'identity',
    title: 'זהות נדרשת',
    titleEn: 'Required Identity',
    question: 'מי אתה צריך להיות כדי שזה יקרה?',
    questionEn: 'Who do you need to be for this to happen?',
    placeholder: 'אילו תכונות, הרגלים, ואמונות אתה צריך לפתח...',
    placeholderEn: 'What traits, habits, and beliefs do you need to develop...',
  },
  {
    id: 'systems',
    title: 'מערכות חיים',
    titleEn: 'Life Systems',
    question: 'איך נראים השינה, התזונה, התנועה, והעבודה שלך?',
    questionEn: 'What does your sleep, nutrition, movement, and work look like?',
    placeholder: 'תאר את השגרה היומית האידיאלית שלך...',
    placeholderEn: 'Describe your ideal daily routine...',
  },
  {
    id: 'risks',
    title: 'אילוצים וסיכונים',
    titleEn: 'Constraints & Risks',
    question: 'מה עלול להפיל אותך ומה תעשה כשזה יקרה?',
    questionEn: 'What might derail you and what will you do when it happens?',
    placeholder: 'זהה מכשולים אפשריים ותכנן תגובה מראש...',
    placeholderEn: 'Identify possible obstacles and plan your response in advance...',
  },
];

export function LifePlanStep({ onComplete, isCompleting, rewards }: LifePlanStepProps) {
  const { language, isRTL } = useTranslation();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<string[]>(['vision_3y']);

  const toggleSection = (id: string) => {
    setOpenSections(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const completedCount = Object.values(answers).filter(a => a.trim().length >= 20).length;
  const isValid = completedCount >= 3; // At least 3 sections filled

  const handleSubmit = () => {
    if (isValid) {
      // In a real implementation, this would save to form_submissions
      onComplete({});
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <span className="text-3xl">🎯</span>
        </div>
        <h1 className="text-2xl font-bold">
          {language === 'he' ? 'בניית תוכנית חיים' : 'Building Your Life Plan'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === 'he' 
            ? `${completedCount}/6 סעיפים הושלמו (מינימום 3)`
            : `${completedCount}/6 sections completed (minimum 3)`
          }
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section, index) => (
          <Collapsible 
            key={section.id} 
            open={openSections.includes(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between p-4 h-auto rounded-xl border",
                  answers[section.id]?.trim().length >= 20 && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{index + 1}</span>
                  <span className="font-medium">
                    {language === 'he' ? section.title : section.titleEn}
                  </span>
                  {answers[section.id]?.trim().length >= 20 && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </div>
                {openSections.includes(section.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 space-y-3"
              >
                <p className="text-sm font-medium">
                  {language === 'he' ? section.question : section.questionEn}
                </p>
                <Textarea
                  value={answers[section.id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [section.id]: e.target.value }))}
                  placeholder={language === 'he' ? section.placeholder : section.placeholderEn}
                  className="min-h-[100px] resize-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </motion.div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Rewards & Submit */}
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4" />
            <span>+{rewards.xp} XP</span>
          </div>
          {rewards.tokens > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600">
              <Gift className="w-4 h-4" />
              <span>+{rewards.tokens} {language === 'he' ? 'טוקנים' : 'Tokens'}</span>
            </div>
          )}
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
              ? 'מלא לפחות 3 סעיפים (20+ תווים בכל אחד)'
              : 'Fill at least 3 sections (20+ characters each)'
            }
          </p>
        )}
      </div>
    </div>
  );
}

export default LifePlanStep;
