import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Megaphone, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const CHANNEL_OPTIONS = {
  he: [
    { id: 'instagram', label: 'אינסטגרם' }, { id: 'facebook', label: 'פייסבוק' },
    { id: 'linkedin', label: 'לינקדאין' }, { id: 'youtube', label: 'יוטיוב' },
    { id: 'tiktok', label: 'טיקטוק' }, { id: 'podcast', label: 'פודקאסט' },
    { id: 'blog', label: 'בלוג' }, { id: 'referrals', label: 'הפניות' },
    { id: 'networking', label: 'נטוורקינג' }, { id: 'ads', label: 'פרסום ממומן' },
  ],
  en: [
    { id: 'instagram', label: 'Instagram' }, { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' }, { id: 'youtube', label: 'YouTube' },
    { id: 'tiktok', label: 'TikTok' }, { id: 'podcast', label: 'Podcast' },
    { id: 'blog', label: 'Blog' }, { id: 'referrals', label: 'Referrals' },
    { id: 'networking', label: 'Networking' }, { id: 'ads', label: 'Paid Ads' },
  ],
};

export function CoachMarketingStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [channels, setChannels] = useState<string[]>((savedData?.channels as string[]) || []);
  const [contentStrategy, setContentStrategy] = useState<string>((savedData?.contentStrategy as string) || '');
  const [brandMessage, setBrandMessage] = useState<string>((savedData?.brandMessage as string) || '');

  const options = language === 'he' ? CHANNEL_OPTIONS.he : CHANNEL_OPTIONS.en;
  const isValid = channels.length > 0;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ channels, contentStrategy, brandMessage }), 500);
      return () => clearTimeout(timer);
    }
  }, [channels, contentStrategy, brandMessage, onAutoSave]);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Megaphone className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'שיווק' : 'Marketing'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'איך תגיע ללקוחות?' : 'How will you reach clients?'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'ערוצי שיווק' : 'Marketing Channels'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => toggleChannel(option.id)}
              className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-start",
                channels.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
              <div className="flex items-center gap-2">
                {channels.includes(option.id) && <Check className="w-4 h-4 text-orange-500" />}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'אסטרטגיית תוכן' : 'Content Strategy'}</h3>
        <Textarea value={contentStrategy} onChange={(e) => setContentStrategy(e.target.value)}
          placeholder={language === 'he' ? 'איזה תוכן תיצור כדי למשוך לקוחות?' : 'What content will you create to attract clients?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'המסר של המותג שלך' : 'Your Brand Message'}</h3>
        <Textarea value={brandMessage} onChange={(e) => setBrandMessage(e.target.value)}
          placeholder={language === 'he' ? 'מה המסר המרכזי שאתה רוצה להעביר?' : 'What is the core message you want to convey?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Button onClick={() => onComplete({ channels, contentStrategy, brandMessage })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
