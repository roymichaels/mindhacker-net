import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const EXP_OPTIONS = {
  he: [
    { id: 'none', label: 'אין ניסיון עדיין' },
    { id: '1-2', label: '1-2 שנים' },
    { id: '3-5', label: '3-5 שנים' },
    { id: '5-10', label: '5-10 שנים' },
    { id: '10+', label: '10+ שנים' },
  ],
  en: [
    { id: 'none', label: 'No experience yet' },
    { id: '1-2', label: '1-2 years' },
    { id: '3-5', label: '3-5 years' },
    { id: '5-10', label: '5-10 years' },
    { id: '10+', label: '10+ years' },
  ],
};

export function CoachCredentialsStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [experience, setExperience] = useState<string>((savedData?.experience as string) || '');
  const [certifications, setCertifications] = useState<string>((savedData?.certifications as string) || '');
  const [background, setBackground] = useState<string>((savedData?.background as string) || '');
  const [clientCount, setClientCount] = useState<string>((savedData?.clientCount as string) || '');

  const options = language === 'he' ? EXP_OPTIONS.he : EXP_OPTIONS.en;
  const isValid = !!experience;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ experience, certifications, background, clientCount }), 500);
      return () => clearTimeout(timer);
    }
  }, [experience, certifications, background, clientCount, onAutoSave]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'ניסיון והסמכות' : 'Experience & Credentials'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'הכישורים והניסיון שלך' : 'Your qualifications and experience'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'ניסיון באימון' : 'Coaching Experience'}</h3>
        <div className="space-y-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => setExperience(option.id)}
              className={cn("w-full p-3 rounded-lg border text-sm font-medium transition-all text-start",
                experience === option.id ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
              <div className="flex items-center gap-2">
                {experience === option.id && <Check className="w-4 h-4 text-orange-500" />}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'הסמכות ותעודות' : 'Certifications'}</h3>
        <Textarea value={certifications} onChange={(e) => setCertifications(e.target.value)}
          placeholder={language === 'he' ? 'רשום את ההסמכות שלך...' : 'List your certifications...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'רקע מקצועי' : 'Professional Background'}</h3>
        <Textarea value={background} onChange={(e) => setBackground(e.target.value)}
          placeholder={language === 'he' ? 'ספר על הרקע שלך...' : 'Tell us about your background...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'כמה לקוחות אימנת?' : 'How many clients have you coached?'}</h3>
        <Input value={clientCount} onChange={(e) => setClientCount(e.target.value)} type="text"
          placeholder={language === 'he' ? 'למשל: 50+' : 'e.g., 50+'} />
      </CardContent></Card>

      <Button onClick={() => onComplete({ experience, certifications, background, clientCount })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
