import { useEnvironment } from '@/orchestration';
import { useAionDecision } from '@/contexts/AionDecisionContext';

export default function EnvironmentSection() {
  const { state, enabled } = useEnvironment();
  const { isFallback } = useAionDecision();
  const sourceIsFastTier = (state.source || '').toLowerCase().includes('fast');
  const showFallbackBadge = isFallback || sourceIsFastTier;
  return (
    <div className="space-y-2 text-xs">
      {showFallbackBadge && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-300">
          RUNNING ON FALLBACK — no live brain decision
        </div>
      )}
      <Row label="enabled" value={String(enabled)} />
      <Row label="mode" value={state.mode} />
      <Row label="cognitiveBudget" value={state.cognitiveBudget} />
      <Row label="emotionalTone" value={state.emotionalTone} />
      <Row label="intensity" value={String(state.intensity)} />
      <Row label="source" value={state.source} />
      <Row label="reason" value={state.reason || '—'} />
      <Row label="updatedAt" value={state.updatedAt ? new Date(state.updatedAt).toLocaleTimeString() : '—'} />
      <Row label="hidden chrome" value={state.hidden?.length ? state.hidden.join(', ') : '∅'} />
      {state.orb && (
        <details className="rounded-md border border-border/40 bg-card/30 p-2">
          <summary className="cursor-pointer text-muted-foreground">orb</summary>
          <pre className="mt-1 whitespace-pre-wrap text-[10px] text-foreground/80">
            {JSON.stringify(state.orb, null, 2)}
          </pre>
        </details>
      )}
      {state.aionDecision && (
        <details className="rounded-md border border-border/40 bg-card/30 p-2" open>
          <summary className="cursor-pointer text-muted-foreground">aionDecision (binding proof)</summary>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all text-[10px] text-foreground/80">
            {JSON.stringify(state.aionDecision, null, 2)}
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