/**
 * @tab Life
 * @purpose Morning / Daytime / Evening routine checklist with completion tracking.
 * @data Uses ActiveRoutine items, emits completed item IDs.
 */

import { useState, useEffect } from 'react';
import { Sun, Clock, Moon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { RoutineItem } from '@/lib/presence/types';
import { groupByBlock } from '@/lib/presence/routineBuilder';

const BLOCK_META = {
  morning: { label: 'Morning', icon: Sun, color: 'text-amber-500' },
  daytime: { label: 'Daytime Micro-Cues', icon: Clock, color: 'text-primary' },
  evening: { label: 'Evening', icon: Moon, color: 'text-violet-500' },
} as const;

interface RoutineChecklistProps {
  items: RoutineItem[];
  completedToday: string[];
  onSave: (completed: string[]) => void;
  isSaving: boolean;
}

export default function RoutineChecklist({ items, completedToday, onSave, isSaving }: RoutineChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set(completedToday));

  useEffect(() => {
    setChecked(new Set(completedToday));
  }, [completedToday]);

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const blocks = groupByBlock(items);
  const total = items.length;
  const done = checked.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="p-4 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Today's Progress</span>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{done}/{total} items completed</p>
      </div>

      {/* Blocks */}
      {(['morning', 'daytime', 'evening'] as const).map(block => {
        const blockItems = blocks[block];
        if (blockItems.length === 0) return null;
        const meta = BLOCK_META[block];

        return (
          <div key={block} className="space-y-2">
            <div className="flex items-center gap-2">
              <meta.icon className={`w-5 h-5 ${meta.color}`} />
              <h3 className="font-bold text-foreground text-sm">{meta.label}</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {blockItems.reduce((s, i) => s + i.duration_min, 0)} min
              </span>
            </div>
            <div className="space-y-1">
              {blockItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                    checked.has(item.id)
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-border bg-card hover:border-primary/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    checked.has(item.id) ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {checked.has(item.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${checked.has(item.id) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {item.title}
                    </p>
                    {item.duration_min > 0 && (
                      <p className="text-[10px] text-muted-foreground">{item.duration_min} min</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      <Button
        onClick={() => onSave(Array.from(checked))}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Progress'}
      </Button>
    </div>
  );
}
