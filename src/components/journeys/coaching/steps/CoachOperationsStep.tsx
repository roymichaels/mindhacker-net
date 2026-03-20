import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Settings, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  onComplete: (data: Record<string, unknown>) => void;
  isCompleting: boolean;
  savedData?: Record<string, unknown>;
  onAutoSave?: (data: Record<string, unknown>) => void;
}

const TOOL_OPTIONS = {
  he: [
    { id: 'zoom', label: 'Zoom' }, { id: 'google_meet', label: 'Google Meet' },
    { id: 'in_person', label: 'פנים אל פנים' }, { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'notion', label: 'Notion' }, { id: 'calendar', label: 'Google Calendar' },
  ],
  en: [
    { id: 'zoom', label: 'Zoom' }, { id: 'google_meet', label: 'Google Meet' },
    { id: 'in_person', label: 'In Person' }, { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'notion', label: 'Notion' }, { id: 'calendar', label: 'Google Calendar' },
  ],
};

export function CoachOperationsStep({ onComplete, isCompleting, savedData, onAutoSave }: Props) {
  const { language, isRTL } = useTranslation();
  const [tools, setTools] = useState<string[]>((savedData?.tools as string[]) || []);
  const [scheduling, setScheduling] = useState<string>((savedData?.scheduling as string) || '');
  const [followUp, setFollowUp] = useState<string>((savedData?.followUp as string) || '');

  const options = language === 'he' ? TOOL_OPTIONS.he : TOOL_OPTIONS.en;
  const isValid = tools.length > 0;

  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => onAutoSave({ tools, scheduling, followUp }), 500);
      return () => clearTimeout(timer);
    }
  }, [tools, scheduling, followUp, onAutoSave]);

  const toggleTool = (id: string) => {
    setTools(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{language === 'he' ? 'תפעול' : 'Operations'}</h2>
        <p className="text-muted-foreground">{language === 'he' ? 'כלים, תהליכים ולוגיסטיקה' : 'Tools, processes, and logistics'}</p>
      </motion.div>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'כלים שתשתמש בהם' : 'Tools you will use'}</h3>
        <div className="grid grid-cols-2 gap-2">
          {options.map((option) => (
            <button key={option.id} onClick={() => toggleTool(option.id)}
              className={cn("p-3 rounded-lg border text-sm font-medium transition-all text-start",
                tools.includes(option.id) ? "border-orange-500 bg-orange-500/10 text-orange-600" : "border-border hover:border-orange-500/50")}>
              <div className="flex items-center gap-2">
                {tools.includes(option.id) && <Check className="w-4 h-4 text-orange-500" />}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'ניהול לוח זמנים' : 'Scheduling Management'}</h3>
        <Textarea value={scheduling} onChange={(e) => setScheduling(e.target.value)}
          placeholder={language === 'he' ? 'איך תנהל את הזמנת המפגשים?' : 'How will you manage session bookings?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Card><CardContent className="p-4 space-y-3">
        <h3 className="font-semibold">{language === 'he' ? 'מעקב וליווי' : 'Follow-up Process'}</h3>
        <Textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)}
          placeholder={language === 'he' ? 'איך תעקוב אחרי התקדמות המתאמנים?' : 'How will you track coachee progress?'} className="min-h-[80px]" />
      </CardContent></Card>

      <Button onClick={() => onComplete({ tools, scheduling, followUp })} disabled={!isValid || isCompleting}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500" size="lg">
        {isCompleting ? (<><Loader2 className="w-4 h-4 animate-spin me-2" />{language === 'he' ? 'שומר...' : 'Saving...'}</>) : (language === 'he' ? 'המשך' : 'Continue')}
      </Button>
    </div>
  );
}
