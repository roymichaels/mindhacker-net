import { useEffect, useState } from 'react';
import { useAionDecision } from '@/contexts/AionDecisionContext';
import { diagnosticsBus, type BrainRunEvent } from '../diagnosticsBus';

export default function BrainSection() {
  const { decision, lastBrainRunAt, isFallback, refresh } = useAionDecision();
  const [lastRun, setLastRun] = useState<BrainRunEvent | undefined>(() =>
    diagnosticsBus.last('brain-run'),
  );
  useEffect(() => diagnosticsBus.on('brain-run', setLastRun), []);

  const fallbackBadge = isFallback ? (
    <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-300">
      RUNNING ON FALLBACK — fast-tier rules in control
    </div>
  ) : null;

  const refreshBtn = (
    <button
      type="button"
      onClick={() => { void refresh(); }}
      className="rounded-md border border-border/40 bg-card/40 px-2 py-1 text-[10px] uppercase tracking-wide text-foreground/80 hover:bg-card/70"
    >
      Force brain run
    </button>
  );

  if (!decision) {
    return (
      <div className="space-y-2 text-xs">
        {fallbackBadge}
        <Empty label="No decision yet — fast-tier rules in control" />
        <Row label="last brain run" value={fmtAbs(lastBrainRunAt)} />
        {lastRun && <Row label="last run status" value={`${lastRun.status} (${lastRun.trigger})`} />}
        <div className="pt-1">{refreshBtn}</div>
      </div>
    );
  }

  const expiresAt = decision.expires_at ? Date.parse(decision.expires_at) : null;
  const live = !expiresAt || expiresAt > Date.now();
  const ttlMs = expiresAt ? expiresAt - Date.now() : null;
  const updatedAtMs = decision.updated_at ? Date.parse(decision.updated_at) : null;

  return (
    <div className="space-y-2 text-xs">
      {fallbackBadge}
      <Row label="mode" value={decision.mode} />
      <Row label="tone" value={decision.tone} />
      <Row label="density" value={decision.density} />
      <Row
        label="source"
        value={
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              (decision as any).source === 'llm'
                ? 'bg-emerald-500/15 text-emerald-300'
                : (decision as any).source === 'heuristic'
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-muted/30 text-muted-foreground'
            }`}
          >
            {(decision as any).source ?? 'unknown'}
          </span>
        }
      />
      <Row label="expires" value={fmtTtl(ttlMs)} />
      <Row label="updated" value={fmtAbs(updatedAtMs)} />
      <Row label="last brain run" value={fmtAbs(lastBrainRunAt)} />
      {lastRun && (
        <Row
          label="last run"
          value={`${lastRun.status} · ${lastRun.trigger}${lastRun.durationMs != null ? ` · ${lastRun.durationMs}ms` : ''}`}
        />
      )}
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
      <div className="pt-1">{refreshBtn}</div>
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

function fmtAbs(ms: number | null): string {
  if (!ms) return 'never (this session)';
  const ago = Date.now() - ms;
  const t = new Date(ms).toLocaleTimeString();
  if (ago < 60_000) return `${t} (${Math.round(ago / 1000)}s ago)`;
  if (ago < 3_600_000) return `${t} (${Math.round(ago / 60_000)}m ago)`;
  return `${t} (${Math.round(ago / 3_600_000)}h ago)`;
}