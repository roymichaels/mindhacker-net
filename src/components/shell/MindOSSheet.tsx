/**
 * MindOSSheet — center bottom-sheet environment switcher.
 * Lovable-style upward slide. Records an `env_change` signal so AION's
 * brain can adapt; never writes the decision row directly.
 */
import { useState } from 'react';
import { ChevronDown, Sun, Moon, Brain, Heart, Target, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/useTranslation';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { useAionDecision } from '@/contexts/AionDecisionContext';
import { cn } from '@/lib/utils';

type EnvId = 'home' | 'focus' | 'recovery' | 'night' | 'work' | 'flow';

interface EnvOption {
  id: EnvId;
  icon: typeof Sun;
  labelEn: string;
  labelHe: string;
  hintEn: string;
  hintHe: string;
}

const ENVS: EnvOption[] = [
  { id: 'home', icon: Sun, labelEn: 'Home', labelHe: 'בית', hintEn: 'Open & calm', hintHe: 'פתוח ורגוע' },
  { id: 'focus', icon: Target, labelEn: 'Focus', labelHe: 'פוקוס', hintEn: 'Tighten the field', hintHe: 'מצמצם את השדה' },
  { id: 'flow', icon: Sparkles, labelEn: 'Flow', labelHe: 'זרימה', hintEn: 'Light, fast', hintHe: 'קליל ומהיר' },
  { id: 'recovery', icon: Heart, labelEn: 'Recovery', labelHe: 'התאוששות', hintEn: 'Soft & warm', hintHe: 'רך וחם' },
  { id: 'work', icon: Brain, labelEn: 'Work', labelHe: 'עבודה', hintEn: 'Deep block', hintHe: 'עבודה עמוקה' },
  { id: 'night', icon: Moon, labelEn: 'Night', labelHe: 'לילה', hintEn: 'Dim & cool', hintHe: 'עמום וקריר' },
];

export function MindOSSheet({ compact = false }: { compact?: boolean }) {
  const { language, isRTL } = useTranslation();
  const { theme: brandTheme } = useThemeSettings();
  const { decision, signal } = useAionDecision();
  const [open, setOpen] = useState(false);

  const currentEnv: EnvId = ((decision?.mode ?? 'home') as EnvId);

  const choose = (env: EnvId) => {
    setOpen(false);
    void signal('env_change', { env });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={language === 'he' ? 'בחר סביבה' : 'Switch environment'}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 hover:bg-white/[0.06] transition-colors focus:outline-none',
            compact ? 'gap-1' : 'gap-1.5',
          )}
        >
          <span className={cn('font-bold text-foreground tracking-tight', compact ? 'text-[14px]' : 'text-[15px]')}>
            {language === 'he' ? brandTheme.brand_name : brandTheme.brand_name_en}
          </span>
          <ChevronDown className={cn('text-muted-foreground/80', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="rounded-t-3xl border-0 bg-card/95 backdrop-blur-2xl ring-1 ring-white/[0.08] p-0 max-h-[85vh]"
      >
        <div className="px-5 pt-3 pb-6" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="mx-auto h-1 w-10 rounded-full bg-white/15 mb-4" />
          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-3">
            {language === 'he' ? 'סביבה' : 'Environment'}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ENVS.map((env) => {
              const Icon = env.icon;
              const active = env.id === currentEnv;
              return (
                <button
                  key={env.id}
                  type="button"
                  onClick={() => choose(env.id)}
                  className={cn(
                    'group relative h-[88px] rounded-2xl px-4 py-3 text-start transition-all',
                    'ring-1 ring-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:ring-white/[0.12]',
                    active && 'bg-primary/15 ring-primary/40 hover:bg-primary/20',
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-lg inline-flex items-center justify-center',
                        active
                          ? 'bg-primary/25 text-primary'
                          : 'bg-white/[0.06] text-foreground/80',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[13.5px] font-semibold text-foreground">
                      {language === 'he' ? env.labelHe : env.labelEn}
                    </span>
                  </div>
                  <div className="text-[11.5px] text-muted-foreground/80 leading-tight">
                    {language === 'he' ? env.hintHe : env.hintEn}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] text-muted-foreground/60 text-center">
            {language === 'he'
              ? 'AION יתאים את העולם שלך אוטומטית.'
              : 'AION will adapt your world automatically.'}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MindOSSheet;
