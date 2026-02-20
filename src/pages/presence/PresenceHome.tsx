/**
 * @tab Life
 * @purpose Presence Pillar Home — Scan CTA + Manual Inputs + Last Scan panel.
 */
import { PageShell } from '@/components/aurora-ui/PageShell';
import { usePresenceCoach } from '@/hooks/usePresenceCoach';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Loader2, ScanLine, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ManualInputs from '@/components/presence/ManualInputs';

export default function PresenceHome() {
  const navigate = useNavigate();
  const { config, isLoading } = usePresenceCoach();
  const latest = config.latest_scan;

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
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/life')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Eye className="w-6 h-6 text-rose-500" />
          <h1 className="text-2xl font-bold text-foreground">Presence</h1>
        </div>

        {/* Primary CTA — Presence Scan */}
        <div className="p-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Presence Scan</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            AI visual assessment of face structure, posture, grooming baseline, body composition signals.
          </p>
          <Button onClick={() => navigate('/life/presence/scan')} className="w-full" size="lg">
            Begin Scan <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Manual Inputs (optional enrichment) */}
        <ManualInputs />

        {/* Last Scan Panel */}
        {latest && (
          <div className="p-4 rounded-2xl border border-border bg-card">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Your Last Scan</p>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${latest.presence_index >= 70 ? 'text-emerald-500' : latest.presence_index >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {latest.presence_index}
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {latest.confidence} confidence
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(latest.assessed_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/life/presence/scan')} className="flex-1">
                Re-scan
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/life/presence/results')} className="flex-1">
                View Results
              </Button>
            </div>
          </div>
        )}

        {/* Completion badge */}
        {config.completed && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <p className="text-sm font-medium text-emerald-600">✓ Presence Assessment Complete</p>
          </div>
        )}

        {/* Info note */}
        <p className="text-xs text-muted-foreground text-center">
          Plans are generated after all pillars are assessed.
        </p>
      </div>
    </PageShell>
  );
}
