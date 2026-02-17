import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Target, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const WHY_OPTIONS = {
  he: [
    { id: 'help_transform', label: 'לעזור לאנשים להשתנות' },
    { id: 'share_knowledge', label: 'לשתף ידע וניסיון' },
    { id: 'financial_freedom', label: 'חופש כלכלי' },
    { id: 'passion', label: 'תשוקה לאימון' },
    { id: 'own_journey', label: 'המסע שלי השתנה ואני רוצה לתת את זה הלאה' },
    { id: 'build_legacy', label: 'ליצור מורשת' },
  ],
  en: [
    { id: 'help_transform', label: 'Help people transform' },
    { id: 'share_knowledge', label: 'Share knowledge & experience' },
    { id: 'financial_freedom', label: 'Financial freedom' },
    { id: 'passion', label: 'Passion for coaching' },
    { id: 'own_journey', label: 'My own journey changed me & I want to give back' },
    { id: 'build_legacy', label: 'Build a legacy' },
  ],
};

export function CoachVisionStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [selectedWhy, setSelectedWhy] = useState<string[]>((savedData?.why as string[]) || []);
  const [vision, setVision] = useState<string>((savedData?.vision as string) || '');
  const [impact, setImpact] = useState<string>((savedData?.impact as string) || '');

  const whyOptions = language === 'he' ? WHY_OPTIONS.he : WHY_OPTIONS.en;
  const isValid = selectedWhy.length > 0 && vision.trim().length > 10;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave({ why: selectedWhy, vision, impact });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedWhy, vision, impact, onAutoSave]);

  const toggleWhy = (id: string) => {
    setSelectedWhy(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'חזון ולמה' : 'Vision & Why'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'למה אתה רוצה להפוך למאמן?' : 'Why do you want to become a coach?'}</p>
      </motion.div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'מה מניע אותך לאמן?' : 'What drives you to coach?'}</h3>
          <p className="text-sm text-muted-foreground">{language === 'he' ? 'בחר את כל מה שרלוונטי' : 'Select all that apply'}</p>
          <div className="grid grid-cols-2 gap-2">
            {whyOptions.map((option) => (
              <button key={option.id} onClick={() => toggleWhy(option.id)}
                className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  selectedWhy.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
                <div className="flex items-center gap-2">
                  {selectedWhy.includes(option.id) && <Check className="w-4 h-4 text-orange-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'מה החזון שלך כמאמן?' : 'What is your coaching vision?'}</h3>
          <Textarea value={vision} onChange={(e) => setVision(e.target.value)}
            placeholder={language === 'he' ? 'תאר את החזון שלך כמאמן...' : 'Describe your vision as a coach...'} className="min-h-[100px]" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'איזו השפעה אתה רוצה ליצור?' : 'What impact do you want to create?'}</h3>
          <Textarea value={impact} onChange={(e) => setImpact(e.target.value)}
            placeholder={language === 'he' ? 'תאר את ההשפעה שאתה רוצה...' : 'Describe the impact you want...'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Button onClick={() => onComplete({ why: selectedWhy, vision, impact })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
