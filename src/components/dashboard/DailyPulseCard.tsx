/**
 * DailyPulseCard - 30-second daily check-in micro-pulse
 * Captures: energy, sleep compliance, task confidence, screen discipline, mood
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useDailyPulse, type PulseInput, type MoodSignal, type SleepCompliance } from '@/hooks/useDailyPulse';
import { Activity, Check, Moon, Smartphone, Brain, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const MOOD_OPTIONS: { value: MoodSignal; emoji: string; labelEn: string; labelHe: string }[] = [
  { value: 'wired', emoji: '⚡', labelEn: 'Wired', labelHe: 'מתוח' },
  { value: 'drained', emoji: '🪫', labelEn: 'Drained', labelHe: 'מרוקן' },
  { value: 'neutral', emoji: '😐', labelEn: 'Neutral', labelHe: 'ניטרלי' },
  { value: 'focused', emoji: '🎯', labelEn: 'Focused', labelHe: 'ממוקד' },
  { value: 'flow', emoji: '🔥', labelEn: 'Flow', labelHe: 'פלואו' },
];

export function DailyPulseCard() {
  const { language } = useTranslation();
  const { hasLoggedToday, todayPulse, weekStats, submitPulse } = useDailyPulse();
  const isHe = language === 'he';

  const [step, setStep] = useState(0);
  const [input, setInput] = useState<PulseInput>({
    energy_rating: 3,
    sleep_compliance: 'yes',
    task_confidence: 3,
    screen_discipline: true,
    mood_signal: 'neutral',
  });

  const handleSubmit = async () => {
    try {
      await submitPulse.mutateAsync(input);
      toast.success(isHe ? 'הדופק היומי נרשם ✓' : 'Daily pulse logged ✓');
    } catch {
      toast.error(isHe ? 'שגיאה בשמירה' : 'Error saving pulse');
    }
  };

  // Already logged — show summary
  if (hasLoggedToday && todayPulse) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-green-500">
            {isHe ? 'דופק יומי ✓' : 'Daily Pulse ✓'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[
            { icon: Zap, val: todayPulse.energy_rating, label: isHe ? 'אנרגיה' : 'Energy', color: 'text-amber-500' },
            { icon: Moon, val: todayPulse.sleep_compliance === 'yes' ? '✓' : todayPulse.sleep_compliance === 'partial' ? '~' : '✗', label: isHe ? 'שינה' : 'Sleep', color: 'text-blue-500' },
            { icon: Check, val: todayPulse.task_confidence, label: isHe ? 'ביצוע' : 'Tasks', color: 'text-emerald-500' },
            { icon: Smartphone, val: todayPulse.screen_discipline ? '✓' : '✗', label: isHe ? 'מסך' : 'Screen', color: 'text-violet-500' },
            { icon: Brain, val: MOOD_OPTIONS.find(m => m.value === todayPulse.mood_signal)?.emoji || '😐', label: isHe ? 'מצב' : 'Mood', color: 'text-rose-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/30 p-1.5">
                <Icon className={cn("w-3 h-3", item.color)} />
                <span className={cn("text-sm font-bold", item.color)}>{item.val}</span>
                <span className="text-[8px] text-muted-foreground">{item.label}</span>
              </div>
            );
          })}
        </div>
        {weekStats && weekStats.daysLogged > 1 && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{isHe ? `ממוצע שבועי:` : `Week avg:`} ⚡{weekStats.avgEnergy.toFixed(1)}</span>
            <span>•</span>
            <span>{isHe ? 'שינה' : 'Sleep'}: {Math.round(weekStats.sleepComplianceRate * 100)}%</span>
            <span>•</span>
            <span>{weekStats.daysLogged}/7 {isHe ? 'ימים' : 'days'}</span>
          </div>
        )}
      </div>
    );
  }

  // Input flow — 5 micro-steps
  const steps = [
    // Step 0: Energy
    {
      title: isHe ? 'רמת אנרגיה' : 'Energy Level',
      icon: Zap,
      content: (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              onClick={() => { setInput(p => ({ ...p, energy_rating: v })); setStep(1); }}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                input.energy_rating === v
                  ? "bg-amber-500 text-amber-950"
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      ),
    },
    // Step 1: Sleep compliance
    {
      title: isHe ? 'עמדת ביעד שינה?' : 'Hit sleep target?',
      icon: Moon,
      content: (
        <div className="flex gap-1.5">
          {([
            { value: 'yes' as SleepCompliance, label: isHe ? 'כן' : 'Yes', color: 'bg-green-500 text-green-950' },
            { value: 'partial' as SleepCompliance, label: isHe ? 'חלקית' : 'Partial', color: 'bg-amber-500 text-amber-950' },
            { value: 'no' as SleepCompliance, label: isHe ? 'לא' : 'No', color: 'bg-red-500 text-red-950' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => { setInput(p => ({ ...p, sleep_compliance: opt.value })); setStep(2); }}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                input.sleep_compliance === opt.value ? opt.color : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
    },
    // Step 2: Task confidence
    {
      title: isHe ? 'איך היום עבר?' : 'How was today?',
      icon: Check,
      content: (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              onClick={() => { setInput(p => ({ ...p, task_confidence: v })); setStep(3); }}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                input.task_confidence === v
                  ? "bg-blue-500 text-blue-950"
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      ),
    },
    // Step 3: Screen discipline
    {
      title: isHe ? 'משמעת מסכים?' : 'Screen discipline?',
      icon: Smartphone,
      content: (
        <div className="flex gap-2">
          {([
            { value: true, label: isHe ? 'כן, עמדתי ביעד' : 'Yes, stayed on target', color: 'bg-green-500 text-green-950' },
            { value: false, label: isHe ? 'לא הצלחתי' : "Didn't manage", color: 'bg-red-500 text-red-950' },
          ]).map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => { setInput(p => ({ ...p, screen_discipline: opt.value })); setStep(4); }}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                input.screen_discipline === opt.value ? opt.color : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ),
    },
    // Step 4: Mood signal
    {
      title: isHe ? 'איתות מצב רוח' : 'Mood Signal',
      icon: Brain,
      content: (
        <div className="flex gap-1">
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.value}
              onClick={() => { setInput(p => ({ ...p, mood_signal: m.value })); handleSubmit(); }}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all",
                input.mood_signal === m.value
                  ? "bg-primary/20 border border-primary/40"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="text-[9px] text-muted-foreground">{isHe ? m.labelHe : m.labelEn}</span>
            </button>
          ))}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold">
            {isHe ? 'דופק יומי' : 'Daily Pulse'}
          </span>
        </div>
        <div className="flex gap-0.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-5 h-1 rounded-full transition-all",
                i <= step ? "bg-primary" : "bg-muted/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <StepIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{currentStep.title}</span>
          </div>
          {currentStep.content}
        </motion.div>
      </AnimatePresence>

      {/* Back button if not first step */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="mt-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {isHe ? 'חזור' : 'Back'}
        </button>
      )}
    </div>
  );
}
