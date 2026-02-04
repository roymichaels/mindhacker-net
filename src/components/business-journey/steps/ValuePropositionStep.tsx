import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Gem, Loader2 } from 'lucide-react';

interface ValuePropositionStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

export function ValuePropositionStep({ onComplete, isCompleting, savedData, onAutoSave }: ValuePropositionStepProps) {
  const { language, isRTL } = useTranslation();
  const [uniqueness, setUniqueness] = useState<string>((savedData?.uniqueness as string) || '');
  const [problemSolved, setProblemSolved] = useState<string>((savedData?.problemSolved as string) || '');
  const [whyChooseYou, setWhyChooseYou] = useState<string>((savedData?.whyChooseYou as string) || '');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState<string>((savedData?.competitiveAdvantage as string) || '');

  const isValid = uniqueness.trim() && problemSolved.trim() && whyChooseYou.trim();

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ uniqueness, problemSolved, whyChooseYou, competitiveAdvantage });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [uniqueness, problemSolved, whyChooseYou, competitiveAdvantage, onAutoSave]);

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ uniqueness, problemSolved, whyChooseYou, competitiveAdvantage });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
          <Gem className="w-8 h-8 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'הצעת ערך ייחודית' : 'Unique Value Proposition'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'מה מייחד אותך מהמתחרים?' : 'What makes you unique?'}
        </p>
      </motion.div>

      {/* Uniqueness */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה מייחד אותך מהמתחרים?' : 'What makes you different from competitors?'}
          </h3>
          <Textarea
            value={uniqueness}
            onChange={(e) => setUniqueness(e.target.value)}
            placeholder={language === 'he' ? 'תאר את הייחודיות שלך...' : 'Describe your uniqueness...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Problem Solved */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה הבעיה שאתה פותר?' : 'What problem do you solve?'}
          </h3>
          <Textarea
            value={problemSolved}
            onChange={(e) => setProblemSolved(e.target.value)}
            placeholder={language === 'he' ? 'תאר את הבעיה והפתרון שלך...' : 'Describe the problem and your solution...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Why Choose You */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'למה לבחור בך?' : 'Why should they choose you?'}
          </h3>
          <Textarea
            value={whyChooseYou}
            onChange={(e) => setWhyChooseYou(e.target.value)}
            placeholder={language === 'he' ? 'מה הסיבות העיקריות לבחור בך...' : 'What are the main reasons to choose you...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Competitive Advantage */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה היתרון התחרותי שלך?' : 'What is your competitive advantage?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'אופציונלי - אם יש לך יתרון ברור' : 'Optional - if you have a clear advantage'}
          </p>
          <Textarea
            value={competitiveAdvantage}
            onChange={(e) => setCompetitiveAdvantage(e.target.value)}
            placeholder={language === 'he' ? 'תאר את היתרון התחרותי שלך...' : 'Describe your competitive advantage...'}
            className="min-h-[80px]"
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
          language === 'he' ? 'המשך' : 'Continue'
        )}
      </Button>
    </div>
  );
}

export default ValuePropositionStep;
