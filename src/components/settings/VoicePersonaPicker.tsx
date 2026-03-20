import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useVoicePersona } from '@/hooks/useVoicePersona';
import { VOICE_PERSONAS, type VoicePersonaId } from '@/lib/voicePersonas';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function VoicePersonaPicker() {
  const { language } = useTranslation();
  const { persona: current, setPersona } = useVoicePersona();
  const isHe = language === 'he';

  const handleSelect = (id: VoicePersonaId) => {
    setPersona.mutate(id, {
      onSuccess: () => {
        toast.success(isHe ? 'סגנון הקול עודכן' : 'Voice style updated');
      },
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">
        {isHe ? '🎙️ סגנון הקול של AION' : '🎙️ AION Voice Style'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {isHe 
          ? 'בחר את הסגנון שמתאים לך — ישפיע על כל ההשמעות הקוליות באפליקציה'
          : 'Choose the style that fits you — affects all voice playback in the app'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {VOICE_PERSONAS.map((p, i) => {
          const isActive = current.id === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md border-2',
                  isActive ? 'border-primary bg-primary/5' : 'border-transparent'
                )}
                onClick={() => handleSelect(p.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {isHe ? p.name_he : p.name_en}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isHe ? p.description_he : p.description_en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
