import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Megaphone, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketingStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const CHANNEL_OPTIONS = {
  he: [
    { id: 'facebook_ads', label: 'פרסום בפייסבוק' },
    { id: 'google_ads', label: 'פרסום בגוגל' },
    { id: 'instagram', label: 'אינסטגרם אורגני' },
    { id: 'linkedin', label: 'לינקדאין' },
    { id: 'content', label: 'שיווק תוכן' },
    { id: 'email', label: 'שיווק במייל' },
    { id: 'seo', label: 'קידום אורגני (SEO)' },
    { id: 'referrals', label: 'תוכנית הפניות' },
    { id: 'events', label: 'אירועים והרצאות' },
    { id: 'influencers', label: 'משפיענים' },
  ],
  en: [
    { id: 'facebook_ads', label: 'Facebook Ads' },
    { id: 'google_ads', label: 'Google Ads' },
    { id: 'instagram', label: 'Organic Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'content', label: 'Content Marketing' },
    { id: 'email', label: 'Email Marketing' },
    { id: 'seo', label: 'SEO' },
    { id: 'referrals', label: 'Referral Program' },
    { id: 'events', label: 'Events & Speaking' },
    { id: 'influencers', label: 'Influencers' },
  ],
};

const BUDGET_OPTIONS = {
  he: [
    { id: 'none', label: 'אין תקציב - רק אורגני' },
    { id: 'up_to_1k', label: 'עד 1,000 ש"ח לחודש' },
    { id: '1k_5k', label: '1,000-5,000 ש"ח לחודש' },
    { id: '5k_10k', label: '5,000-10,000 ש"ח לחודש' },
    { id: 'above_10k', label: 'מעל 10,000 ש"ח לחודש' },
  ],
  en: [
    { id: 'none', label: 'No budget - organic only' },
    { id: 'up_to_1k', label: 'Up to $300/month' },
    { id: '1k_5k', label: '$300-$1,500/month' },
    { id: '5k_10k', label: '$1,500-$3,000/month' },
    { id: 'above_10k', label: 'Above $3,000/month' },
  ],
};

const PRESENCE_OPTIONS = {
  he: [
    { id: 'none', label: 'אין נוכחות כלל' },
    { id: 'personal', label: 'יש פרופילים אישיים' },
    { id: 'business_basic', label: 'יש עמודים עסקיים בסיסיים' },
    { id: 'business_active', label: 'יש עמודים עסקיים פעילים' },
    { id: 'website', label: 'יש אתר אינטרנט' },
  ],
  en: [
    { id: 'none', label: 'No presence at all' },
    { id: 'personal', label: 'Personal profiles only' },
    { id: 'business_basic', label: 'Basic business pages' },
    { id: 'business_active', label: 'Active business pages' },
    { id: 'website', label: 'Have a website' },
  ],
};

export function MarketingStep({ onComplete, isCompleting, savedData, onAutoSave }: MarketingStepProps) {
  const { language, isRTL } = useTranslation();
  const [channels, setChannels] = useState<string[]>((savedData?.channels as string[]) || []);
  const [marketingBudget, setMarketingBudget] = useState<string>((savedData?.marketingBudget as string) || '');
  const [currentPresence, setCurrentPresence] = useState<string>((savedData?.currentPresence as string) || '');
  const [contentStrategy, setContentStrategy] = useState<string>((savedData?.contentStrategy as string) || '');
  const [salesProcess, setSalesProcess] = useState<string>((savedData?.salesProcess as string) || '');
  const [brandDescription, setBrandDescription] = useState<string>((savedData?.brandDescription as string) || '');

  const channelOptions = language === 'he' ? CHANNEL_OPTIONS.he : CHANNEL_OPTIONS.en;
  const budgetOptions = language === 'he' ? BUDGET_OPTIONS.he : BUDGET_OPTIONS.en;
  const presenceOptions = language === 'he' ? PRESENCE_OPTIONS.he : PRESENCE_OPTIONS.en;

  const isValid = channels.length > 0 && marketingBudget && currentPresence;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ channels, marketingBudget, currentPresence, contentStrategy, salesProcess, brandDescription });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [channels, marketingBudget, currentPresence, contentStrategy, salesProcess, brandDescription, onAutoSave]);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleComplete = () => {
    if (!isValid) return;
    onComplete({ channels, marketingBudget, currentPresence, contentStrategy, salesProcess, brandDescription });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
          <Megaphone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">
          {language === 'he' ? 'שיווק ומכירות' : 'Marketing & Sales'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'he' ? 'איך תגיע ללקוחות ותמכור להם?' : 'How will you reach and sell to customers?'}
        </p>
      </motion.div>

      {/* Marketing Channels */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'ערוצי שיווק מתוכננים' : 'Planned marketing channels'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {channelOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleChannel(option.id)}
                className={cn(
                  "p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  channels.includes(option.id)
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {channels.includes(option.id) && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Budget */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'תקציב שיווק' : 'Marketing budget'}
          </h3>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setMarketingBudget(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  marketingBudget === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {marketingBudget === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Presence */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'נוכחות דיגיטלית נוכחית' : 'Current digital presence'}
          </h3>
          <div className="space-y-2">
            {presenceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setCurrentPresence(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  currentPresence === option.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                    : "border-border hover:border-emerald-500/50"
                )}
              >
                <div className="flex items-center gap-2">
                  {currentPresence === option.id && <Check className="w-4 h-4 text-emerald-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Strategy */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'אסטרטגיית תוכן' : 'Content strategy'}
          </h3>
          <Textarea
            value={contentStrategy}
            onChange={(e) => setContentStrategy(e.target.value)}
            placeholder={language === 'he' ? 'איזה תוכן אתה מתכנן ליצור...' : 'What content do you plan to create...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Sales Process */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'תהליך מכירה' : 'Sales process'}
          </h3>
          <Textarea
            value={salesProcess}
            onChange={(e) => setSalesProcess(e.target.value)}
            placeholder={language === 'he' ? 'תאר את תהליך המכירה שלך...' : 'Describe your sales process...'}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Brand */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">
            {language === 'he' ? 'בניית מותג' : 'Brand building'}
          </h3>
          <Textarea
            value={brandDescription}
            onChange={(e) => setBrandDescription(e.target.value)}
            placeholder={language === 'he' ? 'תאר את המותג שאתה רוצה לבנות...' : 'Describe the brand you want to build...'}
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

export default MarketingStep;
