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