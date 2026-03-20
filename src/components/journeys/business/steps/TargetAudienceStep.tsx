import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TargetAudienceStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const CUSTOMER_TYPE_OPTIONS = {
  he: [
    { id: 'small_business', label: 'בעלי עסקים קטנים' },
    { id: 'executives', label: 'מנהלים בכירים' },
    { id: 'entrepreneurs', label: 'יזמים' },
    { id: 'freelancers', label: 'עצמאים' },
    { id: 'individuals', label: 'אנשים פרטיים' },
    { id: 'corporations', label: 'חברות גדולות' },
    { id: 'startups', label: 'סטארטאפים' },
  ],
  en: [
    { id: 'small_business', label: 'Small Business Owners' },
    { id: 'executives', label: 'Senior Executives' },
    { id: 'entrepreneurs', label: 'Entrepreneurs' },
    { id: 'freelancers', label: 'Freelancers' },
    { id: 'individuals', label: 'Private Individuals' },
    { id: 'corporations', label: 'Large Corporations' },
    { id: 'startups', label: 'Startups' },
  ],
};

const CHANNEL_OPTIONS = {
  he: [
    { id: 'facebook', label: 'פייסבוק' },
    { id: 'instagram', label: 'אינסטגרם' },
    { id: 'linkedin', label: 'לינקדאין' },
    { id: 'google', label: 'גוגל' },
    { id: 'events', label: 'אירועים פיזיים' },
    { id: 'referrals', label: 'המלצות מפה לאוזן' },
    { id: 'whatsapp', label: 'קבוצות ווטסאפ' },
    { id: 'tiktok', label: 'טיקטוק' },
  ],
  en: [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'google', label: 'Google' },
    { id: 'events', label: 'Physical Events' },
    { id: 'referrals', label: 'Word of Mouth' },
    { id: 'whatsapp', label: 'WhatsApp Groups' },
    { id: 'tiktok', label: 'TikTok' },
  ],
};

const BUDGET_OPTIONS = {
  he: [
    { id: 'up_to_500', label: 'עד 500 ש"ח' },
    { id: '500_2000', label: '500-2,000 ש"ח' },
    { id: '2000_10000', label: '2,000-10,000 ש"ח' },
    { id: '10000_50000', label: '10,000-50,000 ש"ח' },
    { id: 'above_50000', label: 'מעל 50,000 ש"ח' },
  ],
  en: [
    { id: 'up_to_500', label: 'Up to $150' },
    { id: '500_2000', label: '$150-$600' },
    { id: '2000_10000', label: '$600-$3,000' },
    { id: '10000_50000', label: '$3,000-$15,000' },
    { id: 'above_50000', label: 'Above $15,000' },
  ],
};

export function TargetAudienceStep({ onComplete, isCompleting, savedData, onAutoSave }: TargetAudienceStepProps) {
  const { language, isRTL } = useTranslation();
  const [customerTypes, setCustomerTypes] = useState<string[]>((savedData?.customerTypes as string[]) || []);
  const [channels, setChannels] = useState<string[]>((savedData?.channels as string[]) || []);
  const [budget, setBudget] = useState<string>((savedData?.budget as string) || '');
  const [painPoints, setPainPoints] = useState<string>((savedData?.painPoints as string) || '');

  const customerOptions = language === 'he' ? CUSTOMER_TYPE_OPTIONS.he : CUSTOMER_TYPE_OPTIONS.en;
  const channelOptions = language === 'he' ? CHANNEL_OPTIONS.he : CHANNEL_OPTIONS.en;
  const budgetOptions = language === 'he' ? BUDGET_OPTIONS.he : BUDGET_OPTIONS.en;

  const isValid = customerTypes.length > 0 && channels.length > 0 && budget && painPoints.trim();

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ customerTypes, channels, budget, painPoints });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [customerTypes, channels, budget, painPoints, onAutoSave]);

  const toggleCustomerType = (id: string) => {
    setCustomerTypes(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleChannel = (id: string) => {
    setChannels(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ customerTypes, channels, budget, painPoints });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mb-4">
          <Users className="w-8 h-8 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'קהל יעד' : 'Target Audience'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'מי הלקוחות שלך ואיפה למצוא אותם?' : 'Who are your customers and where to find them?'}
        </p>
      </motion.div>

      {/* Customer Types */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מי הלקוח האידיאלי שלך?' : 'Who is your ideal customer?'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'he' ? 'בחר את כל מה שרלוונטי' : 'Select all that apply'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {customerOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleCustomerType(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  customerTypes.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {customerTypes.includes(option.id) && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pain Points */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'מה הבעיות שהלקוחות שלך חווים?' : 'What problems do your customers experience?'}
          </h3>
          <Textarea
            value={painPoints}
            onChange={(e) => setPainPoints(e.target.value)}
            placeholder={language === 'he' ? 'תאר את הכאבים והבעיות של הלקוחות...' : 'Describe the pain points and problems...'}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Where are customers? */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'איפה הלקוחות שלך נמצאים?' : 'Where are your customers?'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {channelOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleChannel(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  channels.includes(option.id)
                    ? "border-amber-500 bg-amber-500/10 text-amber-600"
                    : "border-border hover:border-amber-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {channels.includes(option.id) && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
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
            {language === 'he' ? 'מה תקציב הלקוח הממוצע?' : 'What is the average customer budget?'}
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

export default TargetAudienceStep;
