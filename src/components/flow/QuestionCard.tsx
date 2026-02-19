/**
 * QuestionCard — Generic renderer for a single MiniStep
 * Supports: single_select, multi_select, slider, time_picker, textarea, priority_rank
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { MobileTimePicker } from '@/components/ui/mobile-time-picker';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MiniStep, FlowOption } from '@/lib/flow/types';
import { isMiniStepValid } from '@/lib/flow/flowSpec';

// ─── Sortable Item for priority_rank ───
function SortableRankItem({ item, index, language }: { item: FlowOption; index: number; language: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.value });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const label = language === 'he' ? item.label_he : item.label_en;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all select-none",
        isDragging
          ? "border-primary bg-primary/15 shadow-lg scale-[1.02]"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <span className="text-lg font-bold text-primary/70 min-w-[24px] text-center">{index + 1}</span>
      {item.icon && <span className="text-lg shrink-0">{item.icon}</span>}
      <span className="text-sm leading-tight flex-1">{label}</span>
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
    </div>
  );
}

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

  // For priority_rank: maintain ordered items
  const [rankedItems, setRankedItems] = useState<FlowOption[]>([]);

  useEffect(() => {
    setLocalValue(value);
  }, [value, miniStep.id]);

  // Auto-set default for time_picker so Continue is immediately enabled
  useEffect(() => {
    if (miniStep.inputType === 'time_picker' && (value === undefined || value === null || value === '')) {
      // Pick a sensible default within the allowed range
      const min = miniStep.minHour ?? 0;
      const max = miniStep.maxHour ?? 23;
      let defaultH = 7; // universal fallback
      // Check if 7 is in range; if not use minHour
      if (min <= max) {
        defaultH = (defaultH >= min && defaultH <= max) ? defaultH : min;
      } else {
        // wrap-around range (e.g. 18..3): check if 7 is valid (it's not for sleep), use min
        defaultH = min;
      }
      const defaultTime = `${String(defaultH).padStart(2, '0')}:00`;
      setLocalValue(defaultTime);
      onChange(defaultTime);
    }
  }, [miniStep.id]);

  // Initialize ranked items when miniStep changes
  useEffect(() => {
    if (miniStep.inputType === 'priority_rank' && miniStep.options) {
      if (Array.isArray(value) && value.length === miniStep.options.length) {
        // Restore from saved order
        const ordered = value
          .map(v => miniStep.options!.find(o => o.value === v))
          .filter(Boolean) as FlowOption[];
        setRankedItems(ordered);
      } else {
        // Default order
        setRankedItems([...miniStep.options]);
        // Auto-set initial value
        const initial = miniStep.options.map(o => o.value);
        setLocalValue(initial);
        onChange(initial);
      }
    }
  }, [miniStep.id]);

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

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rankedItems.findIndex(i => i.value === active.id);
    const newIndex = rankedItems.findIndex(i => i.value === over.id);
    const reordered = arrayMove(rankedItems, oldIndex, newIndex);
    setRankedItems(reordered);

    const values = reordered.map(i => i.value);
    setLocalValue(values);
    onChange(values);
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

      {/* Priority Rank — Drag to reorder */}
      {miniStep.inputType === 'priority_rank' && rankedItems.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={rankedItems.map(i => i.value)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {rankedItems.map((item, index) => (
                <SortableRankItem key={item.value} item={item} index={index} language={language} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
        <div className="flex flex-col items-center gap-4">
          <MobileTimePicker
            value={typeof localValue === 'string' && /^\d{2}:\d{2}$/.test(localValue) ? localValue : '07:00'}
            onChange={handleTimeChange}
            minHour={miniStep.minHour}
            maxHour={miniStep.maxHour}
          />
          {/* Render fallback options (e.g. "Flexible", "Not working") below the picker */}
          {miniStep.options && miniStep.options.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 w-full">
              {miniStep.options.map((opt) => {
                const label = language === 'he' ? opt.label_he : opt.label_en;
                const isSelected = localValue === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      "rounded-full text-xs transition-all",
                      isSelected && "ring-2 ring-primary/50"
                    )}
                    onClick={() => {
                      if (isSelected) {
                        // Deselect → go back to time picker with default
                        handleTimeChange('07:00');
                      } else {
                        onChange(opt.value);
                      }
                    }}
                  >
                    {opt.icon && <span className="mr-1">{opt.icon}</span>}
                    {label}
                  </Button>
                );
              })}
            </div>
          )}
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

        {/* Show continue button for non-single_select types */}
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
