/**
 * QuestionCard — Generic renderer for a single MiniStep
 * Supports: single_select, multi_select, slider, time_picker, textarea
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { MobileTimePicker } from '@/components/ui/mobile-time-picker';
import { motion } from 'framer-motion';
import type { MiniStep } from '@/lib/flow/types';
import { isMiniStepValid } from '@/lib/flow/flowSpec';

interface QuestionCardProps {
  miniStep: MiniStep;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  onNext: () => void;
  onSkip?: () => void;
  showSkip: boolean;
  autoAdvance?: boolean;
}

export function QuestionCard({
  miniStep,
  value,
  onChange,
  onNext,
  onSkip,
  showSkip,
  autoAdvance = true,
}: QuestionCardProps) {
  const { language, isRTL } = useTranslation();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value, miniStep.id]);

  const title = language === 'he' ? miniStep.title_he : miniStep.title_en;
  const prompt = language === 'he' ? miniStep.prompt_he : miniStep.prompt_en;
  const isValid = isMiniStepValid(miniStep, localValue);

  const handleSelect = (optValue: string) => {
    if (miniStep.inputType === 'single_select') {
      setLocalValue(optValue);
      onChange(optValue);
      if (autoAdvance) {
        setTimeout(onNext, 300);
      }
    } else if (miniStep.inputType === 'multi_select') {
      const current = Array.isArray(localValue) ? localValue : [];
      const maxSel = miniStep.validation.maxSelected;

      let next: string[];
      if (optValue === 'none') {
        next = ['none'];
      } else if (current.includes(optValue)) {
        next = current.filter(v => v !== optValue);
      } else {
        const filtered = current.filter(v => v !== 'none');
        if (maxSel && filtered.length >= maxSel) {
          next = [...filtered.slice(1), optValue];
        } else {
          next = [...filtered, optValue];
        }
      }
      setLocalValue(next);
      onChange(next);
    }
  };

  const handleSlider = (vals: number[]) => {
    const v = vals[0];
    setLocalValue(v);
    onChange(v);
  };

  const handleTextarea = (text: string) => {
    setLocalValue(text);
    onChange(text);
  };

  const handleTimeChange = (time: string) => {
    setLocalValue(time);
    onChange(time);
  };

  return (
    <motion.div
      key={miniStep.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold leading-tight">{title}</h2>
        {prompt && <p className="text-muted-foreground text-sm">{prompt}</p>}
        {miniStep.inputType === 'multi_select' && miniStep.validation.maxSelected && (
          <p className="text-xs text-primary font-medium">
            {language === 'he'
              ? `בחר עד ${miniStep.validation.maxSelected}`
              : `Select up to ${miniStep.validation.maxSelected}`}
            {Array.isArray(localValue) && ` (${localValue.length}/${miniStep.validation.maxSelected})`}
          </p>
        )}
      </div>

      {/* Input Area */}
      {(miniStep.inputType === 'single_select' || miniStep.inputType === 'multi_select') && miniStep.options && (
        <div className="grid grid-cols-2 gap-2">
          {miniStep.options.map((opt, idx) => {
            const label = language === 'he' ? opt.label_he : opt.label_en;
            const selected = miniStep.inputType === 'single_select'
              ? localValue === opt.value
              : Array.isArray(localValue) && localValue.includes(opt.value);

            return (
              <motion.button
                key={opt.value}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  "flex items-center gap-2 p-3.5 rounded-xl border-2 text-start transition-all min-h-[48px]",
                  selected
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/40 text-foreground"
                )}
              >
                {opt.icon && <span className="text-lg shrink-0">{opt.icon}</span>}
                <span className="text-sm leading-tight">{label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {miniStep.inputType === 'slider' && (
        <div className="space-y-4 px-2">
          <Slider
            value={[typeof localValue === 'number' ? localValue : miniStep.sliderMin ?? 0]}
            min={miniStep.sliderMin ?? 0}
            max={miniStep.sliderMax ?? 100}
            step={miniStep.sliderStep ?? 1}
            onValueChange={handleSlider}
          />
          <div className="text-center text-2xl font-bold text-primary">
            {typeof localValue === 'number' ? localValue : miniStep.sliderMin ?? 0}
            {miniStep.sliderUnit && <span className="text-sm text-muted-foreground ms-1">{miniStep.sliderUnit}</span>}
          </div>
        </div>
      )}

      {miniStep.inputType === 'time_picker' && (
        <div className="flex justify-center">
          <MobileTimePicker
            value={typeof localValue === 'string' ? localValue : '07:00'}
            onChange={handleTimeChange}
            minHour={miniStep.minHour}
            maxHour={miniStep.maxHour}
          />
        </div>
      )}

      {miniStep.inputType === 'textarea' && (
        <div className="space-y-2">
          <Textarea
            value={typeof localValue === 'string' ? localValue : ''}
            onChange={(e) => handleTextarea(e.target.value)}
            className="min-h-[120px] resize-none"
            placeholder={prompt || ''}
          />
          {miniStep.validation.minChars && (
            <p className="text-xs text-muted-foreground text-end">
              {typeof localValue === 'string' ? localValue.length : 0}/{miniStep.validation.minChars}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {showSkip && (
          <Button variant="ghost" size="sm" onClick={onSkip}>
            {language === 'he' ? 'דלג' : 'Skip'}
          </Button>
        )}

        {/* Show continue button for multi_select, slider, textarea, time_picker */}
        {miniStep.inputType !== 'single_select' && (
          <Button
            onClick={onNext}
            disabled={!isValid}
            size="lg"
            className={cn(
              "min-w-[160px] h-12 font-bold transition-all rounded-xl",
              isValid
                ? "bg-gradient-to-r from-primary to-accent hover:shadow-lg text-primary-foreground"
                : "opacity-50"
            )}
          >
            {language === 'he' ? 'המשך' : 'Continue'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
