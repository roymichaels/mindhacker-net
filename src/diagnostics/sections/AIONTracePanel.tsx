/**
 * AION Phase 1 — Turn Trace Panel.
 *
 * Dev-only section inside DiagnosticsSheet. Reads the user's last 20 turn
 * traces and their detailed events from `aion_turn_traces` /
 * `aion_turn_trace_events`. Live-updates via Supabase Realtime.
 *
 * Read-only: never mutates any chat behavior.
 */
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TraceRow {
  trace_id: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  status: string;
  input_preview: string | null;
  intent: string | null;
  emotion: string | null;
  router_decision: string | null;
  capability: string | null;
  artifact_kind: string | null;
  language: string | null;
  mode: string | null;
  lanes: string | null;
  pillar: string | null;
  graph_writes: number | null;
  signals_written: number | null;
  pillar_deltas: any;
  brain_refreshed: boolean;
  sanitizer: any;
  repetition: any;
  errors: any;
  route: string | null;
}

interface EventRow {
  trace_id: string;
  at: string;
  source: string;
  stage: string;
  data: any;
}

export default function AIONTracePanel() {
  const { user } = useAuth();
  const [traces, setTraces] = useState<TraceRow[]>([]);
  const [events, setEvents] = useState<Record<string, EventRow[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;

    void (async () => {
      const { data } = await supabase
        .from('aion_turn_traces')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(20);
      if (alive && data) setTraces(data as any);
    })();

    const ch = supabase
      .channel(`aion-traces:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'aion_turn_traces', filter: `user_id=eq.${user.id}` },
        (p: any) => {
          const row: TraceRow = p.new ?? p.old;
          if (!row?.trace_id) return;
          setTraces((prev) => {
            const idx = prev.findIndex((t) => t.trace_id === row.trace_id);
            if (idx === -1) return [row, ...prev].slice(0, 20);
            const next = prev.slice();
            next[idx] = { ...next[idx], ...row };
            return next;
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'aion_turn_trace_events', filter: `user_id=eq.${user.id}` },
        (p: any) => {
          const row: EventRow = p.new;
          if (!row?.trace_id) return;
          setEvents((prev) => {
            const list = prev[row.trace_id] ?? [];
            return { ...prev, [row.trace_id]: [...list, row] };
          });
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
  }, [user?.id]);

  async function loadEvents(traceId: string) {
    if (events[traceId]) return;
    const { data } = await supabase
      .from('aion_turn_trace_events')
      .select('*')
      .eq('trace_id', traceId)
      .order('at', { ascending: true });
    if (data) setEvents((p) => ({ ...p, [traceId]: data as any }));
  }

  if (!user) return <p className="text-xs text-muted-foreground">Sign in to view traces.</p>;
  if (traces.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No traces yet. Enable with{' '}
        <code className="rounded bg-muted/40 px-1">localStorage.setItem('ff_aion_trace','1')</code>{' '}
        and set <code className="rounded bg-muted/40 px-1">AION_TRACE=1</code> server-side.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {traces.map((t) => (
        <TraceItem
          key={t.trace_id}
          row={t}
          open={openId === t.trace_id}
          onToggle={() => {
            const next = openId === t.trace_id ? null : t.trace_id;
            setOpenId(next);
            if (next) void loadEvents(t.trace_id);
          }}
          events={events[t.trace_id] ?? []}
        />
      ))}
    </ul>
  );
}

function TraceItem({
  row,
  open,
  onToggle,
  events,
}: {
  row: TraceRow;
  open: boolean;
  onToggle: () => void;
  events: EventRow[];
}) {
  const time = new Date(row.started_at).toLocaleTimeString();
  const status = row.status === 'error' ? '🔴' : row.status === 'open' ? '🟡' : '🟢';
  const dur = row.duration_ms != null ? `${row.duration_ms}ms` : '…';
  const cap = row.capability ?? 'reply-only';
  const art = row.artifact_kind ?? '—';

  const t0 = useMemo(() => (events[0] ? new Date(events[0].at).getTime() : 0), [events]);

  return (
    <li className="rounded-lg border border-border/40 bg-background/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px]"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span className="text-muted-foreground">{time}</span>
        <span>{status}</span>
        <span className="rounded bg-muted/40 px-1 font-medium">{row.intent ?? '—'}</span>
        <span className="text-muted-foreground">cap: {cap}</span>
        <span className="text-muted-foreground">art: {art}</span>
        <span className="ms-auto text-muted-foreground">{dur}</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-border/30 px-2 py-2 text-[11px]">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
            <div>route: <span className="text-foreground">{row.route ?? '—'}</span></div>
            <div>mode: <span className="text-foreground">{row.mode ?? '—'}</span></div>
            <div>lanes: <span className="text-foreground">{row.lanes ?? '—'}</span></div>
            <div>pillar: <span className="text-foreground">{row.pillar ?? '—'}</span></div>
            <div>emotion: <span className="text-foreground">{row.emotion ?? '—'}</span></div>
            <div>brain: <span className="text-foreground">{row.brain_refreshed ? 'refreshed' : 'skipped'}</span></div>
            <div>graph writes: <span className="text-foreground">{row.graph_writes ?? 0}</span></div>
            <div>signals: <span className="text-foreground">{row.signals_written ?? 0}</span></div>
          </div>
          {row.input_preview && (
            <p className="rounded bg-muted/30 px-2 py-1 text-foreground/80">"{row.input_preview}"</p>
          )}
          {Array.isArray(row.errors) && row.errors.length > 0 && (
            <pre className="overflow-auto rounded bg-destructive/10 px-2 py-1 text-destructive">
              {JSON.stringify(row.errors, null, 2)}
            </pre>
          )}
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Timeline ({events.length})</p>
            <ol className="space-y-0.5 font-mono text-[10px]">
              {events.map((e, i) => {
                const dt = t0 ? new Date(e.at).getTime() - t0 : 0;
                return (
                  <li key={i} className="flex gap-2">
                    <span className="w-12 text-muted-foreground">+{dt}ms</span>
                    <span className="w-24 text-muted-foreground">{e.source}</span>
                    <span className="w-32 text-foreground">{e.stage}</span>
                    <span className="flex-1 truncate text-muted-foreground">
                      {e.data && Object.keys(e.data).length > 0 ? JSON.stringify(e.data) : ''}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(JSON.stringify({ row, events }, null, 2))}
            className="inline-flex items-center gap-1 rounded bg-muted/40 px-2 py-0.5 text-[10px] text-foreground/80 hover:bg-muted/60"
          >
            <Copy className="h-3 w-3" /> copy trace JSON
          </button>
        </div>
      )}
    </li>
  );
}
