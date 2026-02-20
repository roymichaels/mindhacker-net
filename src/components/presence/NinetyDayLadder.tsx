/**
 * @tab Life
 * @purpose 90-Day Presence Ladder showing Phase 1/2/3 visual progression.
 * @data Receives diagnosis phases as props.
 */

import { Flag } from 'lucide-react';
import type { PresenceDiagnosisActions } from '@/lib/presence/types';

interface NinetyDayLadderProps {
  phases: PresenceDiagnosisActions['ninety_day_phases'];
}

const PHASE_COLORS = [
  'border-amber-500/50 bg-amber-500/5',
  'border-primary/50 bg-primary/5',
  'border-emerald-500/50 bg-emerald-500/5',
];

const PHASE_DOT_COLORS = ['bg-amber-500', 'bg-primary', 'bg-emerald-500'];

export default function NinetyDayLadder({ phases }: NinetyDayLadderProps) {
  const phaseList = [phases.phase1, phases.phase2, phases.phase3];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flag className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">90-Day Presence Ladder</h3>
      </div>

      <div className="space-y-3">
        {phaseList.map((phase, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${PHASE_COLORS[i]}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${PHASE_DOT_COLORS[i]}`} />
              <span className="text-sm font-bold text-foreground">{phase.label}</span>
              <span className="text-xs text-muted-foreground ml-auto">{phase.weeks}</span>
            </div>
            <ul className="space-y-1">
              {phase.actions.map((action, j) => (
                <li key={j} className="text-xs text-foreground">• {action}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
