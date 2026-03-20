/**
 * Generic Journey Step Component
 * Reusable for all admin/projects journey steps
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import type { BaseStepProps } from '@/components/journey-shared/types';

interface GenericJourneyStepProps extends BaseStepProps {
  icon: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  promptsHe: string[];
  promptsEn: string[];
  fieldKey: string;
}

export function GenericJourneyStep({
  onComplete, isCompleting, savedData, onAutoSave,
  icon, titleHe, titleEn, descriptionHe, descriptionEn,
  promptsHe, promptsEn, fieldKey,
}: GenericJourneyStepProps) {
  const { language, isRTL } = useTranslation();
  const [text, setText] = useState('');

  useEffect(() => {
    if (savedData?.[fieldKey]) setText(savedData[fieldKey] as string);
  }, [savedData, fieldKey]);

  useEffect(() => {
    if (text && onAutoSave) {
      const t = setTimeout(() => onAutoSave({ [fieldKey]: text }), 1500);
      return () => clearTimeout(t);
    }
  }, [text, fieldKey, onAutoSave]);

  const prompts = language === 'he' ? promptsHe : promptsEn;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-3">
        <span className="text-4xl">{icon}</span>
        <h2 className="text-2xl font-bold">{language === 'he' ? titleHe : titleEn}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">{language === 'he' ? descriptionHe : descriptionEn}</p>
      </div>

      <div className="space-y-3">
        {prompts.map((p, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-0.5 text-primary">💡</span>
            <span>{p}</span>
          </div>
        ))}
      </div>

      <Textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={language === 'he' ? 'שתף את המחשבות שלך...' : 'Share your thoughts...'}
        className="min-h-[140px] resize-none"
        dir={isRTL ? 'rtl' : 'ltr'}
      />

      <Button
        onClick={() => onComplete({ [fieldKey]: text })}
        disabled={!text.trim() || isCompleting}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold"
      >
        {isCompleting ? (language === 'he' ? 'שומר...' : 'Saving...') : (language === 'he' ? 'המשך לשלב הבא' : 'Continue to Next Step')}
      </Button>
    </motion.div>
  );
}
