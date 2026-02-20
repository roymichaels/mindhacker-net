/**
 * @component FindingsList
 * @purpose Displays max 6 concise finding bullets from scan.
 */
import { AlertTriangle } from 'lucide-react';
import type { Finding } from '@/lib/presence/types';

interface FindingsListProps {
  findings: Finding[];
}

export default function FindingsList({ findings }: FindingsListProps) {
  const getSeverityColor = (s: Finding['severity']) => {
    if (s === 'notable') return 'text-red-500';
    if (s === 'moderate') return 'text-amber-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="font-bold text-foreground text-sm">Findings</h3>
      </div>
      <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
        {findings.map(f => (
          <div key={f.id} className="flex items-start gap-2">
            <span className={`text-xs mt-0.5 ${getSeverityColor(f.severity)}`}>•</span>
            <p className="text-sm text-foreground">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
