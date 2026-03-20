import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Compass, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const NICHE_OPTIONS = {
  he: [
    { id: 'life', label: 'אימון חיים', emoji: '🌱' },
    { id: 'consciousness', label: 'אימון תודעתי', emoji: '🔮' },
    { id: 'business', label: 'אימון עסקי', emoji: '💼' },
    { id: 'fitness', label: 'כושר ובריאות', emoji: '💪' },
    { id: 'mental', label: 'בריאות נפשית', emoji: '🧠' },
    { id: 'spiritual', label: 'רוחני / מדיטציה', emoji: '🕉️' },
    { id: 'relationships', label: 'זוגיות ומערכות יחסים', emoji: '❤️' },
    { id: 'career', label: 'קריירה', emoji: '📈' },
    { id: 'martial_arts', label: 'אומנויות לחימה', emoji: '🥋' },
    { id: 'nutrition', label: 'תזונה', emoji: '🥗' },
    { id: 'parenting', label: 'הורות', emoji: '👨‍👩‍👧' },
    { id: 'executive', label: 'אימון מנהלים', emoji: '👔' },
    { id: 'other', label: 'אחר', emoji: '✨' },
  ],
  en: [
    { id: 'life', label: 'Life Coaching', emoji: '🌱' },
    { id: 'consciousness', label: 'Consciousness Coaching', emoji: '🔮' },
    { id: 'business', label: 'Business Coaching', emoji: '💼' },
    { id: 'fitness', label: 'Fitness & Health', emoji: '💪' },
    { id: 'mental', label: 'Mental Health', emoji: '🧠' },
    { id: 'spiritual', label: 'Spiritual / Meditation', emoji: '🕉️' },
    { id: 'relationships', label: 'Relationships', emoji: '❤️' },
    { id: 'career', label: 'Career', emoji: '📈' },
    { id: 'martial_arts', label: 'Martial Arts', emoji: '🥋' },
    { id: 'nutrition', label: 'Nutrition', emoji: '🥗' },
    { id: 'parenting', label: 'Parenting', emoji: '👨‍👩‍👧' },
    { id: 'executive', label: 'Executive Coaching', emoji: '👔' },
    { id: 'other', label: 'Other', emoji: '✨' },
  ],
};

export function CoachNicheStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [niche, setNiche] = useState<string>((savedData?.niche as string) || '');
  const [specialization, setSpecialization] = useState<string>((savedData?.specialization as string) || '');

  const options = language === 'he' ? NICHE_OPTIONS.he : NICHE_OPTIONS.en;
  const isValid = !!niche;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ niche, specialization }), 500);
      return () => clearTimeout(timer);
    }
  }, [niche, specialization, onAutoSave]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Compass className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'נישת האימון שלך' : 'Your Coaching Niche'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'באיזה תחום תתמחה?' : 'What area will you specialize in?'}</p>
      </motion.div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'בחר את הנישה שלך' : 'Choose your niche'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {options.map((option) => (
              <button key={option.id} onClick={() => setNiche(option.id)}
                className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-center",
                  niche === option.id ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">{option.emoji}</span>
                  <span>{option.label}</span>
                  {niche === option.id && <Check className="w-4 h-4 text-orange-500" />}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'התמחות ספציפית' : 'Specific Specialization'}</h3>
          <Textarea value={specialization} onChange={(e) => setSpecialization(e.target.value)}
            placeholder={language === 'he' ? 'תאר את ההתמחות הספציפית שלך...' : 'Describe your specific specialization...'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Button onClick={() => onComplete({ niche, specialization })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
