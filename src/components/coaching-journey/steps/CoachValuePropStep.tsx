import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Gem, Loader2 } from 'lucide-react';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

export function CoachValuePropStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [uniqueness, setUniqueness] = useState<string>((savedData?.uniqueness as string) || '');
  const [transformation, setTransformation] = useState<string>((savedData?.transformation as string) || '');
  const [testimonial, setTestimonial] = useState<string>((savedData?.testimonial as string) || '');

  const isValid = uniqueness.trim().length > 10 && transformation.trim().length > 10;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ uniqueness, transformation, testimonial }), 500);
      return () => clearTimeout(timer);
    }
  }, [uniqueness, transformation, testimonial, onAutoSave]);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Gem className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'הצעת הערך שלך' : 'Your Value Proposition'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'מה מייחד אותך כמאמן?' : 'What makes you unique as a coach?'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'מה מייחד אותך מכל מאמן אחר?' : 'What sets you apart from other coaches?'}</h3>
        <Textarea value={uniqueness} onChange={(e) => setUniqueness(e.target.value)}
          placeholder={language === 'he' ? 'תאר את היתרון הייחודי שלך...' : 'Describe your unique advantage...'} className="min-h-[100px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'איזו טרנספורמציה אתה מביא?' : 'What transformation do you deliver?'}</h3>
        <Textarea value={transformation} onChange={(e) => setTransformation(e.target.value)}
          placeholder={language === 'he' ? 'מהשלב ש... לשלב ש...' : 'From where... to where...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'סיפור הצלחה (אופציונלי)' : 'Success Story (optional)'}</h3>
        <Textarea value={testimonial} onChange={(e) => setTestimonial(e.target.value)}
          placeholder={language === 'he' ? 'שתף סיפור הצלחה של מישהו שעזרת לו...' : 'Share a success story of someone you helped...'} className="min-h-[80px]" />
      </CardContent></Card>

      <Button onClick={() => onComplete({ uniqueness, transformation, testimonial })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
