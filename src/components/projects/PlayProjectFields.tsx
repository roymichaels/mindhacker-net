/**
 * PlayProjectFields — Extra fields shown in the wizard when project_type === 'play'
 */
import { useTranslation } from '@/hooks/useTranslation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Gamepad2 } from 'lucide-react';

const PLAY_CATEGORIES = [
  { id: 'nature', en: 'Nature', he: 'טבע' },
  { id: 'movement', en: 'Movement', he: 'תנועה' },
  { id: 'social', en: 'Social', he: 'חברתי' },
  { id: 'creative', en: 'Creative', he: 'יצירתי' },
  { id: 'adventure', en: 'Adventure', he: 'הרפתקה' },
  { id: 'recovery', en: 'Recovery', he: 'התאוששות' },
  { id: 'exploration', en: 'Exploration', he: 'חקירה' },
  { id: 'travel', en: 'Travel', he: 'טיולים' },
  { id: 'other', en: 'Other', he: 'אחר' },
];

const PLAY_INTENTIONS = [
  { id: 'relax', en: 'Relax', he: 'להירגע' },
  { id: 'explore', en: 'Explore', he: 'לחקור' },
  { id: 'move', en: 'Move', he: 'לנוע' },
  { id: 'connect', en: 'Connect', he: 'להתחבר' },
  { id: 'recharge', en: 'Recharge', he: 'להיטען' },
  { id: 'celebrate', en: 'Celebrate', he: 'לחגוג' },
  { id: 'discover', en: 'Discover', he: 'לגלות' },
];

const RECURRING_OPTIONS = [
  { id: 'weekly', en: 'Weekly', he: 'שבועי' },
  { id: 'monthly', en: 'Monthly', he: 'חודשי' },
  { id: 'seasonal', en: 'Seasonal', he: 'עונתי' },
];

interface Props {
  playCategory: string;
  setPlayCategory: (v: string) => void;
  playIntention: string;
  setPlayIntention: (v: string) => void;
  playLocation: string;
  setPlayLocation: (v: string) => void;
  playDuration: string;
  setPlayDuration: (v: string) => void;
  playRecurring: string;
  setPlayRecurring: (v: string) => void;
}

export function PlayProjectFields({
  playCategory, setPlayCategory,
  playIntention, setPlayIntention,
  playLocation, setPlayLocation,
  playDuration, setPlayDuration,
  playRecurring, setPlayRecurring,
}: Props) {
  const { language } = useTranslation();
  const isHe = language === 'he';

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 text-violet-500 dark:text-violet-400">
        <Gamepad2 className="h-5 w-5" />
        <h3 className="font-semibold">{isHe ? 'פרטי Play' : 'Play Details'}</h3>
      </div>

      {/* Category */}
      <div>
        <Label>{isHe ? 'קטגוריה' : 'Category'}</Label>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {PLAY_CATEGORIES.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setPlayCategory(c.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                playCategory === c.id
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400'
                  : 'border-border text-muted-foreground hover:border-violet-500/30'
              )}
            >
              {isHe ? c.he : c.en}
              {playCategory === c.id && <Check className="inline ms-1 h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Intention */}
      <div>
        <Label>{isHe ? 'כוונה' : 'Intention'}</Label>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          {PLAY_INTENTIONS.map(i => (
            <button
              key={i.id}
              type="button"
              onClick={() => setPlayIntention(i.id)}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                playIntention === i.id
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-600 dark:text-violet-300 ring-1 ring-violet-400'
                  : 'border-border text-muted-foreground hover:border-violet-500/30'
              )}
            >
              {isHe ? i.he : i.en}
              {playIntention === i.id && <Check className="inline ms-1 h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Duration + Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{isHe ? 'משך זמן' : 'Duration'}</Label>
          <Input
            value={playDuration}
            onChange={e => setPlayDuration(e.target.value)}
            placeholder={isHe ? 'למשל: שעתיים' : 'e.g. 2 hours'}
            className="mt-1"
          />
        </div>
        <div>
          <Label>{isHe ? 'מיקום (אופציונלי)' : 'Location (optional)'}</Label>
          <Input
            value={playLocation}
            onChange={e => setPlayLocation(e.target.value)}
            placeholder={isHe ? 'למשל: הפארק' : 'e.g. The park'}
            className="mt-1"
          />
        </div>
      </div>

      {/* Recurring */}
      <div>
        <Label>{isHe ? 'חזרתיות' : 'Recurring'}</Label>
        <div className="flex gap-2 mt-1">
          {RECURRING_OPTIONS.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setPlayRecurring(playRecurring === r.id ? '' : r.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                playRecurring === r.id
                  ? 'bg-violet-500/20 border-violet-500/50 text-violet-600 dark:text-violet-300'
                  : 'border-border text-muted-foreground hover:border-violet-500/30'
              )}
            >
              {isHe ? r.he : r.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
