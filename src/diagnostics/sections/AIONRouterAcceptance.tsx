/**
 * AION Router Acceptance — dev-only Phase F Phase 1 harness.
 *
 * Runs the 5 acceptance prompts through `routeObserve` and renders the
 * decision matrix. Pure client-side; does not touch the chat turn or DB.
 */
import { useMemo } from 'react';
import { routeObserve } from '@/orchestration/router/observeRouter';

const PROMPTS: string[] = [
  'מה כדאי לי לעשות היום?',
  'אני תקוע',
  'תראה לי את המוח שלי',
  'תבנה לי עסק',
  'אני רוצה לישון יותר טוב',
];

export default function AIONRouterAcceptance() {
  const rows = useMemo(
    () => PROMPTS.map((p) => ({ prompt: p, decision: routeObserve({ content: p, route: '/aurora', language: 'he' }) })),
    [],
  );

  return (
    <section className="rounded-2xl bg-white/5 p-3 space-y-2 text-[11px]" dir="rtl">
      <header className="text-xs font-semibold text-foreground">AION Router · Acceptance</header>
      <p className="text-muted-foreground text-[10px]">
        Observe-mode only. Every row is a candidate the router would emit; no execution.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-start py-1">Prompt</th>
              <th className="text-start">Capability</th>
              <th className="text-start">Artifact</th>
              <th className="text-start">Mode</th>
              <th className="text-start">Reason</th>
              <th className="text-start">Skipped</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.prompt} className="border-t border-white/5">
                <td className="py-1 align-top max-w-[160px] truncate" title={r.prompt}>{r.prompt}</td>
                <td className="align-top">{r.decision.capability ?? '—'}</td>
                <td className="align-top">{r.decision.artifactKind ?? '—'}</td>
                <td className="align-top">{r.decision.mode}</td>
                <td className="align-top text-muted-foreground">{r.decision.reason}</td>
                <td className="align-top">{r.decision.skippedReason ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}