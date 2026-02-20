/**
 * @tab Life
 * @purpose Sub-score card for Presence Coach showing score, confidence, observations, and levers.
 * @data Receives SubScore data as props.
 */

import { cn } from '@/lib/utils';
import type { SubScore } from '@/lib/presence/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const SUB_SCORE_LABELS: Record<string, string> = {
  face_structure: 'Face Structure & Definition',
  posture_frame: 'Posture & Frame',
  body_composition: 'Body Composition',
  skin_routine: 'Skin Routine',
  hair_grooming: 'Hair & Grooming',
  style_fit: 'Style & Fit',
  dental_smile: 'Dental / Smile',
};

interface SubScoreCardProps {
  scoreKey: string;
  data: SubScore;
}

export default function SubScoreCard({ scoreKey, data }: SubScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const label = SUB_SCORE_LABELS[scoreKey] ?? scoreKey;

  const getColor = (s: number) => {
    if (s >= 75) return 'text-emerald-500';
    if (s >= 55) return 'text-amber-500';
    return 'text-red-500';
  };

  const getBarColor = (s: number) => {
    if (s >= 75) return 'bg-emerald-500';
    if (s >= 55) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm text-foreground">{label}</h4>
            <div className="flex items-center gap-2">
              <span className={cn('text-lg font-bold', getColor(data.score))}>{data.score}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {data.confidence}
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', getBarColor(data.score))}
              style={{ width: `${data.score}%` }}
            />
          </div>
        </div>
        <div className="ml-2">
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {data.keyObservations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Observations</p>
              <ul className="space-y-1">
                {data.keyObservations.map((obs, i) => (
                  <li key={i} className="text-xs text-foreground">• {obs}</li>
                ))}
              </ul>
            </div>
          )}
          {data.topLevers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Top Levers</p>
              {data.topLevers.map((lever, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 mb-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{lever.title}</span>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>Impact: {lever.impact}/5</span>
                      <span>Effort: {lever.effort}/5</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{lever.why}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
