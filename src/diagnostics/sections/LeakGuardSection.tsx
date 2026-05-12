import { useEffect, useState } from 'react';
import { diagnosticsBus, type LeakGuardEvent } from '../diagnosticsBus';

export default function LeakGuardSection() {
  const [last, setLast] = useState<LeakGuardEvent | undefined>(() =>
    diagnosticsBus.last('leak-guard'),
  );
  useEffect(() => diagnosticsBus.on('leak-guard', setLast), []);

  if (!last) {
    return <div className="text-xs italic text-muted-foreground">No assistant message observed yet.</div>;
  }

  return (
    <div className="space-y-2 text-xs">
      <Row
        label="status"
        value={
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              last.status === 'clean'
                ? 'bg-emerald-500/15 text-emerald-300'
                : last.status === 'sanitized'
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {last.status}
          </span>
        }
      />
      <Row label="raw length" value={`${last.rawLen} ch`} />
      <Row label="clean length" value={`${last.cleanLen} ch`} />
      <Row label="trimmed" value={`${last.rawLen - last.cleanLen} ch`} />
      <Row label="when" value={new Date(last.at).toLocaleTimeString()} />
      <Row
        label="matched patterns"
        value={last.matched.length ? last.matched.join(', ') : '∅'}
      />
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