import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const FRAMEWORK_OPTIONS = {
  he: [
    { id: 'nlp', label: 'NLP' },
    { id: 'cbt', label: 'CBT - טיפול קוגניטיבי התנהגותי' },
    { id: 'positive_psychology', label: 'פסיכולוגיה חיובית' },
    { id: 'mindfulness', label: 'מיינדפולנס' },
    { id: 'hypnotherapy', label: 'היפנותרפיה' },
    { id: 'somatic', label: 'גוף-נפש (סומטי)' },
    { id: 'gestalt', label: 'גשטלט' },
    { id: 'systemic', label: 'גישה מערכתית' },
    { id: 'custom', label: 'שיטה ייחודית שלי' },
  ],
  en: [
    { id: 'nlp', label: 'NLP' },
    { id: 'cbt', label: 'CBT' },
    { id: 'positive_psychology', label: 'Positive Psychology' },
    { id: 'mindfulness', label: 'Mindfulness' },
    { id: 'hypnotherapy', label: 'Hypnotherapy' },
    { id: 'somatic', label: 'Somatic / Body-Mind' },
    { id: 'gestalt', label: 'Gestalt' },
    { id: 'systemic', label: 'Systemic Approach' },
    { id: 'custom', label: 'My Own Unique Method' },
  ],
};

export function CoachMethodologyStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [frameworks, setFrameworks] = useState<string[]>((savedData?.frameworks as string[]) || []);
  const [approach, setApproach] = useState<string>((savedData?.approach as string) || '');
  const [beliefs, setBeliefs] = useState<string>((savedData?.beliefs as string) || '');
  const [methodName, setMethodName] = useState<string>((savedData?.methodName as string) || '');

  const options = language === 'he' ? FRAMEWORK_OPTIONS.he : FRAMEWORK_OPTIONS.en;
  const isValid = frameworks.length > 0 && approach.trim().length > 10;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ frameworks, approach, beliefs, methodName }), 500);
      return () => clearTimeout(timer);
    }
  }, [frameworks, approach, beliefs, methodName, onAutoSave]);

  const toggleFramework = (id: string) => {
    setFrameworks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'המתודולוגיה שלך' : 'Your Methodology'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'הגישה, השיטות והאמונות שלך כמאמן' : 'Your approach, methods, and beliefs as a coach'}</p>
      </motion.div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'שיטות ומסגרות עבודה' : 'Frameworks & Methods'}</h3>
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => (
              <button key={option.id} onClick={() => toggleFramework(option.id)}
                className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-start",
                  frameworks.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
                <div className="flex items-center gap-2">
                  {frameworks.includes(option.id) && <Check className="w-4 h-4 text-orange-500" />}
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'שם השיטה שלך (אופציונלי)' : 'Your Method Name (optional)'}</h3>
          <Input value={methodName} onChange={(e) => setMethodName(e.target.value)}
            placeholder={language === 'he' ? 'למשל: שיטת הצמיחה המואצת' : 'e.g., The Accelerated Growth Method'} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'תאר את הגישה שלך' : 'Describe your approach'}</h3>
          <Textarea value={approach} onChange={(e) => setApproach(e.target.value)}
            placeholder={language === 'he' ? 'איך אתה עובד עם מתאמנים? מה התהליך שלך?' : 'How do you work with coachees? What is your process?'} className="min-h-[100px]" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">{language === 'he' ? 'אמונות הליבה שלך כמאמן' : 'Your core coaching beliefs'}</h3>
          <Textarea value={beliefs} onChange={(e) => setBeliefs(e.target.value)}
            placeholder={language === 'he' ? 'מה אתה מאמין לגבי שינוי, צמיחה ופוטנציאל אנושי?' : 'What do you believe about change, growth, and human potential?'} className="min-h-[80px]" />
        </CardContent>
      </Card>

      <Button onClick={() => onComplete({ frameworks, approach, beliefs, methodName })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
