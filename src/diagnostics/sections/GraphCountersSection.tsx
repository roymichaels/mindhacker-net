import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Counts = {
  graphTotal: number | null;
  graph24h: number | null;
  patterns: number | null;
  identity: number | null;
  signals24h: number | null;
  loadedAt: number | null;
  error?: string;
};

const since24h = () => new Date(Date.now() - 24 * 3600_000).toISOString();

export default function GraphCountersSection({ active }: { active: boolean }) {
  const [c, setC] = useState<Counts>({
    graphTotal: null,
    graph24h: null,
    patterns: null,
    identity: null,
    signals24h: null,
    loadedAt: null,
  });

  const refresh = useCallback(async () => {
    try {
      const t = since24h();
      const [g, g24, p, idn, s24] = await Promise.all([
        supabase.from('aurora_memory_graph' as any).select('*', { count: 'exact', head: true }),
        supabase.from('aurora_memory_graph' as any).select('*', { count: 'exact', head: true }).gte('created_at', t),
        supabase.from('aurora_behavioral_patterns' as any).select('*', { count: 'exact', head: true }),
        supabase.from('aurora_identity_elements' as any).select('*', { count: 'exact', head: true }),
        supabase.from('aion_signals' as any).select('*', { count: 'exact', head: true }).gte('created_at', t),
      ]);
      setC({
        graphTotal: g.count ?? 0,
        graph24h: g24.count ?? 0,
        patterns: p.count ?? 0,
        identity: idn.count ?? 0,
        signals24h: s24.count ?? 0,
        loadedAt: Date.now(),
      });
    } catch (e: any) {
      setC((prev) => ({ ...prev, error: String(e?.message ?? e), loadedAt: Date.now() }));
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    void refresh();
    const id = window.setInterval(refresh, 30_000);
    return () => window.clearInterval(id);
  }, [active, refresh]);

  return (
    <div className="space-y-2 text-xs">
      <Row label="aurora_memory_graph" value={fmt(c.graphTotal)} />
      <Row label="… last 24h" value={fmt(c.graph24h)} />
      <Row label="aurora_behavioral_patterns" value={fmt(c.patterns)} />
      <Row label="aurora_identity_elements" value={fmt(c.identity)} />
      <Row label="aion_signals (24h)" value={fmt(c.signals24h)} />
      <Row label="loaded" value={c.loadedAt ? new Date(c.loadedAt).toLocaleTimeString() : '—'} />
      {c.error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-200">
          {c.error}
        </div>
      )}
      <button
        type="button"
        onClick={() => void refresh()}
        className="mt-2 w-full rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs text-foreground/90 hover:bg-card/60"
      >
        Refresh now
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground/90 break-all tabular-nums">{value}</span>
    </div>
  );
}

function fmt(n: number | null): string {
  return n == null ? '…' : String(n);
}