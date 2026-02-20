/**
 * @component ManualInputs
 * @purpose Optional enrichment toggles — beard, hair length, skincare routine.
 */
import { useState } from 'react';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ManualInputs as ManualInputsType } from '@/lib/presence/types';

const HAIR_OPTIONS = [
  { value: 'buzz', label: 'Buzz' },
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
] as const;

const SKIN_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'basic', label: 'Basic' },
  { value: 'full', label: 'Full' },
] as const;

export default function ManualInputs() {
  const { config, saveManualInputs, isSaving } = usePresenceCoach();
  const existing = config.manual_inputs;

  const [beard, setBeard] = useState(existing?.has_beard ?? false);
  const [hair, setHair] = useState<ManualInputsType['hair_length']>(existing?.hair_length ?? 'short');
  const [skin, setSkin] = useState<ManualInputsType['skincare_routine']>(existing?.skincare_routine ?? 'none');

  const handleSave = async () => {
    try {
      await saveManualInputs({ has_beard: beard, hair_length: hair, skincare_routine: skin });
      toast.success('Manual inputs saved.');
    } catch {
      toast.error('Failed to save inputs.');
    }
  };

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Manual Inputs</p>
        <p className="text-[11px] text-muted-foreground">Optional. Enriches scan results if provided.</p>
      </div>

      {/* Beard */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Beard / Facial Hair</label>
        <div className="flex gap-2">
          {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
            <button
              key={l}
              onClick={() => setBeard(v)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                beard === v
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Hair Length */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Hair Length</label>
        <div className="flex gap-1.5">
          {HAIR_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setHair(opt.value)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                hair === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skincare */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Skincare Routine</label>
        <div className="flex gap-1.5">
          {SKIN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSkin(opt.value)}
              className={cn(
                'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                skin === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="w-full">
        Save Manual Inputs
      </Button>
    </div>
  );
}
