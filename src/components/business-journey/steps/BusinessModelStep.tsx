import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Briefcase, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessModelStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const BUSINESS_TYPE_OPTIONS = {
  he: [
    { id: 'product', label: 'מוצר', desc: 'מוצר פיזי או דיגיטלי' },
    { id: 'service', label: 'שירות', desc: 'ייעוץ, אימון, או שירות מקצועי' },
    { id: 'hybrid', label: 'היברידי', desc: 'שילוב של מוצרים ושירותים' },
  ],
  en: [
    { id: 'product', label: 'Product', desc: 'Physical or digital product' },
    { id: 'service', label: 'Service', desc: 'Consulting, coaching, or professional service' },
    { id: 'hybrid', label: 'Hybrid', desc: 'Combination of products and services' },
  ],
};

const REVENUE_MODEL_OPTIONS = {
  he: [
    { id: 'one_time', label: 'חד פעמי', desc: 'תשלום חד פעמי לכל מכירה' },
    { id: 'subscription', label: 'מנוי', desc: 'תשלום חודשי/שנתי קבוע' },
    { id: 'commission', label: 'עמלה', desc: 'אחוז מכל עסקה' },
    { id: 'freemium', label: 'פרימיום', desc: 'בסיס חינמי + תכונות בתשלום' },
    { id: 'hourly', label: 'לפי שעה', desc: 'חיוב לפי זמן עבודה' },
  ],
  en: [
    { id: 'one_time', label: 'One-Time', desc: 'Single payment per sale' },
    { id: 'subscription', label: 'Subscription', desc: 'Monthly/yearly recurring payment' },
    { id: 'commission', label: 'Commission', desc: 'Percentage of each transaction' },
    { id: 'freemium', label: 'Freemium', desc: 'Free base + paid features' },
    { id: 'hourly', label: 'Hourly', desc: 'Charge by time worked' },
  ],
};

const EXISTING_BUSINESS_OPTIONS = {
  he: [
    { id: 'no', label: 'לא, זה עסק חדש לגמרי' },
    { id: 'yes_improve', label: 'כן, יש לי עסק ואני רוצה לשפר אותו' },
    { id: 'yes_pivot', label: 'כן, יש לי עסק ואני רוצה לשנות כיוון' },
  ],
  en: [
    { id: 'no', label: 'No, this is a completely new business' },
    { id: 'yes_improve', label: 'Yes, I have a business and want to improve it' },
    { id: 'yes_pivot', label: 'Yes, I have a business and want to pivot' },
  ],
};

export function BusinessModelStep({ onComplete, isCompleting, savedData, onAutoSave }: BusinessModelStepProps) {
  const { language, isRTL } = useTranslation();
  const [businessType, setBusinessType] = useState<string>((savedData?.businessType as string) || '');
  const [revenueModel, setRevenueModel] = useState<string[]>((savedData?.revenueModel as string[]) || []);
  const [existingBusiness, setExistingBusiness] = useState<string>((savedData?.existingBusiness as string) || '');
  const [industry, setIndustry] = useState<string>((savedData?.industry as string) || '');

  const typeOptions = language === 'he' ? BUSINESS_TYPE_OPTIONS.he : BUSINESS_TYPE_OPTIONS.en;
  const revenueOptions = language === 'he' ? REVENUE_MODEL_OPTIONS.he : REVENUE_MODEL_OPTIONS.en;
  const existingOptions = language === 'he' ? EXISTING_BUSINESS_OPTIONS.he : EXISTING_BUSINESS_OPTIONS.en;

  const isValid = businessType && revenueModel.length > 0 && existingBusiness && industry.trim();

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ businessType, revenueModel, existingBusiness, industry });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [businessType, revenueModel, existingBusiness, industry, onAutoSave]);

  const toggleRevenueModel = (id: string) => {
    setRevenueModel(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ businessType, revenueModel, existingBusiness, industry });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
          <Briefcase className="w-8 h-8 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'מודל עסקי' : 'Business Model'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'איזה סוג עסק אתה רוצה לבנות?' : 'What type of business do you want to build?'}
        </p>
      </motion.div>

      {/* Business Type */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'סוג העסק' : 'Business Type'}
          </h3>
          <div className="space-y-2">
            {typeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setBusinessType(option.id)}
                className={cn(
                  "w-full p-4 rounded-lg border text-start transition-all",
                  businessType === option.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {businessType === option.id && <Check className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Model */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מודל הכנסות' : 'Revenue Model'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'בחר את כל מה שרלוונטי' : 'Select all that apply'}
          </p>
          <div className="space-y-2">
            {revenueOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleRevenueModel(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-start transition-all",
                  revenueModel.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-3">
                  {revenueModel.includes(option.id) && <Check className="w-4 h-4 text-amber-500" />}
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Business */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'האם יש לך עסק קיים?' : 'Do you have an existing business?'}
          </h3>
          <div className="space-y-2">
            {existingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setExistingBusiness(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  existingBusiness === option.id
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {existingBusiness === option.id && <Check className="w-4 h-4 text-amber-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'באיזה תחום/תעשייה?' : 'What industry/field?'}
          </h3>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder={language === 'he' ? 'לדוגמה: טכנולוגיה, בריאות, חינוך...' : 'e.g., Technology, Health, Education...'}
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

export default BusinessModelStep;
