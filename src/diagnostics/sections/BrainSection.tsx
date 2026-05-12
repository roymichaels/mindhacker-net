import { useAionDecision } from '@/contexts/AionDecisionContext';

export default function BrainSection() {
  const { decision } = useAionDecision();

  if (!decision) {
    return (
      <Empty label="No decision yet — fast-tier rules in control" />
    );
  }

  const expiresAt = decision.expires_at ? Date.parse(decision.expires_at) : null;
  const live = !expiresAt || expiresAt > Date.now();
  const ttlMs = expiresAt ? expiresAt - Date.now() : null;

  return (
    <div className="space-y-2 text-xs">
      <Row label="mode" value={decision.mode} />
      <Row label="tone" value={decision.tone} />
      <Row label="density" value={decision.density} />
      <Row label="expires" value={fmtTtl(ttlMs)} />
      <Row
        label="status"
        value={
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              live
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-rose-500/15 text-rose-300'
            }`}
          >
            {live ? 'live' : 'expired'}
          </span>
        }
      />
      <Json label="focus_target" value={decision.focus_target} />
      <Json label="suggestion" value={decision.suggestion} />
      {decision.reasoning && <Row label="reasoning" value={decision.reasoning} />}
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

function Json({ label, value }: { label: string; value: unknown }) {
  const empty = !value || (typeof value === 'object' && Object.keys(value as object).length === 0);
  if (empty) return <Row label={label} value={<span className="text-muted-foreground">∅</span>} />;
  return (
    <details className="rounded-md border border-border/40 bg-card/30 p-2">
      <summary className="cursor-pointer text-muted-foreground">{label}</summary>
      <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-foreground/80">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="text-xs italic text-muted-foreground">{label}</div>;
}

function fmtTtl(ms: number | null): string {
  if (ms == null) return '—';
  if (ms <= 0) return `expired ${Math.round(-ms / 1000)}s ago`;
  if (ms < 60_000) return `in ${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `in ${Math.round(ms / 60_000)}m`;
  return `in ${Math.round(ms / 3_600_000)}h`;
}