import { useEffect, useState } from 'react';
import { diagnosticsBus, type ResponseSourceEvent } from '../diagnosticsBus';

export default function ResponseSourceSection() {
  const [last, setLast] = useState<ResponseSourceEvent | undefined>(() =>
    diagnosticsBus.last('response-source'),
  );
  useEffect(() => diagnosticsBus.on('response-source', setLast), []);

  if (!last) {
    return <div className="text-xs italic text-muted-foreground">No assistant reply observed yet.</div>;
  }

  const tone =
    last.source === 'live'
      ? 'bg-emerald-500/15 text-emerald-300'
      : last.source === 'fallback'
      ? 'bg-rose-500/15 text-rose-300'
      : 'bg-amber-500/15 text-amber-300';

  return (
    <div className="space-y-2 text-xs">
      <Row
        label="source"
        value={
          <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${tone}`}>
            {last.source}
          </span>
        }
      />
      <Row label="mode" value={last.mode} />
      <Row label="greeting downgrade" value={last.greeting ? 'yes (lite)' : 'no'} />
      <Row label="degraded" value={last.degraded ? 'yes' : 'no'} />
      <Row label="history messages" value={String(last.historyCount ?? 0)} />
      <Row label="assistant history" value={String(last.assistantHistoryCount ?? 0)} />
      <Row label="history filtered" value={String(last.historyFilteredCount ?? 0)} />
      <Row label="task source" value={last.taskSource ?? 'unknown'} />
      <Row label="current time" value={last.currentTime ?? 'unknown'} />
      <Row label="daily briefing" value={last.dailyBriefingSource ?? 'unknown'} />
      <Row label="proactive queue" value={last.proactiveUsed ? 'used' : 'not used'} />
      <Row label="cached response" value={last.cachedResponse ? 'yes' : 'no'} />
      <Row
        label="duplicate of previous"
        value={
          last.duplicateOfPrevious ? (
            <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-rose-300">
              yes — likely scripted
            </span>
          ) : (
            'no'
          )
        }
      />
      <Row label="when" value={new Date(last.at).toLocaleTimeString()} />
      {last.preview && (
        <details className="rounded-md border border-border/40 bg-card/30 p-2">
          <summary className="cursor-pointer text-muted-foreground">preview (first 240ch)</summary>
          <pre className="mt-1 whitespace-pre-wrap break-all text-[10px] text-foreground/80">
            {last.preview}
          </pre>
        </details>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground/90 break-all">{value}</span>
    </div>
  );
}
