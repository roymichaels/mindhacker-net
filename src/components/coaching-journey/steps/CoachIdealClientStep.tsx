import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const AGE_OPTIONS = {
  he: [
    { id: '18-25', label: '18-25' }, { id: '25-35', label: '25-35' },
    { id: '35-45', label: '35-45' }, { id: '45-55', label: '45-55' },
    { id: '55+', label: '55+' }, { id: 'all', label: 'כל הגילאים' },
  ],
  en: [
    { id: '18-25', label: '18-25' }, { id: '25-35', label: '25-35' },
    { id: '35-45', label: '35-45' }, { id: '45-55', label: '45-55' },
    { id: '55+', label: '55+' }, { id: 'all', label: 'All Ages' },
  ],
};

export function CoachIdealClientStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [ageGroups, setAgeGroups] = useState<string[]>((savedData?.ageGroups as string[]) || []);
  const [painPoints, setPainPoints] = useState<string>((savedData?.painPoints as string) || '');
  const [desiredOutcome, setDesiredOutcome] = useState<string>((savedData?.desiredOutcome as string) || '');
  const [clientDescription, setClientDescription] = useState<string>((savedData?.clientDescription as string) || '');

  const ages = language === 'he' ? AGE_OPTIONS.he : AGE_OPTIONS.en;
  const isValid = ageGroups.length > 0 && painPoints.trim().length > 5;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ ageGroups, painPoints, desiredOutcome, clientDescription }), 500);
      return () => clearTimeout(timer);
    }
  }, [ageGroups, painPoints, desiredOutcome, clientDescription, onAutoSave]);

  const toggleAge = (id: string) => {
    setAgeGroups(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'הלקוח האידיאלי שלך' : 'Your Ideal Client'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'מי האדם שאתה רוצה לעזור לו?' : 'Who is the person you want to help?'}</p>
      </motion.div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'קבוצת גיל' : 'Age Group'}</h3>
          <div className="grid grid-cols-3 gap-2">
            {ages.map((option) => (
              <button key={option.id} onClick={() => toggleAge(option.id)}
                className={cn("p-2 rounded-lg border text-sm font-medium transition-all",
                  ageGroups.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'נקודות הכאב שלהם' : 'Their Pain Points'}</h3>
          <Textarea value={painPoints} onChange={(e) => setPainPoints(e.target.value)}
            placeholder={language === 'he' ? 'מה הבעיות שהמתאמנים שלך מתמודדים איתן?' : 'What problems do your coachees face?'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'התוצאה הרצויה' : 'Desired Outcome'}</h3>
          <Textarea value={desiredOutcome} onChange={(e) => setDesiredOutcome(e.target.value)}
            placeholder={language === 'he' ? 'מה הם רוצים להשיג?' : 'What do they want to achieve?'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'תאר את הלקוח האידיאלי' : 'Describe your ideal client'}</h3>
          <Textarea value={clientDescription} onChange={(e) => setClientDescription(e.target.value)}
            placeholder={language === 'he' ? 'תאר בכמה משפטים את הלקוח המושלם שלך...' : 'Describe your perfect client in a few sentences...'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Button onClick={() => onComplete({ ageGroups, painPoints, desiredOutcome, clientDescription })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
