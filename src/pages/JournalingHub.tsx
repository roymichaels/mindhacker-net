/**
 * JournalingHub — central environment for all journal categories.
 * Categories: Gratitude, Plan, Beliefs, Dreams, Reflection, Breakthroughs,
 * Emotional State, Lessons, Wins.
 * AION-captured entries appear alongside manual entries.
 */
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { JournalTab } from '@/components/aurora/JournalTab';
import type { JournalType } from '@/services/journalEntries';
import {
  BookOpen, Heart, Moon, Sun, Target, Brain,
  Sparkles, Smile, Lightbulb, Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryDef {
  id: JournalType;
  labelHe: string;
  labelEn: string;
  icon: typeof Heart;
  accent: string;
}

const CATEGORIES: CategoryDef[] = [
  { id: 'gratitude',    labelHe: 'תודה',         labelEn: 'Gratitude',       icon: Heart,     accent: 'text-rose-400' },
  { id: 'plan',         labelHe: 'תוכנית',        labelEn: 'Plan',            icon: Target,    accent: 'text-cyan-400' },
  { id: 'beliefs',      labelHe: 'אמונות',        labelEn: 'Beliefs',         icon: Brain,     accent: 'text-violet-400' },
  { id: 'dream',        labelHe: 'חלומות',        labelEn: 'Dreams',          icon: Moon,      accent: 'text-indigo-400' },
  { id: 'reflection',   labelHe: 'רפלקציה',       labelEn: 'Reflection',      icon: Sun,       accent: 'text-amber-400' },
  { id: 'breakthrough', labelHe: 'פריצות דרך',   labelEn: 'Breakthroughs',   icon: Sparkles,  accent: 'text-fuchsia-400' },
  { id: 'emotion',      labelHe: 'מצב רגשי',     labelEn: 'Emotional State', icon: Smile,     accent: 'text-pink-400' },
  { id: 'lesson',       labelHe: 'לקחים',         labelEn: 'Lessons',         icon: Lightbulb, accent: 'text-yellow-400' },
  { id: 'win',          labelHe: 'ניצחונות',      labelEn: 'Wins',            icon: Trophy,    accent: 'text-emerald-400' },
];

export default function JournalingHub() {
  const { language, isRTL } = useTranslation();
  const isHe = language === 'he';
  const [active, setActive] = useState<JournalType>('reflection');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-3 py-5" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight">{isHe ? 'יומן' : 'Journal'}</h1>
            <p className="text-xs text-muted-foreground leading-snug">
              {isHe
                ? 'זיכרון חי. AION לוכד תובנות, רגשות ופריצות דרך מהשיחות שלך — באופן אוטומטי.'
                : 'A living memory. AION captures insights, emotions and breakthroughs from your conversations — automatically.'}
            </p>
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActive(cat.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all active:scale-[0.98]',
                isActive
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border/50 bg-card/40 hover:bg-card/70',
              )}
            >
              <Icon className={cn('h-5 w-5', cat.accent)} />
              <span className="text-[11px] font-medium leading-tight text-foreground/90 text-center">
                {isHe ? cat.labelHe : cat.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active category panel */}
      <div className="min-h-[60vh] rounded-3xl border border-border/60 bg-card/40 overflow-hidden">
        <JournalTab type={active} />
      </div>
    </div>
  );
}