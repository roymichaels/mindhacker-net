/**
 * @tab Life
 * @purpose Top 3 levers + today/week/90-day diagnosis panel.
 * @data Receives PresenceAssessmentResult as props.
 */

import { Target, Zap, Calendar } from 'lucide-react';
import type { PresenceAssessmentResult } from '@/lib/presence/types';

interface PresenceDiagnosisProps {
  result: PresenceAssessmentResult;
}

export default function PresenceDiagnosis({ result }: PresenceDiagnosisProps) {
  const { top_levers, diagnosis } = result;

  return (
    <div className="space-y-6">
      {/* Top 3 Levers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Top 3 Leverage Points</h3>
        </div>
        <div className="space-y-2">
          {top_levers.map((lever, i) => (
            <div key={lever.leverId} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
              <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{lever.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{lever.why}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>Impact: {lever.impact}/5</span>
                  <span>Effort: {lever.effort}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-foreground">What To Do Today</h3>
        </div>
        <div className="space-y-1">
          {diagnosis.today.map((action, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-card border border-border text-sm text-foreground">
              {action}
            </div>
          ))}
        </div>
      </div>

      {/* This Week */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">This Week</h3>
        </div>
        <div className="space-y-1">
          {diagnosis.this_week.map((action, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-card border border-border text-xs text-foreground">
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
