import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { diagnosticsBus, type MemoryWriterEvent } from '../diagnosticsBus';

export default function MemoryWriterSection() {
  const [last, setLast] = useState<MemoryWriterEvent | undefined>(() =>
    diagnosticsBus.last('memory-writer'),
  );
  const [pinging, setPinging] = useState(false);

  useEffect(() => diagnosticsBus.on('memory-writer', setLast), []);

  const ping = async () => {
    setPinging(true);
    const startedAt = Date.now();
    diagnosticsBus.emit('memory-writer', {
      source: 'chat',
      status: 'pending',
      startedAt,
    });
    try {
      const { data, error } = await supabase.functions.invoke('memory-writer', {
        body: {
          source: 'chat',
          context: {
            messages: [
              { role: 'user', content: 'diag ping — verify memory-writer pipeline' },
              { role: 'assistant', content: 'noted; this is a diagnostics test write' },
            ],
          },
        },
      });
      const writes = (data as any)?.writes?.graph as Array<{ action: string }> | undefined;
      diagnosticsBus.emit('memory-writer', {
        source: 'chat',
        status: error ? 'error' : 'ok',
        startedAt,
        durationMs: Date.now() - startedAt,
        inserted: writes?.filter((w) => w.action === 'inserted').length ?? 0,
        reinforced: writes?.filter((w) => w.action === 'reinforced').length ?? 0,
        skipped: writes?.filter((w) => w.action === 'skipped').length ?? 0,
        error: error?.message,
        raw: data,
      });
    } catch (e: any) {
      diagnosticsBus.emit('memory-writer', {
        source: 'chat',
        status: 'error',
        startedAt,
        durationMs: Date.now() - startedAt,
        error: String(e?.message ?? e),
      });
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      {!last ? (
        <div className="italic text-muted-foreground">No invocation yet.</div>
      ) : (
        <>
          <Row label="source" value={last.source} />
          <Row
            label="status"
            value={
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                  last.status === 'ok'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : last.status === 'pending'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {last.status}
              </span>
            }
          />
          <Row label="duration" value={last.durationMs != null ? `${last.durationMs} ms` : '—'} />
          <Row label="inserted" value={String(last.inserted ?? 0)} />
          <Row label="reinforced" value={String(last.reinforced ?? 0)} />
          <Row label="skipped" value={String(last.skipped ?? 0)} />
          <Row label="when" value={new Date(last.startedAt).toLocaleTimeString()} />
          {last.error && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-200">
              {last.error}
            </div>
          )}
        </>
      )}
      <button
        type="button"
        onClick={ping}
        disabled={pinging}
        className="mt-2 w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs text-foreground/90 hover:bg-card/60 disabled:opacity-50"
      >
        {pinging ? 'pinging…' : 'Test write (diag ping)'}
      </button>
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