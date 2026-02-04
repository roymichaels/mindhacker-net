import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const INCOME_TARGET_OPTIONS = {
  he: [
    { id: 'up_to_10k', label: 'עד 10,000 ש"ח' },
    { id: '10k_30k', label: '10,000-30,000 ש"ח' },
    { id: '30k_50k', label: '30,000-50,000 ש"ח' },
    { id: '50k_100k', label: '50,000-100,000 ש"ח' },
    { id: 'above_100k', label: 'מעל 100,000 ש"ח' },
  ],
  en: [
    { id: 'up_to_10k', label: 'Up to $3,000' },
    { id: '10k_30k', label: '$3,000-$9,000' },
    { id: '30k_50k', label: '$9,000-$15,000' },
    { id: '50k_100k', label: '$15,000-$30,000' },
    { id: 'above_100k', label: 'Above $30,000' },
  ],
};

const BREAK_EVEN_OPTIONS = {
  he: [
    { id: '1_3_months', label: '1-3 חודשים' },
    { id: '3_6_months', label: '3-6 חודשים' },
    { id: '6_12_months', label: '6-12 חודשים' },
    { id: '1_2_years', label: '1-2 שנים' },
    { id: 'unknown', label: 'לא בטוח' },
  ],
  en: [
    { id: '1_3_months', label: '1-3 months' },
    { id: '3_6_months', label: '3-6 months' },
    { id: '6_12_months', label: '6-12 months' },
    { id: '1_2_years', label: '1-2 years' },
    { id: 'unknown', label: 'Not sure' },
  ],
};

const FUNDING_OPTIONS = {
  he: [
    { id: 'self', label: 'מימון עצמי' },
    { id: 'family', label: 'משפחה וחברים' },
    { id: 'bank', label: 'הלוואה בנקאית' },
    { id: 'investors', label: 'משקיעים' },
    { id: 'grants', label: 'מענקים' },
    { id: 'crowdfunding', label: 'מימון המונים' },
  ],
  en: [
    { id: 'self', label: 'Self-funded' },
    { id: 'family', label: 'Family & Friends' },
    { id: 'bank', label: 'Bank Loan' },
    { id: 'investors', label: 'Investors' },
    { id: 'grants', label: 'Grants' },
    { id: 'crowdfunding', label: 'Crowdfunding' },
  ],
};

export function FinancialStep({ onComplete, isCompleting, savedData, onAutoSave }: FinancialStepProps) {
  const { language, isRTL } = useTranslation();
  const [incomeTarget, setIncomeTarget] = useState<string>((savedData?.incomeTarget as string) || '');
  const [expectedCosts, setExpectedCosts] = useState<string>((savedData?.expectedCosts as string) || '');
  const [pricing, setPricing] = useState<string>((savedData?.pricing as string) || '');
  const [fundingSources, setFundingSources] = useState<string[]>((savedData?.fundingSources as string[]) || []);
  const [breakEven, setBreakEven] = useState<string>((savedData?.breakEven as string) || '');
  const [firstYearGoals, setFirstYearGoals] = useState<string>((savedData?.firstYearGoals as string) || '');

  const incomeOptions = language === 'he' ? INCOME_TARGET_OPTIONS.he : INCOME_TARGET_OPTIONS.en;
  const breakEvenOptions = language === 'he' ? BREAK_EVEN_OPTIONS.he : BREAK_EVEN_OPTIONS.en;
  const fundingOptions = language === 'he' ? FUNDING_OPTIONS.he : FUNDING_OPTIONS.en;

  const isValid = incomeTarget && breakEven && fundingSources.length > 0;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ incomeTarget, expectedCosts, pricing, fundingSources, breakEven, firstYearGoals });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [incomeTarget, expectedCosts, pricing, fundingSources, breakEven, firstYearGoals, onAutoSave]);

  const toggleFunding = (id: string) => {
    setFundingSources(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ incomeTarget, expectedCosts, pricing, fundingSources, breakEven, firstYearGoals });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'תכנון פיננסי' : 'Financial Planning'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'בוא נתכנן את הצד הכלכלי' : "Let's plan the financial side"}
        </p>
      </motion.div>

      {/* Income Target */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'יעד הכנסה חודשי' : 'Monthly income target'}
          </h3>
          <div className="space-y-2">
            {incomeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setIncomeTarget(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  incomeTarget === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {incomeTarget === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expected Costs */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'עלויות צפויות' : 'Expected costs'}
          </h3>
          <Textarea
            value={expectedCosts}
            onChange={(e) => setExpectedCosts(e.target.value)}
            placeholder={language === 'he' ? 'פרט את העלויות הצפויות...' : 'Detail your expected costs...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'תמחור מתוכנן' : 'Planned pricing'}
          </h3>
          <Input
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            placeholder={language === 'he' ? 'לדוגמה: 500 ש"ח לשעה, 2000 ש"ח לפרויקט...' : 'e.g., $150/hour, $600/project...'}
          />
        </CardContent>
      </Card>

      {/* Funding Sources */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מקורות מימון' : 'Funding sources'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {fundingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleFunding(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  fundingSources.includes(option.id)
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {fundingSources.includes(option.id) && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Break Even */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'נקודת איזון צפויה' : 'Expected break-even'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {breakEvenOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBreakEven(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  breakEven === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {breakEven === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* First Year Goals */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'יעדים לשנה הראשונה' : 'First year goals'}
          </h3>
          <Textarea
            value={firstYearGoals}
            onChange={(e) => setFirstYearGoals(e.target.value)}
            placeholder={language === 'he' ? 'מה אתה רוצה להשיג בשנה הראשונה...' : 'What do you want to achieve in the first year...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleComplete}
        disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
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

export default FinancialStep;
