/**
 * @tab Life
 * @purpose Assessment mode selector: Quick / Full / Deep cards.
 * @data None — purely UI, emits selected mode.
 */

import { Clock, Camera, Video, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssessmentMode } from '@/lib/presence/types';

const MODES: { mode: AssessmentMode; title: string; time: string; icon: typeof Clock; description: string; needs: string; gets: string }[] = [
  {
    mode: 'quick',
    title: 'Quick Check',
    time: '2-3 min',
    icon: Clock,
    description: 'Self-reported questionnaire. No photos needed.',
    needs: 'Just your answers',
    gets: 'Score + Routine + Plan (low confidence)',
  },
  {
    mode: 'full',
    title: 'Full Assessment',
    time: '8-12 min',
    icon: Camera,
    description: 'Questionnaire + AI photo analysis for precise metrics.',
    needs: 'Camera or photos (face + body)',
    gets: 'Score + AI Metrics + Routine + Plan (med-high confidence)',
  },
  {
    mode: 'deep',
    title: 'Deep Scan',
    time: '5-10 min',
    icon: Video,
    description: 'Full assessment + extra captures + optional video.',
    needs: 'Camera + optional video clips',
    gets: 'Score + Deep Metrics + Routine + Plan (high confidence)',
  },
];

interface AssessmentSetupProps {
  onSelect: (mode: AssessmentMode) => void;
}

export default function AssessmentSetup({ onSelect }: AssessmentSetupProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-xl font-bold text-foreground">Choose Assessment Mode</h2>
        <p className="text-sm text-muted-foreground">Select based on your available time and comfort level.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODES.map(m => (
          <div
            key={m.mode}
            className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <m.icon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">{m.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{m.description}</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-[3rem]">Time:</span>
                <span className="text-foreground">{m.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-[3rem]">Need:</span>
                <span className="text-foreground">{m.needs}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground font-medium min-w-[3rem]">Get:</span>
                <span className="text-foreground">{m.gets}</span>
              </div>
            </div>

            <Button onClick={() => onSelect(m.mode)} className="w-full" size="sm">
              Start <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-center text-muted-foreground mt-4">
        This is an estimate. Not medical advice. Lighting and angle affect results.
      </p>
    </div>
  );
}
