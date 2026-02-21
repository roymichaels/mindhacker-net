import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, Moon, Zap, Battery, Dumbbell, Briefcase, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useCreateProtocol } from '@/hooks/useLifeProtocol';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  planId?: string;
  onCreated?: (protocolId: string) => void;
}

interface TimeField {
  key: string;
  label: string;
  labelHe: string;
  icon: React.ElementType;
  defaultValue: string;
  required?: boolean;
}

const TIME_FIELDS: TimeField[] = [
  { key: 'wake_time', label: 'Wake Time', labelHe: 'שעת השכמה', icon: Sun, defaultValue: '05:00', required: true },
  { key: 'sleep_time', label: 'Sleep Time', labelHe: 'שעת שינה', icon: Moon, defaultValue: '22:00', required: true },
  { key: 'energy_peak_start', label: 'Energy Peak Start', labelHe: 'תחילת שיא אנרגיה', icon: Zap, defaultValue: '06:00' },
  { key: 'energy_peak_end', label: 'Energy Peak End', labelHe: 'סיום שיא אנרגיה', icon: Zap, defaultValue: '10:00' },
  { key: 'energy_crash_start', label: 'Energy Crash Start', labelHe: 'תחילת ירידת אנרגיה', icon: Battery, defaultValue: '14:00' },
  { key: 'energy_crash_end', label: 'Energy Crash End', labelHe: 'סיום ירידת אנרגיה', icon: Battery, defaultValue: '15:00' },
  { key: 'training_window_start', label: 'Training Start', labelHe: 'תחילת אימון', icon: Dumbbell, defaultValue: '07:00' },
  { key: 'training_window_end', label: 'Training End', labelHe: 'סיום אימון', icon: Dumbbell, defaultValue: '08:00' },
  { key: 'work_start', label: 'Work Start', labelHe: 'תחילת עבודה', icon: Briefcase, defaultValue: '09:00' },
  { key: 'work_end', label: 'Work End', labelHe: 'סיום עבודה', icon: Briefcase, defaultValue: '17:00' },
];

export function ProtocolSetupWizard({ planId, onCreated }: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';
  const createProtocol = useCreateProtocol();

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(TIME_FIELDS.map((f) => [f.key, f.defaultValue]))
  );
  const [step, setStep] = useState(0); // 0 = core times, 1 = energy/training, 2 = confirm

  const steps = [
    { fields: ['wake_time', 'sleep_time'], title: isHe ? 'זמני ליבה' : 'Core Times', titleIcon: Clock },
    { fields: ['energy_peak_start', 'energy_peak_end', 'energy_crash_start', 'energy_crash_end'], title: isHe ? 'דפוסי אנרגיה' : 'Energy Patterns', titleIcon: Zap },
    { fields: ['training_window_start', 'training_window_end', 'work_start', 'work_end'], title: isHe ? 'בלוקים מובנים' : 'Structured Blocks', titleIcon: Briefcase },
  ];

  const currentStep = steps[step];

  const handleSubmit = async () => {
    try {
      const result = await createProtocol.mutateAsync({
        wake_time: values.wake_time,
        sleep_time: values.sleep_time,
        energy_peak_start: values.energy_peak_start,
        energy_peak_end: values.energy_peak_end,
        energy_crash_start: values.energy_crash_start,
        energy_crash_end: values.energy_crash_end,
        training_window_start: values.training_window_start,
        training_window_end: values.training_window_end,
        work_start: values.work_start,
        work_end: values.work_end,
        plan_id: planId,
      });
      onCreated?.(result.id);
    } catch {}
  };

  // Calculate waking hours
  const [wh, wm] = values.wake_time.split(':').map(Number);
  const [sh, sm] = values.sleep_time.split(':').map(Number);
  const wakingMinutes = (sh * 60 + sm) - (wh * 60 + wm);
  const wakingHours = Math.floor(wakingMinutes / 60);
  const wakingMins = wakingMinutes % 60;

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all',
                i === step
                  ? 'bg-primary text-primary-foreground'
                  : i < step
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <s.titleIcon className="w-3 h-3" />
              {s.title}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Waking hours display */}
      <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/40">
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
          {isHe ? 'דקות ערות זמינות' : 'Available Waking Minutes'}
        </span>
        <p className="text-3xl font-bold font-mono tabular-nums mt-1">
          {wakingHours}h {wakingMins > 0 ? `${wakingMins}m` : ''}
        </p>
      </div>

      {/* Fields */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: isHe ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-2 gap-4"
      >
        {currentStep.fields.map((key) => {
          const field = TIME_FIELDS.find((f) => f.key === key)!;
          const Icon = field.icon;
          return (
            <div key={key} className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5">
                <Icon className="w-3 h-3" />
                {isHe ? field.labelHe : field.label}
              </Label>
              <Input
                type="time"
                value={values[key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                className="font-mono text-sm"
              />
            </div>
          );
        })}
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-xs"
        >
          {isHe ? 'הקודם' : 'Back'}
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="text-xs gap-1">
            {isHe ? 'הבא' : 'Next'}
            <ChevronRight className="w-3 h-3" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={createProtocol.isPending}
            className="gap-1.5 bg-gradient-to-r from-primary to-primary/80"
          >
            <Lock className="w-3.5 h-3.5" />
            {isHe ? 'צור פרוטוקול' : 'Compile Protocol'}
          </Button>
        )}
      </div>
    </div>
  );
}
