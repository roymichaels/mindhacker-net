import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { DollarSign, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const SERVICE_TYPES = {
  he: [
    { id: 'one_on_one', label: 'אימון אישי 1:1' },
    { id: 'group', label: 'אימון קבוצתי' },
    { id: 'multi_session', label: 'תהליך של כמה מפגשים' },
    { id: 'workshops', label: 'סדנאות' },
    { id: 'online_course', label: 'קורס דיגיטלי' },
    { id: 'vip_day', label: 'יום VIP אינטנסיבי' },
    { id: 'membership', label: 'מנוי חודשי' },
  ],
  en: [
    { id: 'one_on_one', label: '1:1 Coaching' },
    { id: 'group', label: 'Group Coaching' },
    { id: 'multi_session', label: 'Multi-Session Process' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'online_course', label: 'Online Course' },
    { id: 'vip_day', label: 'VIP Intensive Day' },
    { id: 'membership', label: 'Monthly Membership' },
  ],
};

export function CoachServicesStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [services, setServices] = useState<string[]>((savedData?.services as string[]) || []);
  const [pricing, setPricing] = useState<string>((savedData?.pricing as string) || '');
  const [sessionLength, setSessionLength] = useState<string>((savedData?.sessionLength as string) || '');
  const [packages, setPackages] = useState<string>((savedData?.packages as string) || '');

  const options = language === 'he' ? SERVICE_TYPES.he : SERVICE_TYPES.en;
  const isValid = services.length > 0;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ services, pricing, sessionLength, packages }), 500);
      return () => clearTimeout(timer);
    }
  }, [services, pricing, sessionLength, packages, onAutoSave]);

  const toggleService = (id: string) => {
    setServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'שירותים ותמחור' : 'Services & Pricing'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'מה תציע ובכמה?' : 'What will you offer and at what price?'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'סוגי שירותים' : 'Service Types'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => toggleService(option.id)}
              className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-start",
                services.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
              <div className="flex items-center gap-2">
                {services.includes(option.id) && <Check className="w-4 h-4 text-orange-500" />}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'אורך מפגש' : 'Session Length'}</h3>
        <Input value={sessionLength} onChange={(e) => setSessionLength(e.target.value)}
          placeholder={language === 'he' ? 'למשל: 60 דקות' : 'e.g., 60 minutes'} />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'תמחור' : 'Pricing'}</h3>
        <Textarea value={pricing} onChange={(e) => setPricing(e.target.value)}
          placeholder={language === 'he' ? 'תאר את מחירי השירותים שלך...' : 'Describe your service pricing...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'חבילות (אופציונלי)' : 'Packages (optional)'}</h3>
        <Textarea value={packages} onChange={(e) => setPackages(e.target.value)}
          placeholder={language === 'he' ? 'תאר את החבילות שלך...' : 'Describe your packages...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Button onClick={() => onComplete({ services, pricing, sessionLength, packages })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
