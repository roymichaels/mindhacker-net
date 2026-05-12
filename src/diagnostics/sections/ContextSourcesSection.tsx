import { useEffect, useState } from 'react';
import { diagnosticsBus, type ResponseSourceEvent } from '../diagnosticsBus';

export default function ContextSourcesSection() {
  const [last, setLast] = useState<ResponseSourceEvent | undefined>(() =>
    diagnosticsBus.last('response-source'),
  );

  useEffect(() => diagnosticsBus.on('response-source', setLast), []);

  if (!last) {
    return <div className="text-xs italic text-muted-foreground">No context-source snapshot yet.</div>;
  }

  return (
    <div className="space-y-2 text-xs">
      <Row label="intent" value={<IntentChip value={last.intent} />} />
      <LaneGrid lanes={last.lanes ?? ''} />
      <Row label="history messages" value={String(last.historyCount ?? 0)} />
      <Row label="assistant history" value={String(last.assistantHistoryCount ?? 0)} />
      <Row label="history filtered" value={String(last.historyFilteredCount ?? 0)} />
      <Row label="task source" value={last.taskSource ?? 'unknown'} />
      <Row label="current time" value={last.currentTime ?? 'unknown'} />
      <Row label="daily briefing" value={last.dailyBriefingSource ?? 'unknown'} />
      <Row label="proactive queue" value={last.proactiveUsed ? 'used' : 'not used'} />
      <Row label="cached response" value={last.cachedResponse ? 'yes' : 'no'} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-all text-right text-foreground/90">{value}</span>
    </div>
  );
}

const ALL_LANES = ['live', 'memory', 'planning', 'proactive', 'execution', 'analytics'] as const;

function LaneGrid({ lanes }: { lanes: string }) {
  const active = new Set(lanes.split(',').filter(Boolean));
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {ALL_LANES.map((l) => {
        const on = active.has(l);
        return (
          <span
            key={l}
            className={
              'rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ' +
              (on
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'bg-muted/30 text-muted-foreground line-through opacity-60')
            }
          >
            {on ? '✓' : '✗'} {l}
          </span>
        );
      })}
    </div>
  );
}

function IntentChip({ value }: { value?: string }) {
  const v = value || 'unknown';
  return (
    <span className="rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
      {v}
    </span>
  );
}