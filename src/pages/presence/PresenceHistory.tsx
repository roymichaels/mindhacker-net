/**
 * @tab Life
 * @purpose Scan history + trend visualization.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PresenceHistory() {
  const navigate = useNavigate();
  const { config, isLoading } = usePresenceCoach();
  const all = [config.latest_scan, ...(config.scan_history ?? [])].filter(Boolean);

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life/presence')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Scan History</h1>
        </div>

        {all.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">No scans yet.</p>
            <Button onClick={() => navigate('/life/presence/scan')}>Start Scan</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {all.length > 1 && (
              <div className="p-4 rounded-2xl border border-border bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-foreground text-sm">Score Trend</h3>
                </div>
                <div className="flex items-end gap-1 h-24">
                  {all.slice().reverse().map((a, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-foreground font-bold">{a!.presence_index}</span>
                      <div className="w-full rounded-t" style={{ height: `${a!.presence_index}%` }}>
                        <div className="w-full h-full bg-primary rounded-t" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {all.map((a, i) => (
              <div key={i} className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Score: {a!.presence_index}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(a!.assessed_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {a!.confidence}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
